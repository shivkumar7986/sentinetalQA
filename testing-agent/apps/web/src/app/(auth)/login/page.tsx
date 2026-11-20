'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/auth.store'
import type { UserRole } from '@/stores/auth.store'

const DEMO_USERS: Array<{ email: string; password: string; role: UserRole; name: string; id: string }> = [
  { email: 'admin@sentinel.qa',    password: 'admin', role: 'admin',       name: 'Admin User',   id: '1' },
  { email: 'lead@sentinel.qa',     password: 'lead',  role: 'qa_lead',     name: 'QA Lead',      id: '2' },
  { email: 'engineer@sentinel.qa', password: 'eng',   role: 'qa_engineer', name: 'QA Engineer',  id: '3' },
  { email: 'viewer@sentinel.qa',   password: 'view',  role: 'viewer',      name: 'Viewer',       id: '4' },
]

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 600))
    const user = DEMO_USERS.find((u) => u.email === email && u.password === password)
    if (!user) {
      setError('Invalid email or password. Try the demo credentials below.')
      setLoading(false)
      return
    }
    setAuth({ id: user.id, name: user.name, email: user.email, role: user.role }, 'mock-jwt-token')
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[14px] p-8">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-9 w-9 rounded-[10px] bg-[var(--primary)] flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-[16px] font-semibold text-[var(--text)]">SentinelQA</h1>
              <p className="text-[12px] text-[var(--text-muted)]">AI Website Testing Agent</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
            />

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-[0.05em]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="h-9 w-full rounded-[6px] border border-[var(--border)] bg-[var(--bg)] px-3 pr-10 text-[14px] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ai-ring)] transition-colors duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="text-[13px] text-[var(--danger)] bg-[var(--danger-tint)] border border-[var(--danger)]/20 rounded-[6px] px-3 py-2"
              >
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
              Sign in
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-3 rounded-[6px] bg-[var(--surface-elevated)] border border-[var(--border)]">
            <p className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-[0.05em] mb-2">
              Demo credentials
            </p>
            <div className="space-y-1">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => { setEmail(u.email); setPassword(u.password) }}
                  className="w-full text-left text-[12px] text-[var(--text-muted)] hover:text-[var(--primary)] mono-data transition-colors py-0.5"
                >
                  {u.email}
                  <span className="ml-2 text-[var(--border-hover)]">·</span>
                  <span className="ml-2 capitalize">{u.role.replace('_', ' ')}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

