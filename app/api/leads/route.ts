import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notifyClients } from '@/app/api/sse/route'

// Mandatory provider rules per service
const MANDATORY: Record<number, number[]> = {
  1: [1],
  2: [5],
  3: [1, 4],
}

// Fair pool per service
const POOL: Record<number, number[]> = {
  1: [2, 3, 4],
  2: [6, 7, 8],
  3: [2, 3, 5, 6, 7, 8],
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, phone, city, serviceId, description } = body

    if (!name || !phone || !city || !serviceId || !description) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Check duplicate
    const existing = await prisma.lead.findUnique({
      where: { phone_serviceId: { phone, serviceId } },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'This phone number already has a lead for this service' },
        { status: 409 }
      )
    }

    // Use a transaction for concurrency safety
    const result = await prisma.$transaction(async (tx: any) => {
      // Create the lead
      const lead = await tx.lead.create({
        data: { name, phone, city, serviceId, description },
      })

      // Get all providers with quota remaining
      const providers = await tx.provider.findMany()
      const providerMap = new Map(providers.map((p: any) => [p.id, p]))

      const mandatoryIds = MANDATORY[serviceId] || []
      const pool = POOL[serviceId] || []

      // Filter mandatory providers that still have quota
      const assignedIds: number[] = []
      for (const pid of mandatoryIds) {
        const p = providerMap.get(pid)
        if (p && p.leadsReceived < p.monthlyQuota) {
          assignedIds.push(pid)
        }
      }

      // Fill remaining slots from pool using round-robin
      const slotsNeeded = 3 - assignedIds.length
      if (slotsNeeded > 0) {
        // Get allocation state
        const state = await tx.allocationState.findUnique({
          where: { serviceId },
        })
        let index = state?.nextIndex ?? 0

        // Filter pool: has quota, not already assigned
        const eligiblePool = pool.filter((pid: any) => {
  const p = providerMap.get(pid)
  return p && p.leadsReceived < p.monthlyQuota && !assignedIds.includes(pid)
})

        let filled = 0
        let attempts = 0
        while (filled < slotsNeeded && attempts < eligiblePool.length) {
          const pid = eligiblePool[index % eligiblePool.length]
          if (!assignedIds.includes(pid)) {
            assignedIds.push(pid)
            filled++
          }
          index++
          attempts++
        }

        // Update allocation index
        await tx.allocationState.update({
          where: { serviceId },
          data: { nextIndex: index },
        })
      }

      // Create assignments and update provider counts
      for (const pid of assignedIds) {
        await tx.leadAssignment.create({
          data: { leadId: lead.id, providerId: pid },
        })
        await tx.provider.update({
          where: { id: pid },
          data: { leadsReceived: { increment: 1 } },
        })
      }

      return { lead, assignedIds }
    })

    notifyClients()
    return NextResponse.json({
      success: true,
      leadId: result.lead.id,
      assignedProviders: result.assignedIds,
    })
  } catch (error: any) {
    // Unique constraint = duplicate lead
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'This phone number already has a lead for this service' },
        { status: 409 }
      )
    }
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}