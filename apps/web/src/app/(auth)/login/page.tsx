'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Shield, ShieldCheck, UserCheck, Wrench, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore, MOCK_USERS, type UserRole } from '@/stores/auth.store'
import { ROLE_DEFINITIONS } from '@/lib/permissions'
import { toast } from 'sonner'

interface RoleCardInfo {
  role: UserRole
  icon: React.ElementType
  title: string
  subtitle: string
  permissionsSummary: string
  border: string
  bg: string
  text: string
  user: typeof MOCK_USERS[UserRole]
}

const ROLE_CARDS: RoleCardInfo[] = [
  {
    role: 'admin',
    icon: ShieldCheck,
    title: 'Admin',
    subtitle: 'Alex Chen',
    permissionsSummary: 'Full access: manage team, invite any role, AI providers, audit logs & workspace',
    border: 'border-purple-200 dark:border-purple-900/60 hover:border-purple-500',
    bg: 'bg-purple-50/50 dark:bg-purple-950/20',
    text: 'text-purple-700 dark:text-purple-300',
    user: MOCK_USERS.admin,
  },
  {
    role: 'qa_lead',
    icon: UserCheck,
    title: 'QA Lead',
    subtitle: 'Aarav Mehta',
    permissionsSummary: 'Manage websites, create tasks, approve & finalize plans, trigger runs, invite QA employees',
    border: 'border-indigo-200 dark:border-indigo-900/60 hover:border-indigo-500',
    bg: 'bg-indigo-50/50 dark:bg-indigo-950/20',
    text: 'text-indigo-700 dark:text-indigo-300',
    user: MOCK_USERS.qa_lead,
  },
  {
    role: 'qa_engineer',
    icon: Wrench,
    title: 'QA Employee',
    subtitle: 'Elena Rostova',
    permissionsSummary: 'Create tasks, write test cases & trigger runs (cannot approve plans or manage team)',
    border: 'border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-500',
    bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    user: MOCK_USERS.qa_engineer,
  },
]

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function quickLogin(role: UserRole) {
    const user = MOCK_USERS[role]
    setAuth(user, `mock-token-${role}`)
    toast.success(`Logged in as ${user.name}`, {
      description: `Role: ${ROLE_DEFINITIONS[role].label}`,
    })
    router.push('/dashboard')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    await new Promise((r) => setTimeout(r, 400))

    // Match with any mock user
    const matchedRole = (Object.keys(MOCK_USERS) as UserRole[]).find(
      (r) => MOCK_USERS[r].email.toLowerCase() === email.trim().toLowerCase()
    )

    if (matchedRole) {
      quickLogin(matchedRole)
      return
    }

    // Default fallback
    if (email) {
      const fallbackUser = {
        id: `u-${Date.now()}`,
        name: email.split('@')[0],
        email,
        role: 'qa_engineer' as UserRole,
      }
      setAuth(fallbackUser, 'mock-custom-token')
      toast.success(`Logged in as ${fallbackUser.name}`)
      router.push('/dashboard')
    } else {
      setError('Please provide an email or choose a role above.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-xl bg-[var(--primary)] items-center justify-center shadow-lg shadow-[var(--primary)]/20 mb-1">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">Testing Agent</h1>
          <p className="text-[13px] text-[var(--text-muted)] max-w-md mx-auto">
            Autonomous AI Website Testing Agent — Role-Based Access
          </p>
        </div>

        {/* 1-Click Role Login Cards */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[14px] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div>
              <h2 className="text-[14px] font-semibold text-[var(--text)]">
                Select a Role to Sign In (1-Click)
              </h2>
              <p className="text-[12px] text-[var(--text-muted)]">
                Experience different permissions immediately
              </p>
            </div>
            <span className="text-[11px] font-medium bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-muted)] px-2 py-0.5 rounded">
              3 Roles
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ROLE_CARDS.map((card) => {
              const Icon = card.icon
              return (
                <button
                  key={card.role}
                  type="button"
                  onClick={() => quickLogin(card.role)}
                  className={`text-left p-3.5 rounded-lg border transition-all duration-150 flex flex-col justify-between ${card.border} ${card.bg} group cursor-pointer`}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 bg-white dark:bg-neutral-800 shadow-sm ${card.text}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                          {card.title}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)]">{card.subtitle}</div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-[var(--text-muted)] mt-2.5 line-clamp-3 leading-relaxed">
                    {card.permissionsSummary}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Manual Login Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
              <span className="bg-[var(--surface)] px-2 text-[var(--text-muted)] font-medium">
                Or sign in with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@testingagent.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                  autoComplete="current-password"
                  className="h-9 w-full rounded-[6px] border border-[var(--border)] bg-[var(--bg)] px-3 pr-10 text-[13px] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ai-ring)] transition-colors"
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
                className="text-[12px] text-[var(--danger)] bg-[var(--danger-tint)] border border-[var(--danger)]/20 rounded-[6px] px-3 py-2"
              >
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" size="md" className="w-full" loading={loading}>
              Sign In
            </Button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center text-[12px] text-[var(--text-muted)]">
          Tip: You can switch roles at any time from the topbar inside the app.
        </div>
      </div>
    </div>
  )
}
