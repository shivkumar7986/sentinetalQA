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

export default function WebsiteDetailPage({ params }: { params: { id: string } }) {
  const { formDrawer, openFormDrawer } = useUIStore()
  const [website, setWebsite] = useState<Website | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [config, setConfig] = useState<FullWebsiteConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [params.id, formDrawer])

  async function loadData() {
    setLoading(true)
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

  if (loading) {
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
    { label: 'Roles Defined', complete: (config?.roles.length || 0) > 0, count: config?.roles.length || 0 },
    { label: 'Target Modules Mapped', complete: (config?.modules.length || 0) > 0, count: config?.modules.length || 0 },
    { label: 'Auth Flow Configured', complete: !!config?.authFlow?.submitSelector },
    { label: 'Business Rules Injected', complete: (config?.businessRules.length || 0) > 0, count: config?.businessRules.length || 0 },
    { label: 'Credentials Stored', complete: (config?.credentials.length || 0) > 0, count: config?.credentials.length || 0 },
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
          <div className="text-[20px] font-semibold mono-data text-[var(--text)]">
            {checklist.filter((c) => c.complete).length} / {checklist.length}
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
        <CardHeader>
          <CardTitle>Configuration Readiness</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/websites/${website.id}/config`}>Edit Config</Link>
          </Button>
        </CardHeader>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {checklist.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 p-2.5 rounded-[6px] bg-[var(--surface-elevated)] border border-[var(--border)] text-[12px]"
            >
              {item.complete ? (
                <CheckCircle2 className="h-4 w-4 text-[var(--success)] shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-[var(--border-hover)] shrink-0" />
              )}
              <span className={item.complete ? 'text-[var(--text)] font-medium' : 'text-[var(--text-muted)]'}>
                {item.label}
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
