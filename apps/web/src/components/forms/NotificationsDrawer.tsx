'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  PlusCircle,
  Globe,
  ArrowRight,
  Clock,
  Layers,
} from 'lucide-react'
import { useUIStore } from '@/stores/ui.store'
import { mockClient } from '@/mocks/mockClient'
import type { NotificationItem } from '@/mocks/data/notifications.mock'
import { formatRelative } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NotificationsDrawerProps {
  open?: boolean
  onClose?: () => void
}

export function NotificationsDrawer({
  open: propOpen,
  onClose: propOnClose,
}: NotificationsDrawerProps) {
  const router = useRouter()
  const { formDrawer, closeFormDrawer } = useUIStore()
  const isOpen = propOpen !== undefined ? propOpen : formDrawer === 'notifications'
  const handleClose = propOnClose || closeFormDrawer

  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [filterTab, setFilterTab] = useState<'all' | 'unread'>('all')
  const [loading, setLoading] = useState(false)

  // Load notifications from mockClient
  const loadNotifications = async () => {
    try {
      const data = await mockClient.getNotifications()
      setNotifications(data)
    } catch {
      // fallback
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadNotifications()
    }
  }, [isOpen])

  // Listen for storage changes
  useEffect(() => {
    const handleUpdate = () => loadNotifications()
    window.addEventListener('testing_agent_notifications_changed', handleUpdate)
    return () => window.removeEventListener('testing_agent_notifications_changed', handleUpdate)
  }, [])

  // Escape key handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose])

  if (!isOpen) return null

  const unreadCount = notifications.filter((n) => !n.read).length
  const displayedNotifications =
    filterTab === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications

  const handleMarkAllRead = async () => {
    const updated = await mockClient.markAllNotificationsRead()
    setNotifications(updated)
  }

  const handleItemClick = async (item: NotificationItem) => {
    if (!item.read) {
      await mockClient.markNotificationRead(item.id)
    }
    handleClose()
    router.push(item.href)
  }

  const getItemIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'plan_ready':
        return (
          <div className="h-8 w-8 rounded-lg bg-[var(--primary-tint)] border border-[var(--primary)]/20 flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-[var(--primary)]" />
          </div>
        )
      case 'run_passed':
        return (
          <div className="h-8 w-8 rounded-lg bg-[var(--success-tint)] border border-[var(--success)]/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
          </div>
        )
      case 'run_failed':
        return (
          <div className="h-8 w-8 rounded-lg bg-[var(--danger-tint)] border border-[var(--danger)]/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-4 w-4 text-[var(--danger)]" />
          </div>
        )
      case 'plan_approved':
        return (
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
        )
      case 'task_created':
        return (
          <div className="h-8 w-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
            <PlusCircle className="h-4 w-4 text-violet-500" />
          </div>
        )
      case 'website_added':
        return (
          <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
            <Globe className="h-4 w-4 text-sky-500" />
          </div>
        )
      default:
        return (
          <div className="h-8 w-8 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center shrink-0">
            <Bell className="h-4 w-4 text-[var(--text-muted)]" />
          </div>
        )
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-[7px] transition-opacity animate-fade-in"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className="relative z-10 w-full max-w-[480px] h-screen bg-[var(--surface)] border-l border-[var(--border)] shadow-2xl flex flex-col justify-between animate-slide-in-right select-text"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[var(--border)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-[8px] bg-[var(--primary-tint)] border border-[var(--primary)]/20 flex items-center justify-center">
                <Bell className="h-4 w-4 text-[var(--primary)]" />
              </div>
              <h2 className="text-[18px] font-bold text-[var(--text)] tracking-tight">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[var(--primary-tint)] text-[var(--primary)] mono-data">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="h-8 px-2.5 text-[12px] font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--hover-subtle)] rounded-[6px] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--hover-subtle)] rounded-[6px] transition-colors cursor-pointer"
                aria-label="Close notifications"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Filter Tab pills: [ All (6) | Unread (2) ] */}
          <div className="flex items-center bg-[var(--hover-subtle)] p-0.5 rounded-[6px] border border-[var(--border)] w-fit">
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={cn(
                'h-7 px-3 text-[12px] font-medium rounded-[4px] transition-colors cursor-pointer',
                filterTab === 'all'
                  ? 'bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] font-semibold shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              )}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('unread')}
              className={cn(
                'h-7 px-3 text-[12px] font-medium rounded-[4px] transition-colors cursor-pointer',
                filterTab === 'unread'
                  ? 'bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] font-semibold shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {displayedNotifications.length === 0 ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 space-y-2">
              <div className="h-12 w-12 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)]">
                <Bell className="h-6 w-6 opacity-40" />
              </div>
              <p className="text-[14px] font-semibold text-[var(--text)]">
                {filterTab === 'unread' ? 'No unread notifications' : 'No notifications'}
              </p>
              <p className="text-[12px] text-[var(--text-muted)] max-w-xs">
                Milestones from test plan generation, run outcomes, and system changes will appear here.
              </p>
            </div>
          ) : (
            displayedNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={cn(
                  'group relative p-3.5 rounded-[8px] border transition-all cursor-pointer flex items-start gap-3.5',
                  item.read
                    ? 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--hover-row)]'
                    : 'bg-[var(--surface-elevated)] border-[var(--primary)]/40 hover:border-[var(--primary)] hover:bg-[var(--primary-tint)]/20'
                )}
              >
                {/* Unread indicator dot */}
                {!item.read && (
                  <span className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                )}

                {/* Category Icon */}
                {getItemIcon(item.type)}

                {/* Main Details */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span
                      className={cn(
                        'text-[13px] font-semibold leading-snug truncate transition-colors group-hover:text-[var(--primary)]',
                        item.read ? 'text-[var(--text)]' : 'text-[var(--text)]'
                      )}
                    >
                      {item.title}
                    </span>
                    <span className="text-[11px] mono-data text-[var(--text-muted)] shrink-0">
                      {formatRelative(item.createdAt)}
                    </span>
                  </div>

                  <p className="text-[12px] text-[var(--text-muted)] line-clamp-2 leading-relaxed mb-2.5">
                    {item.message}
                  </p>

                  <div className="flex items-center justify-between text-[11px]">
                    {item.targetLabel ? (
                      <span className="mono-data px-2 py-0.5 rounded-[4px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)]">
                        {item.targetLabel}
                      </span>
                    ) : (
                      <span />
                    )}

                    <span className="inline-flex items-center gap-1 font-medium text-[var(--primary)] group-hover:underline">
                      Navigate to resource <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-[var(--border)] bg-[var(--surface)] flex items-center justify-between">
          <span className="text-[12px] text-[var(--text-muted)]">
            {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
