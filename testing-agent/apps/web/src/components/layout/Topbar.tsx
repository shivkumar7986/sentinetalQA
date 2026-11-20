'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Bell, PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/ui.store'

const PATH_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  websites: 'Websites',
  tasks: 'Tasks',
  plans: 'Plans',
  runs: 'Runs',
  reports: 'Reports',
  settings: 'Settings',
  notifications: 'Notifications',
  new: 'New',
  config: 'Configuration',
  general: 'General',
  providers: 'AI Providers',
  users: 'Users',
  audit: 'Audit Trail',
  compare: 'Compare',
}

export function Topbar() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  const { toggleSidebar, setCommandMenuOpen } = useUIStore()

  const currentLabel =
    segments.length > 0
      ? PATH_LABELS[segments[segments.length - 1]] || segments[segments.length - 1]
      : 'Dashboard'

  return (
    <header
      className="sticky top-0 z-20 h-14 flex items-center justify-between px-6 border-b border-[var(--border)] shrink-0"
      style={{ background: 'var(--topbar-bg)', backdropFilter: 'blur(10px)' }}
    >
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="h-8 w-8 rounded-[6px] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-elevated)] transition-colors"
          title="Toggle sidebar"
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>

        <nav className="flex items-center gap-1.5 text-[13px]" aria-label="breadcrumb">
          <span className="text-[var(--text-muted)]">Workspace</span>
          <span className="text-[var(--border-hover)]">/</span>
          <span className="text-[var(--text)] font-semibold">{currentLabel}</span>
        </nav>
      </div>

      {/* Right: Search Input (⌘K) + Engine Pill + Notification Bell */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={() => setCommandMenuOpen(true)}
          className="relative hidden sm:flex items-center h-8 w-64 pl-8 pr-8 text-[12px] bg-[var(--surface)] border border-[var(--border)] rounded-[6px] text-[var(--text-muted)] hover:border-[var(--border-hover)] hover:text-[var(--text)] transition-colors text-left select-none cursor-pointer"
        >
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-[var(--text-muted)] pointer-events-none" />
          <span className="truncate">Search websites, tasks...</span>
          <kbd className="absolute right-2 px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-muted)] bg-[var(--surface-elevated)] border border-[var(--border)] rounded">
            ⌘K
          </kbd>
        </button>

        {/* Engine status pill */}
        <div className="flex items-center gap-2 h-8 px-3 rounded-[6px] bg-[var(--surface)] border border-[var(--border)] text-[12px] select-none">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[var(--text)] font-medium">Ollama</span>
          <span className="text-[var(--text-muted)]">·</span>
          <span className="text-[var(--text-muted)]">Ready</span>
        </div>

        {/* Notification Bell Button */}
        <Button
          variant="secondary"
          size="sm"
          className="h-8 w-8 p-0 rounded-[6px] relative"
          asChild
          aria-label="Notifications"
        >
          <Link href="/notifications">
            <Bell className="h-4 w-4 text-[var(--text-muted)]" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
          </Link>
        </Button>
      </div>
    </header>
  )
}
