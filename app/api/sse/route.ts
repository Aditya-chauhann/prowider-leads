import { NextRequest } from 'next/server'

// Store all active SSE connections
const clients = new Set<ReadableStreamDefaultController>()

export function GET(req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller)
      req.signal.addEventListener('abort', () => {
        clients.delete(controller)
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

export function notifyClients() {
  const message = `data: update\n\n`
  const encoder = new TextEncoder()
  for (const client of clients) {
    try {
      client.enqueue(encoder.encode(message))
    } catch {
      clients.delete(client)
    }
  }
}