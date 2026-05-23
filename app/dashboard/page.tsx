'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Users, TrendingUp, RefreshCw } from 'lucide-react'
import Link from 'next/link'

type Lead = {
  id: number
  name: string
  city: string
  createdAt: string
  service: { name: string }
}

type Provider = {
  id: number
  name: string
  monthlyQuota: number
  leadsReceived: number
  assignments: { lead: Lead }[]
}

export default function Dashboard() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  async function fetchProviders() {
    const res = await fetch('/api/providers')
    const data = await res.json()
    setProviders(data)
    setLoading(false)
    setLastUpdated(new Date())
  }

  useEffect(() => {
    fetchProviders()
    const eventSource = new EventSource('/api/sse')
    eventSource.onmessage = () => fetchProviders()
    return () => eventSource.close()
  }, [])

  const totalLeads = providers.reduce((s, p) => s + p.leadsReceived, 0)
  const fullProviders = providers.filter(p => p.leadsReceived >= p.monthlyQuota).length

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-3 text-sm">
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
            <h1 className="text-3xl font-bold text-white">Provider Dashboard</h1>
            {lastUpdated && (
              <p className="text-slate-500 text-xs mt-1">
                Last updated {lastUpdated.toLocaleTimeString()} · Updates in real-time
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-center">
              <p className="text-2xl font-bold text-white">{totalLeads}</p>
              <p className="text-slate-400 text-xs">Total Leads</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-center">
              <p className="text-2xl font-bold text-white">{providers.length - fullProviders}</p>
              <p className="text-slate-400 text-xs">Active Providers</p>
            </div>
          </div>
        </div>

        {/* Provider Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {providers.map((provider) => {
            const pct = Math.min((provider.leadsReceived / provider.monthlyQuota) * 100, 100)
            const isFull = provider.leadsReceived >= provider.monthlyQuota
            return (
              <div key={provider.id}
                className="bg-white/5 hover:bg-white/8 border border-white/10 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="font-semibold text-white text-sm">{provider.name}</span>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    isFull ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {isFull ? 'Full' : `${provider.monthlyQuota - provider.leadsReceived} left`}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex gap-3 mb-3 text-xs text-slate-400">
                  <span><span className="text-white font-medium">{provider.leadsReceived}</span> received</span>
                  <span><span className="text-white font-medium">{provider.monthlyQuota}</span> quota</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-white/5 rounded-full h-1.5 mb-4">
                  <div className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: isFull ? '#ef4444' : '#3b82f6'
                    }} />
                </div>

                {/* Leads */}
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {provider.assignments.length === 0 ? (
                    <p className="text-slate-600 text-xs py-2">No leads assigned yet</p>
                  ) : (
                    provider.assignments.map(({ lead }) => (
                      <div key={lead.id} className="bg-white/5 rounded-lg p-2.5">
                        <p className="text-white text-xs font-medium">{lead.name}</p>
                        <p className="text-slate-500 text-xs">{lead.service.name} · {lead.city}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}