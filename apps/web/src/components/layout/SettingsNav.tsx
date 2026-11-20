'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'

interface SettingsNavProps {
  action?: React.ReactNode
}

export function SettingsNav({ action }: SettingsNavProps) {
  const pathname = usePathname()
  const { user } = useAuthStore()

  // RBAC Tab Visibility:
  // Admin -> all tabs
  // QA Lead -> only General & Audit Log
  // QA Employee -> none
  const allTabs = [
    { label: 'General', href: '/settings/general', admin: false, roles: ['admin', 'qa_lead'] },
    { label: 'AI Providers', href: '/settings/providers', admin: true, roles: ['admin'] },
    { label: 'Users', href: '/settings/users', admin: true, roles: ['admin'] },
    { label: 'Audit Log', href: '/settings/audit', admin: false, roles: ['admin', 'qa_lead'] },
  ]

  const tabs = allTabs.filter((tab) =>
    tab.roles.includes(user?.role || 'admin')
  )

  return (
    <div className="space-y-4">
      {/* Title & Subtitle + Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900 dark:text-white tracking-tight">
            Settings
          </h1>
          <p className="text-[13px] text-gray-500 dark:text-neutral-400 mt-0.5">
            Workspace execution guardrails, AI engine connections, user access, and immutable audit trail.
          </p>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-6 border-b border-gray-200 dark:border-neutral-800 text-[13px]">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href === '/settings/general' && pathname === '/settings')
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex items-center gap-1.5 pb-2.5 font-medium transition-colors select-none relative',
                isActive
                  ? 'text-gray-900 dark:text-white font-semibold border-b-2 border-[#4F46E5] -mb-[1px]'
                  : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <span>{tab.label}</span>
              {tab.admin && (
                <span className="text-[10px] font-semibold text-[#4F46E5] dark:text-indigo-400 bg-[#EEF0FF] dark:bg-indigo-950/50 px-1.5 py-0.5 rounded-[4px] tracking-wide">
                  Admin
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}


