'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Bell, PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/ui.store'
import { UserRoleMenu } from '@/components/layout/UserRoleMenu'
import { mockClient } from '@/mocks/mockClient'

function getPlanTaskId(planId: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    const rawPlans = localStorage.getItem('testing_agent_mock_plans') || localStorage.getItem('sentinel_mock_plans')
    if (rawPlans) {
      const plans = JSON.parse(rawPlans)
      if (plans[planId]?.taskId) return plans[planId].taskId
    }
    const rawTasks = localStorage.getItem('testing_agent_mock_tasks') || localStorage.getItem('sentinel_mock_tasks')
    if (rawTasks) {
      const tasks = JSON.parse(rawTasks)
      const found = tasks.find((t: any) => t.currentPlanId === planId || t.id === planId || t.id === planId.replace('p-', ''))
      if (found) return found.id
    }
  } catch {}
  if (planId.startsWith('p-')) return planId.replace('p-', '')
  return null
}

function getRunTaskId(runId: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    const rawRuns = localStorage.getItem('testing_agent_mock_runs') || localStorage.getItem('sentinel_mock_runs')
    if (rawRuns) {
      const runs = JSON.parse(rawRuns)
      if (runs[runId]?.taskId) return runs[runId].taskId
    }
    const rawTasks = localStorage.getItem('testing_agent_mock_tasks') || localStorage.getItem('sentinel_mock_tasks')
    if (rawTasks) {
      const tasks = JSON.parse(rawTasks)
      const found = tasks.find((t: any) => t.lastRunId === runId || t.id === runId)
      if (found) return found.id
    }
  } catch {}
  return null
}

const PATH_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  websites: 'Websites',
  tasks: 'Tasks',
  plans: 'Plans',
  runs: 'Runs',
  reports: 'Reports',
  settings: 'Settings',
  new: 'New',
  config: 'Configuration',
  general: 'General',
  providers: 'AI Providers',
  users: 'Users',
  audit: 'Audit Trail',
  compare: 'Compare',
}

interface BreadcrumbItem {
  label: string
  href?: string
  isId?: boolean
}

function getBreadcrumbItems(pathname: string, dynamicParentId?: string | null): BreadcrumbItem[] {
  const rootItem: BreadcrumbItem = { label: 'Workspace', href: '/dashboard' }
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0 || (segments.length === 1 && segments[0] === 'dashboard')) {
    return [rootItem, { label: 'Dashboard' }]
  }

  const module = segments[0]

  // Module 1: Websites
  // - /websites -> Workspace / Websites
  // - /websites/new -> Workspace / Websites / New Website
  // - /websites/[id] -> Workspace / Websites / [id]
  // - /websites/[id]/config -> Workspace / Websites / [id] / Configuration
  if (module === 'websites') {
    const items: BreadcrumbItem[] = [rootItem]
    items.push({ label: 'Websites', href: segments.length > 1 ? '/websites' : undefined })

    if (segments[1]) {
      if (segments[1] === 'new') {
        items.push({ label: 'New Website' })
      } else {
        const websiteId = segments[1]
        const hasSub = segments.length > 2
        items.push({
          label: websiteId,
          href: hasSub ? `/websites/${websiteId}` : undefined,
          isId: true,
        })

        if (segments[2]) {
          const subLabel = PATH_LABELS[segments[2]] || segments[2]
          items.push({ label: subLabel })
        }
      }
    }
    return items
  }

  // Module 2: Tasks
  // - /tasks -> Workspace / Tasks
  // - /tasks/new -> Workspace / Tasks / New Task
  // - /tasks/[id] -> Workspace / Tasks / [id]
  if (module === 'tasks') {
    const items: BreadcrumbItem[] = [rootItem]
    items.push({ label: 'Tasks', href: segments.length > 1 ? '/tasks' : undefined })

    if (segments[1]) {
      if (segments[1] === 'new') {
        items.push({ label: 'New Task' })
      } else {
        const taskId = segments[1]
        const hasSub = segments.length > 2
        items.push({
          label: taskId,
          href: hasSub ? `/tasks/${taskId}` : undefined,
          isId: true,
        })

        if (segments[2]) {
          const subLabel = PATH_LABELS[segments[2]] || segments[2]
          items.push({
            label: subLabel,
            isId: segments[2].startsWith('pln') || segments[2].startsWith('plan'),
          })
        }
      }
    }
    return items
  }

  // Module 3: Plans (/plans/[id]) -> Workspace / Tasks / Task-id / plan-id
  if (module === 'plans' && segments[1]) {
    const planId = segments[1]
    const effectiveTaskId = dynamicParentId || getPlanTaskId(planId)
    const items: BreadcrumbItem[] = [
      rootItem,
      { label: 'Tasks', href: '/tasks' },
    ]
    if (effectiveTaskId) {
      items.push({ label: effectiveTaskId, href: `/tasks/${effectiveTaskId}`, isId: true })
    }
    items.push({ label: planId, isId: true })
    return items
  }

  // Module 4: Runs (/runs/[id]) -> Workspace / Tasks / Task-id / run-id
  if (module === 'runs' && segments[1]) {
    const runId = segments[1]
    const effectiveTaskId = dynamicParentId || getRunTaskId(runId)
    const items: BreadcrumbItem[] = [
      rootItem,
      { label: 'Tasks', href: '/tasks' },
    ]
    if (effectiveTaskId) {
      items.push({ label: effectiveTaskId, href: `/tasks/${effectiveTaskId}`, isId: true })
    }
    items.push({ label: runId, isId: true })
    return items
  }

  // Module 5: Reports (/reports, /reports/compare, /reports/[id])
  if (module === 'reports') {
    const items: BreadcrumbItem[] = [rootItem]
    items.push({ label: 'Reports', href: segments.length > 1 ? '/reports' : undefined })

    if (segments[1]) {
      if (segments[1] === 'compare') {
        items.push({ label: 'Compare' })
      } else {
        items.push({ label: segments[1], isId: true })
      }
    }
    return items
  }

  // Module 6: Settings (/settings, /settings/general, /settings/providers, etc.)
  if (module === 'settings') {
    const items: BreadcrumbItem[] = [rootItem]
    items.push({ label: 'Settings', href: segments.length > 1 ? '/settings/general' : undefined })

    if (segments[1]) {
      const subLabel = PATH_LABELS[segments[1]] || segments[1]
      items.push({ label: subLabel })
    }
    return items
  }

  // Module 7: Users (/users)
  if (module === 'users') {
    return [rootItem, { label: 'Users' }]
  }

  // Generic fallback for any other nested route
  const items: BreadcrumbItem[] = [rootItem]
  let currentPath = ''
  segments.forEach((seg, i) => {
    currentPath += `/${seg}`
    const isLast = i === segments.length - 1
    const label = PATH_LABELS[seg] || seg
    const isId = /^[a-z]+-[0-9]+$/i.test(seg)
    items.push({
      label,
      href: isLast ? undefined : currentPath,
      isId,
    })
  })
  return items
}

export function Topbar() {
  const pathname = usePathname()
  const { toggleSidebar, setCommandMenuOpen, openFormDrawer } = useUIStore()
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [parentTaskId, setParentTaskId] = React.useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    const segments = pathname.split('/').filter(Boolean)
    if (segments[0] === 'plans' && segments[1]) {
      return getPlanTaskId(segments[1])
    }
    if (segments[0] === 'runs' && segments[1]) {
      return getRunTaskId(segments[1])
    }
    return null
  })

  React.useEffect(() => {
    let mounted = true
    function resolveParent() {
      const segments = pathname.split('/').filter(Boolean)
      const module = segments[0]
      const id = segments[1]
      if (module === 'plans' && id) {
        const found = getPlanTaskId(id)
        if (found) {
          if (mounted) setParentTaskId(found)
        } else {
          mockClient.getPlanById(id).then((p) => {
            if (mounted && p?.taskId) setParentTaskId(p.taskId)
          })
        }
      } else if (module === 'runs' && id) {
        const found = getRunTaskId(id)
        if (found) {
          if (mounted) setParentTaskId(found)
        } else {
          mockClient.getRunById(id).then((r) => {
            if (mounted && r?.taskId) setParentTaskId(r.taskId)
          })
        }
      } else {
        if (mounted) setParentTaskId(null)
      }
    }

    resolveParent()

    window.addEventListener('testing_agent_plans_changed', resolveParent)
    window.addEventListener('testing_agent_tasks_changed', resolveParent)
    window.addEventListener('testing_agent_runs_changed', resolveParent)
    return () => {
      mounted = false
      window.removeEventListener('testing_agent_plans_changed', resolveParent)
      window.removeEventListener('testing_agent_tasks_changed', resolveParent)
      window.removeEventListener('testing_agent_runs_changed', resolveParent)
    }
  }, [pathname])

  React.useEffect(() => {
    let mounted = true
    async function loadNotifCount() {
      try {
        const notifs = await mockClient.getNotifications()
        if (mounted) {
          setUnreadCount(notifs.filter((n) => !n.read).length)
        }
      } catch {}
    }
    loadNotifCount()
    window.addEventListener('testing_agent_notifications_changed', loadNotifCount)
    return () => {
      mounted = false
      window.removeEventListener('testing_agent_notifications_changed', loadNotifCount)
    }
  }, [])

  const breadcrumbs = getBreadcrumbItems(pathname, parentTaskId)

  return (
    <header
      className="sticky top-0 z-20 h-14 flex items-center justify-between px-6 border-b border-[var(--border)] shrink-0 gap-4"
      style={{ background: 'var(--topbar-bg)', backdropFilter: 'blur(10px)' }}
    >
      {/* Left: Breadcrumbs with Links */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="h-8 w-8 rounded-[6px] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-elevated)] transition-colors shrink-0"
          title="Toggle sidebar"
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>

        <nav
          className="flex items-center gap-1.5 text-[13px] overflow-hidden whitespace-nowrap"
          aria-label="breadcrumb"
        >
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1

            return (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <span className="text-[var(--border-hover)] select-none shrink-0">/</span>
                )}

                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="text-[var(--text-muted)] hover:text-[var(--primary)] hover:underline transition-colors shrink-0 flex items-center"
                  >
                    {crumb.isId ? (
                      <span className="font-mono text-[11px] bg-[var(--surface-elevated)] border border-[var(--border)] px-1.5 py-0.5 rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--primary)]/40 transition-colors">
                        {crumb.label}
                      </span>
                    ) : (
                      <span>{crumb.label}</span>
                    )}
                  </Link>
                ) : (
                  <span className="text-[var(--text)] font-semibold shrink-0 flex items-center">
                    {crumb.isId ? (
                      <span className="font-mono text-[11px] bg-[var(--primary-tint)] border border-[var(--primary)]/30 px-1.5 py-0.5 rounded text-[var(--primary)] font-bold">
                        {crumb.label}
                      </span>
                    ) : (
                      <span>{crumb.label}</span>
                    )}
                  </span>
                )}
              </React.Fragment>
            )
          })}
        </nav>
      </div>

      {/* Right: Search Input (⌘K) + Engine Pill + Notification Bell + User Role Menu */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={() => setCommandMenuOpen(true)}
          className="relative hidden md:flex items-center h-8 w-56 lg:w-64 pl-8 pr-8 text-[12px] bg-[var(--surface)] border border-[var(--border)] rounded-[6px] text-[var(--text-muted)] hover:border-[var(--border-hover)] hover:text-[var(--text)] transition-colors text-left select-none cursor-pointer"
        >
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-[var(--text-muted)] pointer-events-none" />
          <span className="truncate">Search websites, tasks...</span>
          <kbd className="absolute right-2 px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-muted)] bg-[var(--surface-elevated)] border border-[var(--border)] rounded">
            ⌘K
          </kbd>
        </button>

        {/* Engine status pill */}
        <div className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-[6px] bg-[var(--surface)] border border-[var(--border)] text-[12px] select-none">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[var(--text)] font-medium">Ollama</span>
          <span className="text-[var(--text-muted)]">·</span>
          <span className="text-[var(--text-muted)]">Ready</span>
        </div>

        {/* Notification Bell Button: Opens Notifications Side Drawer */}
        <Button
          variant="secondary"
          size="sm"
          className="h-8 w-8 p-0 rounded-[6px] relative cursor-pointer"
          onClick={() => openFormDrawer('notifications')}
          aria-label="Open Notifications"
        >
          <Bell className="h-4 w-4 text-[var(--text-muted)]" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[var(--primary)] ring-2 ring-[var(--surface)]" />
          )}
        </Button>

        <div className="h-4 w-px bg-[var(--border)]" />

        {/* User Account & Role Switcher */}
        <UserRoleMenu />
      </div>
    </header>
  )
}
