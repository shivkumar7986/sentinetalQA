'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Bell, CheckCircle2, AlertTriangle, Sparkles, Check } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatRelative } from '@/lib/format'

interface NotificationItem {
  id: string
  title: string
  message: string
  type: 'plan_ready' | 'run_finished' | 'run_failed'
  href: string
  createdAt: string
  read: boolean
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Test Plan Ready for Review',
    message: 'Ollama generated 5 test cases for "Verify login and open Tracking page".',
    type: 'plan_ready',
    href: '/plans/plan-1',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Run #104 Passed',
    message: '10/10 step assertions passed on TruckHub Staging.',
    type: 'run_finished',
    href: '/runs/r1',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    read: true,
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)

  function markAllRead() {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  return (
    <div className="animate-enter space-y-6 max-w-3xl">
      <PageHeader
        title="Notification Center"
        description="Real-time alerts for plan generation and test execution milestones"
        action={
          <Button variant="secondary" size="sm" onClick={markAllRead} className="gap-1.5">
            <Check className="h-3.5 w-3.5" /> Mark All as Read
          </Button>
        }
      />

      <div className="space-y-3">
        {notifications.map((n) => (
          <Card
            key={n.id}
            className={`p-4 flex items-start gap-4 transition-colors ${
              !n.read ? 'border-l-4 border-l-[var(--primary)] bg-[var(--surface-elevated)]' : ''
            }`}
          >
            <div className="mt-0.5">
              {n.type === 'plan_ready' && <Sparkles className="h-5 w-5 text-[var(--primary)]" />}
              {n.type === 'run_finished' && <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />}
              {n.type === 'run_failed' && <AlertTriangle className="h-5 w-5 text-[var(--danger)]" />}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <Link
                  href={n.href}
                  className="text-[14px] font-semibold text-[var(--text)] hover:text-[var(--primary)] transition-colors"
                >
                  {n.title}
                </Link>
                <span className="mono-data text-[11px] text-[var(--text-muted)]">
                  {formatRelative(n.createdAt)}
                </span>
              </div>
              <p className="text-[13px] text-[var(--text-muted)] mt-1">{n.message}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

