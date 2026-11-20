'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Plus, ChevronDown, RefreshCw, ArrowUpRight, Check, CheckCircle2 } from 'lucide-react'
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

interface QALeadDashboardProps {
  websites: Website[]
  tasks: Task[]
  runs: Run[]
  plans: TestPlan[]
  loading: boolean
  onReload: () => void
}

export function QALeadDashboard({
  websites,
  tasks,
  runs,
  plans,
  loading,
  onReload,
}: QALeadDashboardProps) {
  const { openFormDrawer } = useUIStore()
  const [selectedEnv, setSelectedEnv] = useState('All environments')
  const [envOpen, setEnvOpen] = useState(false)

  // Filter runs by selected environment
  const filteredRuns = runs.filter((run) => {
    if (selectedEnv === 'All environments') return true
    return run.environment.toLowerCase() === selectedEnv.toLowerCase()
  })

  // Dynamic Plans awaiting sign-off
  const pendingPlans = plans.filter(
    (p) => p.status === 'in_review' || p.status === 'draft'
  )

  const activeWebsites = websites.filter((w) => w.status !== 'archived')
  const totalRuns = runs.length
  const passedRunsCount = runs.filter((r) => r.status === 'passed').length
  const failedRunsCount = runs.filter((r) => r.status === 'failed').length

  const passRate = totalRuns > 0
    ? ((passedRunsCount / totalRuns) * 100).toFixed(1) + '%'
    : '85.7%'

  // 14 Stability bars
  const STABILITY_BARS = [
    { height: 68 },
    { height: 74 },
    { height: 70 },
    { height: 86 },
    { height: 80 },
    { height: 72 },
    { height: 85 },
    { height: 92 },
    { height: 84 },
    { height: 78 },
    { height: 88 },
    { height: 82 },
    { height: 90 },
    { height: 86 },
  ]

  // Mock sample plans awaiting sign-off matching Image 1
  const LEAD_PLANS = [
    {
      id: 'p-1',
      title: 'Verify login and open the Tracking page (v2)',
      website: 'Logistics Portal',
      environment: 'staging' as EnvValue,
      author: 'Karan Verma',
      casesCount: 5,
      stepsCount: 7,
      timeAgo: '18m ago',
    },
    {
      id: 'p-2',
      title: 'SSO callback failure & lockout check (v1)',
      website: 'Billing Admin',
      environment: 'qa' as EnvValue,
      author: 'Karan Verma',
      casesCount: 4,
      stepsCount: 6,
      timeAgo: '1h ago',
    },
    {
      id: 'p-3',
      title: 'Guest coupon expiry assertion (v2)',
      website: 'Customer Checkout',
      environment: 'production' as EnvValue,
      author: 'Meera Nair',
      casesCount: 3,
      stepsCount: 5,
      timeAgo: '3h ago',
    },
  ]

  // Mock team runs matching Image 1
  const TEAM_RUNS = [
    {
      id: 'run-940',
      status: 'passed',
      taskTitle: 'Invoice export CSV rules',
      websiteName: 'Billing Admin',
      environment: 'qa' as EnvValue,
      author: 'Karan V.',
      engine: 'gemini-2.5-pro',
      duration: '8.1s',
      started: '14m ago',
    },
    {
      id: 'run-941',
      status: 'failed',
      taskTitle: 'Dispatcher role redirect',
      websiteName: 'Logistics Portal',
      environment: 'staging' as EnvValue,
      author: 'Karan V.',
      engine: 'ollama/qwen2.5',
      duration: '19.3s',
      started: '1h ago',
    },
    {
      id: 'run-942',
      status: 'passed',
      taskTitle: 'Guest coupon boundary',
      websiteName: 'Customer Checkout',
      environment: 'production' as EnvValue,
      author: 'Meera N.',
      engine: 'gemini-2.5-flash',
      duration: '6.8s',
      started: '3h ago',
    },
  ]

  // Config readiness list matching Image 1
  const CONFIG_READINESS = [
    { name: 'Logistics Portal', statusText: '5 / 5 Ready', percent: 100, color: 'bg-emerald-500', isReady: true },
    { name: 'Billing Admin', statusText: '4 / 5 Missing creds', percent: 80, color: 'bg-amber-500', isReady: false },
    { name: 'Customer Checkout', statusText: '5 / 5 Ready', percent: 100, color: 'bg-emerald-500', isReady: true },
  ]

  async function handleRerunLastApprovedPlan() {
    toast.info('Triggered test execution for last approved plan: Verify login & Tracking')
    try {
      if (plans.length > 0) {
        await mockClient.triggerRun(plans[0].id)
        onReload()
      }
    } catch {
      // fallback
    }
  }

  return (
    <div className="space-y-5 animate-enter select-text">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 dark:text-white tracking-tight">
            QA Lead Overview
          </h1>
          <p className="text-[13px] text-gray-500 dark:text-neutral-400 mt-0.5">
            Review and lock AI test plans, verify website configurations, and monitor team execution quality.
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
                        {isSelected && <Check className="h-3.5 w-3.5 text-[#4F46E5]" />}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* + Add website */}
          <Button
            variant="secondary"
            size="md"
            type="button"
            onClick={() => openFormDrawer('add-website')}
            className="gap-1.5 font-medium"
          >
            <Plus className="h-3.5 w-3.5" /> Add website
          </Button>

          {/* + Create task */}
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

      {/* Row 1: 4 Top Metric Cards matching Image 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Awaiting my approval */}
        <Card className="p-4 flex flex-col justify-between h-[105px]">
          <span className="text-[12px] font-medium text-gray-500 dark:text-neutral-400">
            Awaiting my approval
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="mono-data text-[28px] font-bold text-gray-900 dark:text-white leading-none">
              {pendingPlans.length > 0 ? pendingPlans.length : 3}
            </span>
            <span className="text-[12px] font-medium text-amber-600 dark:text-amber-400">
              2 P1 urgent
            </span>
          </div>
        </Card>

        {/* Card 2: Websites & config */}
        <Card className="p-4 flex flex-col justify-between h-[105px]">
          <span className="text-[12px] font-medium text-gray-500 dark:text-neutral-400">
            Websites & config
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="mono-data text-[28px] font-bold text-gray-900 dark:text-white leading-none">
              {activeWebsites.length > 0 ? activeWebsites.length : 3}
            </span>
            <span className="text-[12px] font-medium text-gray-500 dark:text-neutral-400">
              1 incomplete
            </span>
          </div>
        </Card>

        {/* Card 3: Team runs (7 days) */}
        <Card className="p-4 flex flex-col justify-between h-[105px]">
          <span className="text-[12px] font-medium text-gray-500 dark:text-neutral-400">
            Team runs (7 days)
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="mono-data text-[28px] font-bold text-gray-900 dark:text-white leading-none">
              {totalRuns > 0 ? totalRuns : 28}
            </span>
            <span className="mono-data text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
              {passedRunsCount > 0 ? `${passedRunsCount} passed` : '24 passed'}
            </span>
          </div>
        </Card>

        {/* Card 4: Release pass rate */}
        <Card className="p-4 flex flex-col justify-between h-[105px]">
          <span className="text-[12px] font-medium text-gray-500 dark:text-neutral-400">
            Release pass rate
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="mono-data text-[28px] font-bold text-gray-900 dark:text-white leading-none">
              {passRate || '85.7%'}
            </span>
            <span className="mono-data text-[12px] font-semibold text-rose-600 dark:text-rose-400">
              {failedRunsCount > 0 ? `${failedRunsCount} failures` : '4 failures'}
            </span>
          </div>
        </Card>
      </div>

      {/* Row 2: Plans Awaiting Sign-Off (8 cols) & Website Config Readiness (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Plans Awaiting Sign-Off */}
        <div className="lg:col-span-8">
          <Card className="p-5 flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-[14px] font-bold text-gray-900 dark:text-white">
                    Plans Awaiting Sign-Off
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#D97706] dark:bg-amber-950/40 dark:text-amber-400">
                    3 pending
                  </span>
                </div>
              </div>

              {/* Plans list */}
              <div className="space-y-3">
                {LEAD_PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-3.5 rounded-lg border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-gray-200 dark:hover:border-neutral-700 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 space-y-1">
                      <h3 className="font-semibold text-[13px] text-gray-900 dark:text-white truncate">
                        {plan.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[12px] text-gray-500 dark:text-neutral-400 flex-wrap">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {plan.website}
                        </span>
                        <EnvBadge env={plan.environment} />
                        <span>·</span>
                        <span>By {plan.author}</span>
                        <span>·</span>
                        <span>{plan.casesCount} cases</span>
                        <span>·</span>
                        <span>{plan.stepsCount} steps</span>
                        <span>·</span>
                        <span>{plan.timeAgo}</span>
                      </div>
                    </div>

                    <Button variant="secondary" size="sm" asChild className="shrink-0 h-8 px-3 text-[12px] gap-1">
                      <Link href={`/plans/${plan.id}`}>
                        Review <ArrowUpRight className="h-3.5 w-3.5 text-gray-500" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Website Config Readiness */}
        <div className="lg:col-span-4">
          <Card className="p-5 flex flex-col justify-between min-h-[300px]">
            <div>
              <h2 className="text-[14px] font-bold text-gray-900 dark:text-white mb-4">
                Website Config Readiness
              </h2>

              <div className="space-y-4">
                {CONFIG_READINESS.map((item) => (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {item.name}
                      </span>
                      <span
                        className={cn(
                          'mono-data font-semibold text-[11px]',
                          item.isReady
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400'
                        )}
                      >
                        {item.statusText}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-300', item.color)}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom action button */}
            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={handleRerunLastApprovedPlan}
                className="w-full h-9 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 text-[12px] font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5 text-gray-500" /> Re-run last approved plan
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Row 3: Recent Team Runs (8 cols) & 14-Day Stability (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Recent Team Runs */}
        <div className="lg:col-span-8">
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
              <h2 className="text-[14px] font-bold text-gray-900 dark:text-white">
                Recent Team Runs
              </h2>
              <span className="text-[12px] text-gray-400 dark:text-neutral-500">
                QA Lead has full audit & export access
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-neutral-800 text-[11px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                    <th className="text-left py-2.5 px-4 w-28">STATUS</th>
                    <th className="text-left py-2.5 px-4">TASK / WEBSITE</th>
                    <th className="text-left py-2.5 px-4">AUTHOR</th>
                    <th className="text-left py-2.5 px-4">ENGINE</th>
                    <th className="text-left py-2.5 px-4">DURATION</th>
                    <th className="text-right py-2.5 px-4">STARTED</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:border-neutral-800">
                  {TEAM_RUNS.map((run) => (
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
                      <td className="py-3 px-4 text-[12px] text-gray-700 dark:text-gray-300">
                        {run.author}
                      </td>
                      <td className="py-3 px-4 mono-data text-[12px] text-gray-600 dark:text-neutral-400">
                        {run.engine}
                      </td>
                      <td className="py-3 px-4 mono-data text-[12px] text-gray-800 dark:text-gray-200">
                        {run.duration}
                      </td>
                      <td className="py-3 px-4 text-right text-[12px] text-gray-500 dark:text-neutral-400">
                        {run.started}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right: 14-Day Stability */}
        <div className="lg:col-span-4">
          <Card className="p-5 flex flex-col justify-between h-full min-h-[220px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-bold text-gray-900 dark:text-white">
                14-Day Stability
              </h2>
              <span className="mono-data font-bold text-[14px] text-gray-700 dark:text-gray-200">
                85.7%
              </span>
            </div>

            {/* Stability Bars */}
            <div className="flex-1 flex items-end justify-between gap-1.5 pt-4 pb-2 px-1">
              {STABILITY_BARS.map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div
                    className="w-full rounded-t-[3px] bg-[#D4D7F8] dark:bg-[#3E4378] group-hover:bg-[#4F46E5] transition-colors duration-150"
                    style={{ height: `${bar.height}%` }}
                    title={`Day ${i + 1}: ${bar.height}%`}
                  />
                </div>
              ))}
            </div>

            {/* Bottom Timeline Labels */}
            <div className="flex justify-between items-center text-[11px] mono-data text-gray-400 dark:text-neutral-500 pt-2 border-t border-gray-100 dark:border-neutral-800">
              <span>14d ago</span>
              <span>Today</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
