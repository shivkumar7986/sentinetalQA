'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  PlusCircle,
  Globe,
  Check,
  ArrowRight,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatRelative } from '@/lib/format'
import { mockClient } from '@/mocks/mockClient'
import type { NotificationItem } from '@/mocks/data/notifications.mock'
import { cn } from '@/lib/utils'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const data = await mockClient.getNotifications()
      setNotifications(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const handleUpdate = () => loadData()
    window.addEventListener('testing_agent_notifications_changed', handleUpdate)
    return () => window.removeEventListener('testing_agent_notifications_changed', handleUpdate)
  }, [])

  async function markAllRead() {
    const updated = await mockClient.markAllNotificationsRead()
    setNotifications(updated)
  }

  async function handleItemClick(item: NotificationItem) {
    if (!item.read) {
      await mockClient.markNotificationRead(item.id)
    }
  }

  const getItemIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'plan_ready':
        return <Sparkles className="h-5 w-5 text-[var(--primary)]" />
      case 'run_passed':
        return <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
      case 'run_failed':
        return <AlertTriangle className="h-5 w-5 text-[var(--danger)]" />
      case 'plan_approved':
        return <ShieldCheck className="h-5 w-5 text-emerald-500" />
      case 'task_created':
        return <PlusCircle className="h-5 w-5 text-violet-500" />
      case 'website_added':
        return <Globe className="h-5 w-5 text-sky-500" />
      default:
        return <Bell className="h-5 w-5 text-[var(--text-muted)]" />
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="animate-enter space-y-6 max-w-4xl">
      <PageHeader
        title="Notification Center"
        description="Real-time alerts for plan generation, test execution milestones, and system updates."
        action={
          unreadCount > 0 ? (
            <Button variant="secondary" size="sm" onClick={markAllRead} className="gap-1.5">
              <Check className="h-3.5 w-3.5" /> Mark All as Read ({unreadCount})
            </Button>
          ) : undefined
        }
      />

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card className="p-12 text-center text-[var(--text-muted)]">
            <Bell className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p className="text-[14px] font-semibold text-[var(--text)]">No notifications yet</p>
            <p className="text-[12px] mt-1">System milestones and execution alerts will appear here.</p>
          </Card>
        ) : (
          notifications.map((n) => (
            <Card
              key={n.id}
              className={cn(
                'p-4 flex items-start gap-4 transition-all duration-150 relative group',
                !n.read
                  ? 'border-l-4 border-l-[var(--primary)] bg-[var(--surface-elevated)] border-[var(--primary)]/30'
                  : 'bg-[var(--surface)] hover:bg-[var(--hover-row)]'
              )}
            >
              <div className="mt-0.5 shrink-0">
                {getItemIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={n.href}
                      onClick={() => handleItemClick(n)}
                      className="text-[14px] font-semibold text-[var(--text)] hover:text-[var(--primary)] transition-colors"
                    >
                      {n.title}
                    </Link>
                    {n.targetLabel && (
                      <span className="mono-data text-[11px] px-2 py-0.5 rounded-[4px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)]">
                        {n.targetLabel}
                      </span>
                    )}
                  </div>
                  <span className="mono-data text-[11px] text-[var(--text-muted)] shrink-0">
                    {formatRelative(n.createdAt)}
                  </span>
                </div>

                <p className="text-[13px] text-[var(--text-muted)] mt-1.5 leading-relaxed">{n.message}</p>

                <div className="mt-3 flex items-center justify-end">
                  <Link
                    href={n.href}
                    onClick={() => handleItemClick(n)}
                    className="text-[12px] font-medium text-[var(--primary)] inline-flex items-center gap-1 group-hover:underline"
                  >
                    <span>View resource</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
