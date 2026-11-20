'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Shield, ShieldCheck, UserCheck, Wrench, ArrowRight, KeyRound } from 'lucide-react'
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
  email: string
  password: string
  permissionsSummary: string
  border: string
  bg: string
  text: string
}

const DEMO_CREDENTIALS: Record<UserRole, RoleCardInfo> = {
  admin: {
    role: 'admin',
    icon: ShieldCheck,
    title: 'Admin',
    subtitle: 'Alex Chen',
    email: 'admin@testingagent.ai',
    password: 'admin',
    permissionsSummary: 'Full access: manage team, invite any role, AI providers, audit logs & workspace',
    border: 'border-purple-200 dark:border-purple-900/60 hover:border-purple-500',
    bg: 'bg-purple-50/50 dark:bg-purple-950/20',
    text: 'text-purple-700 dark:text-purple-300',
  },
  qa_lead: {
    role: 'qa_lead',
    icon: UserCheck,
    title: 'QA Lead',
    subtitle: 'Aarav Mehta',
    email: 'lead@testingagent.ai',
    password: 'lead',
    permissionsSummary: 'Manage websites, create tasks, approve & finalize plans, trigger runs, invite QA employees',
    border: 'border-indigo-200 dark:border-indigo-900/60 hover:border-indigo-500',
    bg: 'bg-indigo-50/50 dark:bg-indigo-950/20',
    text: 'text-indigo-700 dark:text-indigo-300',
  },
  qa_engineer: {
    role: 'qa_engineer',
    icon: Wrench,
    title: 'QA Employee',
    subtitle: 'Elena Rostova',
    email: 'employee@testingagent.ai',
    password: 'employee',
    permissionsSummary: 'Create tasks, write test cases & trigger runs (cannot approve plans or manage team)',
    border: 'border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-500',
    bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
}

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()

  const [email, setEmail] = useState('admin@testingagent.ai')
  const [password, setPassword] = useState('admin')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function fillRole(role: UserRole) {
    const cred = DEMO_CREDENTIALS[role]
    setEmail(cred.email)
    setPassword(cred.password)
    setError('')
    toast.info(`Auto-filled ${cred.title} credentials`, {
      description: `Email: ${cred.email} | Password: ${cred.password}`,
    })
  }

  function instantLogin(role: UserRole) {
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

    if (!email.trim()) {
      setError('Email address is required.')
      setLoading(false)
      return
    }

    if (!password) {
      setError('Password is required. (Try demo password: admin / lead / employee)')
      setLoading(false)
      return
    }

    await new Promise((r) => setTimeout(r, 400))

    // Match with known roles
    const matchedRole = (Object.keys(MOCK_USERS) as UserRole[]).find(
      (r) => MOCK_USERS[r].email.toLowerCase() === email.trim().toLowerCase()
    )

    if (matchedRole) {
      instantLogin(matchedRole)
      return
    }

    // Custom fallback
    const fallbackUser = {
      id: `u-${Date.now()}`,
      name: email.split('@')[0],
      email: email.trim(),
      role: 'qa_engineer' as UserRole,
    }
    setAuth(fallbackUser, 'mock-custom-token')
    toast.success(`Logged in as ${fallbackUser.name}`)
    router.push('/dashboard')
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

        {/* Demo Roles Cards */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[14px] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div>
              <h2 className="text-[14px] font-semibold text-[var(--text)]">
                Select a Role to Auto-Fill Credentials
              </h2>
              <p className="text-[12px] text-[var(--text-muted)]">
                Click any role card to load email & password into the login form
              </p>
            </div>
            <span className="text-[11px] font-medium bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-muted)] px-2 py-0.5 rounded">
              3 Demo Roles
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(Object.keys(DEMO_CREDENTIALS) as UserRole[]).map((roleKey) => {
              const card = DEMO_CREDENTIALS[roleKey]
              const Icon = card.icon
              const isSelected = email === card.email

              return (
                <button
                  key={card.role}
                  type="button"
                  onClick={() => fillRole(card.role)}
                  className={`text-left p-3.5 rounded-lg border transition-all duration-150 flex flex-col justify-between ${
                    card.border
                  } ${card.bg} group cursor-pointer ${
                    isSelected ? 'ring-2 ring-[var(--primary)] border-[var(--primary)]' : ''
                  }`}
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

                  <p className="text-[11px] text-[var(--text-muted)] mt-2 line-clamp-2 leading-relaxed">
                    {card.permissionsSummary}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-[var(--border)]/60 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-[10px] text-[var(--text-muted)]">
                      Pass: <span className="font-semibold text-[var(--text)]">{card.password}</span>
                    </span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        instantLogin(card.role)
                      }}
                      className="text-[var(--primary)] hover:underline font-medium inline-flex items-center gap-0.5"
                    >
                      Instant ➔
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Form Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
              <span className="bg-[var(--surface)] px-2 text-[var(--text-muted)] font-medium">
                Sign in with credentials
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
              required
              autoComplete="email"
            />

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-[0.05em]">
                  Password
                </label>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Demo password: <code className="text-[var(--primary)] font-mono">{password || 'admin'}</code>
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  required
                  autoComplete="current-password"
                  className="h-10 w-full rounded-[6px] border border-[var(--border)] bg-[var(--bg)] px-3 pr-10 text-[13px] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ai-ring)] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
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

            <Button type="submit" variant="primary" size="md" className="w-full h-10 font-semibold" loading={loading}>
              Sign In to Workspace
            </Button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center text-[12px] text-[var(--text-muted)] flex items-center justify-center gap-1.5">
          <KeyRound className="h-3.5 w-3.5" />
          <span>Demo passwords: <strong>admin</strong> | <strong>lead</strong> | <strong>employee</strong></span>
        </div>
      </div>
    </div>
  )
}
