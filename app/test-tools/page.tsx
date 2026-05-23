'use client'

import { useState } from 'react'
import { CreditCard, RefreshCw, Zap, ArrowLeft, Terminal } from 'lucide-react'
import Link from 'next/link'

export default function TestTools() {
  const [log, setLog] = useState<string[]>([])
  const [loading, setLoading] = useState<string | null>(null)

  function addLog(msg: string) {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev])
  }

  async function resetQuota() {
    setLoading('reset')
    const res = await fetch('/api/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'payment_success', idempotencyKey: `reset-${Date.now()}` }),
    })
    const data = await res.json()
    addLog(data.message)
    setLoading(null)
  }

  async function testIdempotency() {
    setLoading('idempotency')
    addLog('Sending same webhook 3 times with identical key...')
    const key = `idem-test-${Date.now()}`
    for (let i = 1; i <= 3; i++) {
      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'payment_success', idempotencyKey: key }),
      })
      const data = await res.json()
      addLog(`Call ${i}: ${data.message}`)
    }
    setLoading(null)
  }

  async function generateLeads() {
    setLoading('leads')
    addLog('Firing 10 concurrent lead requests...')
    const results = await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `Test User ${i + 1}`,
            phone: `700000000${i}`,
            city: 'Delhi',
            serviceId: (i % 3) + 1,
            description: `Concurrent test lead ${i + 1}`,
          }),
        }).then(r => r.json())
      )
    )
    const success = results.filter(r => r.success).length
    const failed = results.filter(r => r.error).length
    addLog(`Done — ${success} succeeded, ${failed} failed`)
    setLoading(null)
  }

  const tools = [
    {
      id: 'reset',
      Icon: CreditCard,
      color: 'emerald',
      title: 'Reset Provider Quota',
      desc: 'Simulates a successful payment webhook — resets all provider quotas back to 10.',
      action: resetQuota,
      label: 'Simulate Payment & Reset Quota',
    },
    {
      id: 'idempotency',
      Icon: RefreshCw,
      color: 'violet',
      title: 'Test Webhook Idempotency',
      desc: 'Fires the same webhook 3× with an identical key. Only the first call should take effect.',
      action: testIdempotency,
      label: 'Test Idempotency (3× same key)',
    },
    {
      id: 'leads',
      Icon: Zap,
      color: 'amber',
      title: 'Generate 10 Concurrent Leads',
      desc: 'Fires 10 lead creation requests simultaneously to stress-test concurrency handling.',
      action: generateLeads,
      label: 'Generate 10 Leads Simultaneously',
    },
  ]

  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30',
    violet: 'bg-violet-500/20 text-violet-400 border-violet-500/30 hover:bg-violet-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30',
  }

  const iconBg: Record<string, string> = {
    emerald: 'bg-emerald-500/20 text-emerald-400',
    violet: 'bg-violet-500/20 text-violet-400',
    amber: 'bg-amber-500/20 text-amber-400',
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">Test Tools</h1>
        <p className="text-slate-400 text-sm mb-8">Simulate webhooks, concurrency, and edge cases.</p>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6 flex gap-3">
          <Zap className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-amber-300 text-sm">Quota can only be reset via the webhook simulation below — not from the normal UI.</p>
        </div>

        <div className="space-y-4 mb-6">
          {tools.map(({ id, Icon, color, title, desc, action, label }) => (
            <div key={id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg[color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-white mb-1">{title}</h2>
                  <p className="text-slate-400 text-sm mb-4">{desc}</p>
                  <button onClick={action} disabled={!!loading}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all disabled:opacity-40 ${colorMap[color]}`}>
                    {loading === id
                      ? <><RefreshCw className="w-4 h-4 animate-spin" /> Processing...</>
                      : label}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Activity Log */}
        {log.length > 0 && (
          <div className="bg-slate-950 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-400">
                <Terminal className="w-4 h-4" />
                <span className="text-sm font-medium">Activity Log</span>
              </div>
              <button onClick={() => setLog([])} className="text-slate-600 hover:text-slate-400 text-xs transition-colors">
                Clear
              </button>
            </div>
            <div className="space-y-1">
              {log.map((entry, i) => (
                <p key={i} className="text-emerald-400 font-mono text-xs">{entry}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}