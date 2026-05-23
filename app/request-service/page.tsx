'use client'

import { useState } from 'react'
import { User, Phone, MapPin, Layers, FileText, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function RequestService() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      city: formData.get('city'),
      serviceId: Number(formData.get('serviceId')),
      description: formData.get('description'),
    }
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await res.json()
    setLoading(false)
    if (!res.ok) setError(result.error || 'Something went wrong')
    else setSuccess(true)
  }

  if (success) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Request Submitted!</h2>
          <p className="text-slate-400 mb-8">Your lead has been created and assigned to providers automatically.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setSuccess(false)}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl transition-colors text-sm font-medium">
              Submit Another
            </button>
            <Link href="/dashboard"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors text-sm font-medium">
              View Dashboard
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <h1 className="text-2xl font-bold text-white mb-1">Request a Service</h1>
          <p className="text-slate-400 text-sm mb-8">Fill in your details and we'll match you with the right providers.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name', name: 'name', type: 'text', placeholder: 'John Doe', Icon: User },
              { label: 'Phone Number', name: 'phone', type: 'text', placeholder: '9999999999', Icon: Phone },
              { label: 'City', name: 'city', type: 'text', placeholder: 'Mumbai', Icon: MapPin },
            ].map(({ label, name, type, placeholder, Icon }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input name={name} type={type} required placeholder={placeholder}
                    className="w-full bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/8 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 outline-none transition-all text-sm" />
                </div>
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Service Type</label>
              <div className="relative">
                <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select name="serviceId" required
                  className="w-full bg-white/5 border border-white/10 focus:border-blue-500/50 rounded-xl pl-10 pr-4 py-3 text-white outline-none transition-all text-sm appearance-none">
                  <option value="" className="bg-slate-900">Select a service...</option>
                  <option value="1" className="bg-slate-900">Service 1</option>
                  <option value="2" className="bg-slate-900">Service 2</option>
                  <option value="3" className="bg-slate-900">Service 3</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <textarea name="description" required rows={3} placeholder="Describe your service requirement..."
                  className="w-full bg-white/5 border border-white/10 focus:border-blue-500/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 outline-none transition-all text-sm resize-none" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Request'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}