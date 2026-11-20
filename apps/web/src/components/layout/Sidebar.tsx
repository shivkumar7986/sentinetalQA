'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid,
  Globe,
  ListTodo,
  FileText,
  Users,
  Settings,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui.store'
import { useAuthStore } from '@/stores/auth.store'
import { ROLE_DEFINITIONS } from '@/lib/permissions'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
  { label: 'Websites', href: '/websites', icon: Globe },
  { label: 'Tasks', href: '/tasks', icon: ListTodo },
  { label: 'Reports', href: '/reports', icon: FileText },
  { label: 'Users', href: '/users', icon: Users, restrictedToLeadOrAdmin: true },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar, theme, setTheme } = useUIStore()
  const { user } = useAuthStore()

  const displayName = user?.name || 'Aarav Mehta'
  const displayRole = user?.role ? (ROLE_DEFINITIONS[user.role]?.label || user.role) : 'QA Lead'
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-[var(--border)] bg-[var(--surface)]',
        'h-screen sticky top-0 z-30 transition-[width] duration-200 ease-out shrink-0 select-none',
        sidebarCollapsed ? 'w-14' : 'w-56'
      )}
    >
      {/* Top Header: Brand & Collapse Toggle */}
      <div className="h-14 flex items-center justify-between px-3.5 border-b border-[var(--border)] shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0" title="Testing Agent">
          <div className="h-7 w-7 rounded-[6px] bg-[var(--primary)] flex items-center justify-center text-white shrink-0">
            <LayoutGrid className="h-4 w-4 text-white" />
          </div>
          {!sidebarCollapsed && (
            <span className="text-[14px] font-semibold text-[var(--text)] tracking-tight truncate">
              Testing Agent
            </span>
          )}
        </Link>

        {!sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="text-[var(--text-muted)] hover:text-[var(--text)] p-1 rounded transition-colors"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto" aria-label="Main navigation">
        {NAV_ITEMS.map(({ label, href, icon: Icon, restrictedToLeadOrAdmin }) => {
          // Hide Users tab for QA Employee
          if (restrictedToLeadOrAdmin && user?.role === 'qa_engineer') {
            return null
          }

          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                'flex items-center gap-3 h-9 px-2.5 rounded-[6px] text-[13px] transition-all duration-150',
                active
                  ? 'bg-[var(--primary-tint)] text-[var(--primary)] font-semibold'
                  : 'text-[var(--text-muted)] hover:bg-[var(--hover-subtle)] hover:text-[var(--text)]'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{label}</span>}
            </Link>
          )
        })}

        <div className="my-2 h-px bg-[var(--border)] mx-1" />

        <Link
          href="/settings/general"
          title="Settings"
          className={cn(
            'flex items-center gap-3 h-9 px-2.5 rounded-[6px] text-[13px] transition-all duration-150',
            pathname.startsWith('/settings')
              ? 'bg-[var(--primary-tint)] text-[var(--primary)] font-semibold'
              : 'text-[var(--text-muted)] hover:bg-[var(--hover-subtle)] hover:text-[var(--text)]'
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!sidebarCollapsed && <span className="truncate">Settings</span>}
        </Link>
      </nav>

      {/* Footer: User profile info + theme switch */}
      <div className="border-t border-[var(--border)] p-2.5 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="h-8 w-8 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center text-[11px] font-semibold text-[var(--text)] shrink-0"
            title={displayName}
          >
            {initials}
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1 leading-tight">
              <p className="text-[12px] font-semibold text-[var(--text)] truncate">{displayName}</p>
              <p className="text-[10px] text-[var(--text-muted)] capitalize">{displayRole}</p>
            </div>
          )}
        </div>

        {!sidebarCollapsed && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-7 w-7 rounded-[4px] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--hover-subtle)] flex items-center justify-center transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
    </aside>
  )
}
