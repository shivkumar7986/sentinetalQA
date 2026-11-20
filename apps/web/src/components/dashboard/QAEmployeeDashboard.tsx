'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Plus, ChevronDown, RefreshCw, Play, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EnvBadge, type EnvValue } from '@/components/domain/EnvBadge'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui.store'
import { mockClient } from '@/mocks/mockClient'
import type { Website } from '@/mocks/data/websites.mock'
import type { Task } from '@/mocks/data/tasks.mock'
import type { Run } from '@/mocks/data/runs.mock'
import type { TestPlan } from '@/mocks/data/plans.mock'
import { toast } from 'sonner'

const ENV_OPTIONS = [
  { label: 'All environments', value: 'all', dot: null },
  { label: 'Production', value: 'production', dot: 'bg-rose-500' },
  { label: 'Staging', value: 'staging', dot: 'bg-sky-500' },
  { label: 'QA', value: 'qa', dot: 'bg-indigo-500' },
  { label: 'Dev', value: 'dev', dot: 'bg-neutral-400' },
]

interface QAEmployeeDashboardProps {
  websites: Website[]
  tasks: Task[]
  runs: Run[]
  plans: TestPlan[]
  loading: boolean
  onReload: () => void
}

export function QAEmployeeDashboard({
  websites,
  tasks,
  runs,
  plans,
  loading,
  onReload,
}: QAEmployeeDashboardProps) {
  const { openFormDrawer } = useUIStore()
  const [selectedEnv, setSelectedEnv] = useState('All environments')
  const [envOpen, setEnvOpen] = useState(false)

  // Employee tasks list matching Image 2
  const EMPLOYEE_TASKS = [
    {
      id: 'tsk-sso',
      title: 'SSO callback token expiry check',
      statusBadge: '✕ Needs revision',
      badgeClass: 'bg-[#FEE2E2] text-[#DC2626] dark:bg-rose-950/40 dark:text-rose-400',
      website: 'Billing Admin',
      environment: 'qa' as EnvValue,
      planVersion: 'Plan v1',
      leadNote: 'Lead note: Add invalid signature 401 assertion step.',
      actionType: 'fix',
      actionLabel: '✦ Fix & Regenerate',
      planId: 'p-2',
    },
    {
      id: 'tsk-tracking',
      title: 'Verify login and open the Tracking page',
      statusBadge: '✓ Approved',
      badgeClass: 'bg-[#DCFCE7] text-[#16A34A] dark:bg-emerald-950/40 dark:text-emerald-400',
      website: 'Logistics Portal',
      environment: 'staging' as EnvValue,
      planVersion: 'Plan v2',
      leadNote: null,
      actionType: 'run',
      actionLabel: '▶ Run plan',
      planId: 'p-1',
    },
    {
      id: 'tsk-filters',
      title: 'Verify Dispatcher route filters',
      statusBadge: '🕒 In review',
      badgeClass: 'bg-[#FEF3C7] text-[#D97706] dark:bg-amber-950/40 dark:text-amber-400',
      website: 'Logistics Portal',
      environment: 'staging' as EnvValue,
      planVersion: 'Plan v1',
      leadNote: 'Submitted to Riya Sharma for approval',
      actionType: 'open',
      actionLabel: 'Open',
      planId: 'p-3',
    },
    {
      id: 'tsk-rounding',
      title: 'Invoice GST rounding boundary check',
      statusBadge: '✎ Draft',
      badgeClass: 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400',
      website: 'Billing Admin',
      environment: 'qa' as EnvValue,
      planVersion: 'Plan —',
      leadNote: null,
      actionType: 'open',
      actionLabel: 'Open',
      planId: 'p-4',
    },
  ]

  // Employee recent runs matching Image 2
  const EMPLOYEE_RUNS = [
    {
      id: 'run-941',
      status: 'failed',
      taskTitle: 'Dispatcher role redirect',
      websiteName: 'Logistics Portal',
      environment: 'staging' as EnvValue,
      planVersion: 'v2',
      duration: '19.3s',
      started: '1h ago',
    },
    {
      id: 'run-940',
      status: 'passed',
      taskTitle: 'Invoice export CSV rules',
      websiteName: 'Billing Admin',
      environment: 'qa' as EnvValue,
      planVersion: 'v1',
      duration: '8.1s',
      started: '3h ago',
    },
  ]

  // Assigned websites matching Image 2
  const ASSIGNED_WEBSITES = [
    {
      id: 'web-1',
      name: 'Logistics Portal',
      environment: 'staging' as EnvValue,
      configVersion: 'Config v4',
      rolesCount: '3 roles',
    },
    {
      id: 'web-2',
      name: 'Billing Admin',
      environment: 'qa' as EnvValue,
      configVersion: 'Config v2',
      rolesCount: '2 roles',
    },
  ]

  async function handleRunApprovedPlan(taskTitle: string, planId: string) {
    toast.success(`Started autonomous execution: ${taskTitle}`)
    try {
      await mockClient.triggerRun(planId)
      onReload()
    } catch {
      // fallback
    }
  }

  function handleTriageClick(taskTitle: string) {
    toast.info(`Opening triage notes drawer for: ${taskTitle}`, {
      description: 'You can attach assertion logs and assign to developer.',
    })
  }

  return (
    <div className="space-y-5 animate-enter select-text">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 dark:text-white tracking-tight">
            My QA Workspace
          </h1>
          <p className="text-[13px] text-gray-500 dark:text-neutral-400 mt-0.5">
            Author testing tasks, address QA Lead plan feedback, execute approved runs, and triage failures.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Environment dropdown button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setEnvOpen((v) => !v)}
              className={cn(
                'h-9 px-3.5 rounded-[6px] bg-white dark:bg-neutral-900 border text-[13px] font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2 transition-colors select-none',
                envOpen
                  ? 'border-[#4F46E5] ring-2 ring-[#4F46E5]/20'
                  : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300'
              )}
            >
              <span>{selectedEnv}</span>
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 text-gray-400 transition-transform duration-150',
                  envOpen && 'rotate-180'
                )}
              />
            </button>

            {envOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setEnvOpen(false)} />
                <div
                  className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 w-48 rounded-[8px] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 py-1 z-30 shadow-lg animate-enter"
                >
                  {ENV_OPTIONS.map((opt) => {
                    const isSelected = selectedEnv === opt.label
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSelectedEnv(opt.label)
                          setEnvOpen(false)
                        }}
                        className={cn(
                          'w-full text-left px-3.5 py-2 text-[12px] flex items-center justify-between transition-colors',
                          isSelected
                            ? 'bg-[#EEF2FF] dark:bg-indigo-950/40 text-[#4F46E5] font-semibold'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {opt.dot ? (
                            <span className={cn('h-2 w-2 rounded-full shrink-0', opt.dot)} />
                          ) : (
                            <span className="h-2 w-2 rounded-full border border-gray-300 shrink-0" />
                          )}
                          <span>{opt.label}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* + Create task (Only task creation, no add website for employee) */}
          <Button
            variant="primary"
            size="md"
            type="button"
            onClick={() => openFormDrawer('create-task')}
            className="gap-1.5 font-medium bg-[#4F46E5] hover:bg-[#4338CA] text-white"
          >
            <Plus className="h-3.5 w-3.5" /> Create task
          </Button>
        </div>
      </div>

      {/* Row 1: 4 Top Metric Cards matching Image 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: My tasks */}
        <Card className="p-4 flex flex-col justify-between h-[105px]">
          <span className="text-[12px] font-medium text-gray-500 dark:text-neutral-400">
            My tasks
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="mono-data text-[28px] font-bold text-gray-900 dark:text-white leading-none">
              4
            </span>
            <span className="text-[12px] font-medium text-gray-500 dark:text-neutral-400">
              1 draft
            </span>
          </div>
        </Card>

        {/* Card 2: Needs my revision */}
        <Card className="p-4 flex flex-col justify-between h-[105px]">
          <span className="text-[12px] font-medium text-gray-500 dark:text-neutral-400">
            Needs my revision
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="mono-data text-[28px] font-bold text-gray-900 dark:text-white leading-none">
              1
            </span>
            <span className="text-[12px] font-medium text-rose-600 dark:text-rose-400">
              Lead feedback
            </span>
          </div>
        </Card>

        {/* Card 3: My runs (7 days) */}
        <Card className="p-4 flex flex-col justify-between h-[105px]">
          <span className="text-[12px] font-medium text-gray-500 dark:text-neutral-400">
            My runs (7 days)
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="mono-data text-[28px] font-bold text-gray-900 dark:text-white leading-none">
              19
            </span>
            <span className="mono-data text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
              16 passed
            </span>
          </div>
        </Card>

        {/* Card 4: My pass rate */}
        <Card className="p-4 flex flex-col justify-between h-[105px]">
          <span className="text-[12px] font-medium text-gray-500 dark:text-neutral-400">
            My pass rate
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="mono-data text-[28px] font-bold text-gray-900 dark:text-white leading-none">
              84.2%
            </span>
            <span className="mono-data text-[12px] font-semibold text-rose-600 dark:text-rose-400">
              3 to triage
            </span>
          </div>
        </Card>
      </div>

      {/* Row 2: My Tasks & Plan Status (8 cols) & My Run Breakdown (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: My Tasks & Plan Status */}
        <div className="lg:col-span-8">
          <Card className="p-5 flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[14px] font-bold text-gray-900 dark:text-white">
                  My Tasks & Plan Status
                </h2>
                <span className="text-[12px] text-gray-400 dark:text-neutral-500">
                  Plans require QA Lead approval before running
                </span>
              </div>

              {/* Tasks list */}
              <div className="space-y-3">
                {EMPLOYEE_TASKS.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-lg border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-gray-200 dark:hover:border-neutral-700 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[13px] text-gray-900 dark:text-white truncate">
                          {task.title}
                        </h3>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0',
                            task.badgeClass
                          )}
                        >
                          {task.statusBadge}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[12px] text-gray-500 dark:text-neutral-400 flex-wrap">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {task.website}
                        </span>
                        <EnvBadge env={task.environment} />
                        <span>·</span>
                        <span>{task.planVersion}</span>
                        {task.leadNote && (
                          <>
                            <span>·</span>
                            <span className={cn(
                              'font-medium',
                              task.actionType === 'fix' ? 'text-rose-600 dark:text-rose-400' : 'text-gray-500'
                            )}>
                              {task.leadNote}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action button */}
                    {task.actionType === 'run' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleRunApprovedPlan(task.title, task.planId)}
                        className="shrink-0 h-8 px-3.5 text-[12px] font-medium bg-[#4F46E5] hover:bg-[#4338CA] text-white gap-1"
                      >
                        <Play className="h-3 w-3 fill-current" /> Run plan
                      </Button>
                    ) : task.actionType === 'fix' ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        asChild
                        className="shrink-0 h-8 px-3 text-[12px] gap-1 font-medium border-gray-200"
                      >
                        <Link href={`/plans/${task.planId}`}>
                          <Sparkles className="h-3.5 w-3.5 text-[#4F46E5]" /> Fix & Regenerate
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        asChild
                        className="shrink-0 h-8 px-3 text-[12px]"
                      >
                        <Link href={`/plans/${task.planId}`}>
                          Open
                        </Link>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right: My Run Breakdown */}
        <div className="lg:col-span-4">
          <Card className="p-5 flex flex-col justify-between min-h-[300px]">
            <div>
              <h2 className="text-[14px] font-bold text-gray-900 dark:text-white mb-4">
                My Run Breakdown
              </h2>

              <div className="space-y-4">
                {/* Passed */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-gray-600 dark:text-gray-300">Passed</span>
                    <span className="mono-data font-semibold text-gray-900 dark:text-white">
                      16 (84.2%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: '84.2%' }}
                    />
                  </div>
                </div>

                {/* Failed */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-gray-600 dark:text-gray-300">Failed</span>
                    <span className="mono-data font-semibold text-gray-900 dark:text-white">
                      2 (10.5%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: '10.5%' }}
                    />
                  </div>
                </div>

                {/* Error / Skipped */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-gray-600 dark:text-gray-300">Error / Skipped</span>
                    <span className="mono-data font-semibold text-gray-900 dark:text-white">
                      1 (5.3%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: '5.3%' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom button */}
            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => toast.info('Re-running my last task: Verify login & Tracking')}
                className="w-full h-9 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 text-[12px] font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5 text-gray-500" /> Re-run my last task
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Row 3: My Recent Runs (8 cols) & Assigned Websites (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: My Recent Runs */}
        <div className="lg:col-span-8">
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
              <h2 className="text-[14px] font-bold text-gray-900 dark:text-white">
                My Recent Runs
              </h2>
              <span className="text-[12px] text-gray-400 dark:text-neutral-500">
                Click Triage on failed runs to attach QA notes
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-neutral-800 text-[11px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                    <th className="text-left py-2.5 px-4 w-28">STATUS</th>
                    <th className="text-left py-2.5 px-4">TASK / WEBSITE</th>
                    <th className="text-left py-2.5 px-4">PLAN</th>
                    <th className="text-left py-2.5 px-4">DURATION</th>
                    <th className="text-left py-2.5 px-4">STARTED</th>
                    <th className="text-right py-2.5 px-4">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:border-neutral-800">
                  {EMPLOYEE_RUNS.map((run) => (
                    <tr
                      key={run.id}
                      className="hover:bg-gray-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        {run.status === 'passed' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#DCFCE7] text-[#16A34A] dark:bg-emerald-950/40 dark:text-emerald-400">
                            ✓ Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FEE2E2] text-[#DC2626] dark:bg-rose-950/40 dark:text-rose-400">
                            ✕ Failed
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/reports/${run.id}`}
                          className="font-semibold text-gray-900 dark:text-white hover:text-[#4F46E5] transition-colors block leading-snug"
                        >
                          {run.taskTitle}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-gray-500 dark:text-neutral-400">
                            {run.websiteName}
                          </span>
                          <EnvBadge env={run.environment} />
                        </div>
                      </td>
                      <td className="py-3 px-4 mono-data text-[12px] text-gray-700 dark:text-gray-300">
                        {run.planVersion}
                      </td>
                      <td className="py-3 px-4 mono-data text-[12px] text-gray-700 dark:text-gray-300">
                        {run.duration}
                      </td>
                      <td className="py-3 px-4 text-[12px] text-gray-500 dark:text-neutral-400">
                        {run.started}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {run.status === 'failed' ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleTriageClick(run.taskTitle)}
                            className="h-7 px-3 text-[12px] font-medium border-gray-200"
                          >
                            Triage
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => toast.success(`Re-triggering ${run.taskTitle}`)}
                            className="h-7 px-3 text-[12px] font-medium border-gray-200 gap-1"
                          >
                            <RefreshCw className="h-3 w-3" /> Re-run
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right: Assigned Websites */}
        <div className="lg:col-span-4">
          <Card className="p-5 flex flex-col justify-between h-full min-h-[220px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[14px] font-bold text-gray-900 dark:text-white">
                  Assigned Websites
                </h2>
                <span className="text-[12px] text-gray-400 dark:text-neutral-500">
                  Rules access
                </span>
              </div>

              <div className="space-y-3">
                {ASSIGNED_WEBSITES.map((site) => (
                  <div
                    key={site.id}
                    className="p-3.5 rounded-lg border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-gray-200 dark:hover:border-neutral-700 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[13px] text-gray-900 dark:text-white">
                          {site.name}
                        </span>
                        <EnvBadge env={site.environment} />
                      </div>
                      <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-0.5">
                        {site.configVersion} · {site.rolesCount}
                      </p>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      asChild
                      className="h-7 px-2.5 text-[12px] font-medium border-gray-200 shrink-0"
                    >
                      <Link href={`/websites/${site.id}/config`}>
                        Edit rules
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
