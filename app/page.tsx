import Link from 'next/link'
import { LayoutDashboard, ClipboardList, Wrench, ArrowRight, Zap } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Logo / Brand */}
      <div className="flex items-center gap-3 mb-4 animate-fade-in">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-white tracking-tight">Prowider</span>
      </div>

      <p className="text-slate-400 text-sm mb-12 tracking-widest uppercase">Lead Distribution System</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
        <Link href="/request-service" className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10">
          <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600/30 transition-colors">
            <ClipboardList className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-white font-semibold mb-1">Submit a Lead</h2>
          <p className="text-slate-400 text-sm">Request a service and get matched with providers</p>
          <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all mt-4" />
        </Link>

        <Link href="/dashboard" className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10">
          <div className="w-10 h-10 bg-emerald-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-600/30 transition-colors">
            <LayoutDashboard className="w-5 h-5 text-emerald-400" />
          </div>
          <h2 className="text-white font-semibold mb-1">Provider Dashboard</h2>
          <p className="text-slate-400 text-sm">View real-time lead assignments and quotas</p>
          <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all mt-4" />
        </Link>

        <Link href="/test-tools" className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10">
          <div className="w-10 h-10 bg-violet-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-violet-600/30 transition-colors">
            <Wrench className="w-5 h-5 text-violet-400" />
          </div>
          <h2 className="text-white font-semibold mb-1">Test Tools</h2>
          <p className="text-slate-400 text-sm">Simulate webhooks, concurrency & edge cases</p>
          <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 group-hover:translate-x-1 transition-all mt-4" />
        </Link>
      </div>

      <p className="text-slate-600 text-xs mt-12">Built for Prowider · Full Stack Assignment</p>
    </main>
  )
}