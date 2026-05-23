import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notifyClients } from '@/app/api/sse/route'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event, idempotencyKey } = body

    if (!idempotencyKey) {
      return NextResponse.json({ error: 'idempotencyKey is required' }, { status: 400 })
    }

    if (event !== 'payment_success') {
      return NextResponse.json({ error: 'Unknown event' }, { status: 400 })
    }

    // Check if this webhook was already processed
    const existing = await prisma.webhookEvent.findUnique({
      where: { id: idempotencyKey },
    })

    if (existing) {
      return NextResponse.json({
        message: `Already processed (idempotent) — no changes made`,
        alreadyProcessed: true,
      })
    }

    // Record the webhook event first
    await prisma.webhookEvent.create({
      data: { id: idempotencyKey },
    })

    // Reset all providers quota
    await prisma.provider.updateMany({
      data: { leadsReceived: 0, monthlyQuota: 10 },
    })

    notifyClients()

    return NextResponse.json({
      message: 'Quota reset successfully for all providers',
      alreadyProcessed: false,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}