'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Check, LogOut, ChevronDown, ShieldCheck, UserCheck, Wrench } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore, MOCK_USERS, type UserRole } from '@/stores/auth.store'
import { ROLE_DEFINITIONS } from '@/lib/permissions'
import { toast } from 'sonner'

const ROLE_ICONS: Record<UserRole, React.ElementType> = {
  admin: ShieldCheck,
  qa_lead: UserCheck,
  qa_engineer: Wrench,
}

export function UserRoleMenu() {
  const router = useRouter()
  const { user, switchRole, clearAuth } = useAuthStore()

  const currentUser = user || MOCK_USERS.qa_lead
  const currentRole = currentUser.role || 'qa_lead'
  const meta = ROLE_DEFINITIONS[currentRole] || ROLE_DEFINITIONS.qa_lead

  const initials = currentUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  function handleSwitch(role: UserRole) {
    switchRole(role)
    toast.success(`Switched active role to ${ROLE_DEFINITIONS[role].label}`, {
      description: `Signed in as ${MOCK_USERS[role].name} (${MOCK_USERS[role].email})`,
    })
  }

  function handleLogout() {
    clearAuth()
    toast.info('Signed out successfully')
    router.replace('/login')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 h-8 px-2 rounded-[6px] hover:bg-[var(--surface-elevated)] border border-transparent hover:border-[var(--border)] transition-colors select-none text-left cursor-pointer"
          title="Account & Role Switcher"
        >
          {/* Avatar */}
          <div className="h-6 w-6 rounded-full bg-[var(--primary-tint)] border border-[var(--primary)]/20 flex items-center justify-center text-[10px] font-bold text-[var(--primary)] shrink-0">
            {initials}
          </div>

          {/* Name & Role Badge */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-[12px] font-medium text-[var(--text)] max-w-[100px] truncate">
              {currentUser.name}
            </span>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-[4px] border ${meta.badgeBg} ${meta.badgeText} ${meta.border}`}
            >
              {meta.label}
            </span>
          </div>

          <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-1.5">
        {/* Header User info */}
        <div className="px-2.5 py-2">
          <p className="text-[13px] font-semibold text-[var(--text)]">{currentUser.name}</p>
          <p className="text-[11px] text-[var(--text-muted)] mono-data truncate">
            {currentUser.email}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-[4px] border ${meta.badgeBg} ${meta.badgeText} ${meta.border}`}
            >
              Active Role: {meta.label}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Mock Role Switcher */}
        <DropdownMenuLabel className="text-[10px] tracking-wider text-[var(--text-muted)]">
          Switch Role (Mock Mode)
        </DropdownMenuLabel>

        {(Object.keys(ROLE_DEFINITIONS) as UserRole[]).map((roleKey) => {
          const rMeta = ROLE_DEFINITIONS[roleKey]
          const isCurrent = currentRole === roleKey
          const Icon = ROLE_ICONS[roleKey]
          const mockUser = MOCK_USERS[roleKey]

          return (
            <DropdownMenuItem
              key={roleKey}
              onClick={() => handleSwitch(roleKey)}
              className="flex items-center justify-between py-2 px-2.5 cursor-pointer rounded-[6px]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`h-6 w-6 rounded-[6px] flex items-center justify-center shrink-0 ${rMeta.badgeBg} ${rMeta.badgeText}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-medium text-[var(--text)]">
                      {rMeta.label}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      ({mockUser.name.split(' ')[0]})
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] truncate max-w-[160px]">
                    {rMeta.desc}
                  </p>
                </div>
              </div>

              {isCurrent && (
                <Check className="h-4 w-4 text-[var(--primary)] shrink-0 ml-1.5 stroke-[2.5]" />
              )}
            </DropdownMenuItem>
          )
        })}

        <DropdownMenuSeparator />

        {/* Sign out */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 py-2 px-2.5 text-[var(--danger)] focus:text-[var(--danger)] focus:bg-[var(--danger-tint)] cursor-pointer rounded-[6px]"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="text-[12px] font-medium">Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
