'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Settings, Plus, ExternalLink, CheckCircle2, Circle } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { EnvBadge, type EnvValue } from '@/components/domain/EnvBadge'
import { StatusBadge, type StatusValue } from '@/components/domain/StatusBadge'
import { EngineBadge, type EngineKind } from '@/components/domain/EngineBadge'
import { StateView } from '@/components/data/StateView'
import { mockClient } from '@/mocks/mockClient'
import type { Website } from '@/mocks/data/websites.mock'
import type { Task } from '@/mocks/data/tasks.mock'
import type { FullWebsiteConfig } from '@/mocks/data/configs.mock'
import { useUIStore } from '@/stores/ui.store'
import { cn } from '@/lib/utils'

export default function WebsiteDetailPage({ params }: { params: { id: string } }) {
  const { formDrawer, openFormDrawer } = useUIStore()
  const [website, setWebsite] = useState<Website | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [config, setConfig] = useState<FullWebsiteConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    const handleFocus = () => loadData()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [params.id, formDrawer])

  async function loadData() {
    const site = await mockClient.getWebsiteById(params.id)
    if (site) {
      setWebsite(site)
      const siteTasks = await mockClient.getTasks({ websiteId: params.id })
      setTasks(siteTasks)
      const siteConfig = await mockClient.getConfigByWebsiteId(params.id)
      setConfig(siteConfig)
    }
    setLoading(false)
  }

  if (loading && !website) {
    return <StateView isLoading={true} skeletonCount={4}><div /></StateView>
  }

  if (!website) {
    return (
      <div className="py-12 text-center text-[var(--text-muted)]">
        Website not found.
      </div>
    )
  }

  const checklist = [
    {
      label: 'Roles Defined',
      complete: (config?.roles?.length || 0) > 0,
      count: config?.roles?.length || 0,
      detail: config?.roles?.length ? `${config.roles.length} roles` : '0 roles',
    },
    {
      label: 'Target Modules Mapped',
      complete: (config?.modules?.length || 0) > 0,
      count: config?.modules?.length || 0,
      detail: config?.modules?.length ? `${config.modules.length} routes` : '0 routes',
    },
    {
      label: 'Auth Flow Configured',
      complete: Boolean(
        config?.authFlow &&
        (config.authFlow.usernameSelector || config.authFlow.redirectTarget || config.authFlow.method)
      ),
      count: config?.authFlow ? 1 : 0,
      detail: config?.authFlow?.method ? 'Configured' : 'Missing',
    },
    {
      label: 'Business Rules Injected',
      complete: (config?.businessRules?.length || 0) > 0,
      count: config?.businessRules?.length || 0,
      detail: config?.businessRules?.length ? `${config.businessRules.length} rules` : '0 rules',
    },
    {
      label: 'Credentials Stored',
      complete: (config?.credentials?.length || 0) > 0,
      count: config?.credentials?.length || 0,
      detail: config?.credentials?.length ? `${config.credentials.length} stored` : '0 stored',
    },
  ]

  return (
    <div className="animate-enter space-y-6">
      <PageHeader
        title={website.name}
        description={website.baseUrl}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/websites/${website.id}/config`}>
                <Settings className="h-4 w-4" /> Configure
              </Link>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => openFormDrawer('create-task', { websiteId: website.id })}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" /> Create Task
            </Button>
          </div>
        }
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Target Environment
          </div>
          <div className="flex items-center gap-2">
            <EnvBadge env={website.environment as EnvValue} />
            <a
              href={website.baseUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[12px] mono-data text-[var(--text-muted)] hover:text-[var(--text)] flex items-center gap-1"
            >
              <span>Visit site</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </Card>

        <Card>
          <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Config Completeness
          </div>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-[20px] font-semibold mono-data text-[var(--text)]">
              {checklist.filter((c) => c.complete).length} / {checklist.length}
            </span>
            <span className="text-[12px] font-mono font-semibold text-indigo-600 dark:text-indigo-400">
              {Math.round((checklist.filter((c) => c.complete).length / checklist.length) * 100)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#4F46E5] transition-all duration-300 rounded-full"
              style={{
                width: `${(checklist.filter((c) => c.complete).length / checklist.length) * 100}%`,
              }}
            />
          </div>
        </Card>

        <Card>
          <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Active Tasks
          </div>
          <div className="text-[20px] font-semibold mono-data text-[var(--text)]">
            {tasks.length}
          </div>
        </Card>
      </div>

      {/* Config Checklist Banner */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Configuration Readiness</CardTitle>
            <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
              Prerequisites required for autonomous AI exploration and task execution.
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/websites/${website.id}/config`}>Edit Config</Link>
          </Button>
        </CardHeader>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {checklist.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between p-2.5 rounded-[6px] bg-[var(--surface-elevated)] border border-[var(--border)] text-[12px]"
            >
              <div className="flex items-center gap-2 min-w-0">
                {item.complete ? (
                  <CheckCircle2 className="h-4 w-4 text-[var(--success)] shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-[var(--border-hover)] shrink-0" />
                )}
                <span className={cn('truncate', item.complete ? 'text-[var(--text)] font-medium' : 'text-[var(--text-muted)]')}>
                  {item.label}
                </span>
              </div>
              <span className={cn(
                'text-[10px] font-mono font-medium px-1.5 py-0.5 rounded shrink-0 ml-1.5',
                item.complete
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  : 'bg-gray-100 dark:bg-neutral-800 text-gray-500'
              )}>
                {item.detail}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Website Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks for this Website</CardTitle>
          <Button
            variant="primary"
            size="sm"
            onClick={() => openFormDrawer('create-task', { websiteId: website.id })}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> New Task
          </Button>
        </CardHeader>

        {tasks.length === 0 ? (
          <div className="py-8 text-center text-[13px] text-[var(--text-muted)]">
            No tasks created for this website yet.
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)] -mx-5 px-5">
            {tasks.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/tasks/${t.id}`}
                      className="mono-data text-[12px] font-semibold text-[var(--primary)] bg-[var(--primary-tint)] px-2 py-0.5 rounded-[4px] border border-[var(--primary)]/20 hover:underline"
                    >
                      {t.id}
                    </Link>
                    <Link
                      href={`/tasks/${t.id}`}
                      className="text-[14px] font-medium text-[var(--text)] hover:text-[var(--primary)] transition-colors"
                    >
                      {t.title}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <EngineBadge engine={t.providerKind as EngineKind} model={t.model} />
                    {t.roleName && (
                      <span className="text-[11px] text-[var(--text-muted)]">Role: {t.roleName}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={t.status as StatusValue} />
                  <Button variant="secondary" size="sm" asChild>
                    <Link href={`/tasks/${t.id}`}>Open</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
