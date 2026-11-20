'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Plus, ChevronDown, RefreshCw, ArrowUpRight, ArrowRight, Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EnvBadge, type EnvValue } from '@/components/domain/EnvBadge'
import { StatusBadge, type StatusValue } from '@/components/domain/StatusBadge'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui.store'

const ENV_OPTIONS = [
  { label: 'All environments', value: 'all', dot: null },
  { label: 'Production', value: 'production', dot: 'bg-rose-500' },
  { label: 'Staging', value: 'staging', dot: 'bg-sky-500' },
  { label: 'QA', value: 'qa', dot: 'bg-indigo-500' },
  { label: 'Dev', value: 'dev', dot: 'bg-neutral-400' },
]

interface RecentRunItem {
  id: string
  status: 'running' | 'passed' | 'failed' | 'error'
  title: string
  website: string
  env: EnvValue
  engine: string
  duration: string
  started: string
}

const ALL_RECENT_RUNS: RecentRunItem[] = [
  {
    id: 'r1',
    status: 'running',
    title: 'Verify login & open Tracking',
    website: 'Logistics Portal',
    env: 'staging',
    engine: 'ollama/qwen2.5',
    duration: '12.4s',
    started: 'Just now',
  },
  {
    id: 'r2',
    status: 'passed',
    title: 'Auth token refresh & session timeout',
    website: 'TruckHub Production',
    env: 'production',
    engine: 'gemini-1.5-pro',
    duration: '22.1s',
    started: '1h ago',
  },
  {
    id: 'r3',
    status: 'failed',
    title: 'Tracking page map container loading',
    website: 'Dev E-Commerce',
    env: 'dev',
    engine: 'ollama/llama3.2',
    duration: '8.9s',
    started: '3h ago',
  },
  {
    id: 'r4',
    status: 'passed',
    title: 'Admin RBAC role enforcement matrix',
    website: 'QA Portal',
    env: 'qa',
    engine: 'ollama/qwen2.5',
    duration: '15.8s',
    started: '5h ago',
  },
]

// 14 bars matching the 30-day trend chart in screenshot
const TREND_BARS = [
  { height: 58 },
  { height: 64 },
  { height: 60 },
  { height: 72 },
  { height: 78 },
  { height: 70 },
  { height: 85 },
  { height: 88 },
  { height: 75 },
  { height: 82 },
  { height: 92 },
  { height: 80 },
  { height: 86 },
  { height: 74 },
  { height: 88 },
]

export default function DashboardPage() {
  const { openFormDrawer } = useUIStore()
  const [selectedEnv, setSelectedEnv] = useState('All environments')
  const [envOpen, setEnvOpen] = useState(false)

  const filteredRuns = ALL_RECENT_RUNS.filter((run) => {
    if (selectedEnv === 'All environments') return true
    return run.env.toLowerCase() === selectedEnv.toLowerCase()
  })

  return (
    <div className="space-y-5 animate-enter">
      {/* Header matching screenshot */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text)] tracking-tight">Dashboard</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
            Test plans awaiting approval, live execution runs, and 30-day pass stability.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Environment dropdown button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setEnvOpen((v) => !v)}
              className={cn(
                'h-9 px-3.5 rounded-[6px] bg-[var(--surface)] border text-[13px] font-medium text-[var(--text)] flex items-center gap-2 transition-colors select-none',
                envOpen
                  ? 'border-[var(--primary)] ring-2 ring-[var(--ai-ring)]'
                  : 'border-[var(--border)] hover:border-[var(--border-hover)]'
              )}
              aria-haspopup="listbox"
              aria-expanded={envOpen}
            >
              <span>{selectedEnv}</span>
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 text-[var(--text-muted)] transition-transform duration-150',
                  envOpen && 'rotate-180'
                )}
              />
            </button>

            {/* Dropdown Menu */}
            {envOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setEnvOpen(false)}
                />
                <div
                  role="listbox"
                  className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 w-48 rounded-[8px] bg-[var(--surface)] border border-[var(--border)] py-1 z-30 animate-enter"
                  style={{ boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)' }}
                >
                  {ENV_OPTIONS.map((opt) => {
                    const isSelected = selectedEnv === opt.label
                    return (
                      <button
                        key={opt.value}
                        role="option"
                        aria-selected={isSelected}
                        type="button"
                        onClick={() => {
                          setSelectedEnv(opt.label)
                          setEnvOpen(false)
                        }}
                        className={cn(
                          'w-full text-left px-3.5 py-2 text-[12px] flex items-center justify-between transition-colors',
                          isSelected
                            ? 'bg-[var(--primary-tint)] text-[var(--primary)] font-semibold'
                            : 'text-[var(--text)] hover:bg-[var(--hover-subtle)]'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {opt.dot ? (
                            <span className={cn('h-2 w-2 rounded-full shrink-0', opt.dot)} />
                          ) : (
                            <span className="h-2 w-2 rounded-full border border-[var(--border-hover)] shrink-0" />
                          )}
                          <span>{opt.label}</span>
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 text-[var(--primary)]" />}
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
            className="gap-1.5 font-medium"
          >
            <Plus className="h-3.5 w-3.5" /> Create task
          </Button>
        </div>
      </div>

      {/* Row 1: 4 KPI Cards matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <Card className="p-4 flex flex-col justify-between h-[105px]">
          <span className="text-[12px] font-medium text-[var(--text-muted)]">Registered websites</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="mono-data text-[28px] font-bold text-[var(--text)] leading-none">12</span>
            <span className="text-[12px] text-[var(--text-muted)]">+2 this month</span>
          </div>
        </Card>

        {/* Card 2 */}
        <Card className="p-4 flex flex-col justify-between h-[105px]">
          <span className="text-[12px] font-medium text-[var(--text-muted)]">Active tasks</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="mono-data text-[28px] font-bold text-[var(--text)] leading-none">38</span>
            <span className="text-[12px] text-[var(--text-muted)]">6 in review</span>
          </div>
        </Card>

        {/* Card 3 */}
        <Card className="p-4 flex flex-col justify-between h-[105px]">
          <span className="text-[12px] font-medium text-[var(--text-muted)]">Runs (7 days)</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="mono-data text-[28px] font-bold text-[var(--text)] leading-none">142</span>
            <span className="mono-data text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
              +18.4%
            </span>
          </div>
        </Card>

        {/* Card 4 */}
        <Card className="p-4 flex flex-col justify-between h-[105px]">
          <span className="text-[12px] font-medium text-[var(--text-muted)]">Overall pass rate</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="mono-data text-[28px] font-bold text-[var(--text)] leading-none">91.6%</span>
            <span className="mono-data text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
              +2.1% vs prev
            </span>
          </div>
        </Card>
      </div>

      {/* Row 2: 30-Day Trend Chart & Run Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Pass / Fail trend (30 days) — 8 cols */}
        <div className="lg:col-span-8">
          <Card className="p-5 flex flex-col justify-between h-[280px]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-semibold text-[var(--text)]">
                Pass / Fail trend (30 days)
              </span>
              <span className="mono-data text-[12px] text-[var(--text-muted)]">142 runs</span>
            </div>

            {/* Lavender Bar Chart */}
            <div className="flex-1 flex items-end justify-between gap-1.5 pt-4 pb-2 px-1">
              {TREND_BARS.map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div
                    className="w-full rounded-t-[4px] bg-[#D4D7F8] dark:bg-[#3E4378] group-hover:bg-[var(--primary)] transition-colors duration-150"
                    style={{ height: `${bar.height}%` }}
                    title={`Day ${i + 1}: ${bar.height}% stability`}
                  />
                </div>
              ))}
            </div>

            {/* Bottom Timeline Labels */}
            <div className="flex justify-between items-center text-[11px] mono-data text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
              <span>30d ago</span>
              <span>15d ago</span>
              <span>Today</span>
            </div>
          </Card>
        </div>

        {/* Run status breakdown — 4 cols */}
        <div className="lg:col-span-4">
          <Card className="p-5 flex flex-col justify-between h-[280px]">
            <div>
              <span className="text-[13px] font-semibold text-[var(--text)] block mb-4">
                Run status breakdown
              </span>

              <div className="space-y-4">
                {/* Passed */}
                <div>
                  <div className="flex justify-between text-[12px] mb-1.5">
                    <span className="text-[var(--text-muted)]">Passed</span>
                    <span className="mono-data font-semibold text-[var(--text)]">128 (90.1%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--track-bg)] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '90.1%' }} />
                  </div>
                </div>

                {/* Failed */}
                <div>
                  <div className="flex justify-between text-[12px] mb-1.5">
                    <span className="text-[var(--text-muted)]">Failed</span>
                    <span className="mono-data font-semibold text-[var(--text)]">10 (7.0%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--track-bg)] rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: '7.0%' }} />
                  </div>
                </div>

                {/* Error */}
                <div>
                  <div className="flex justify-between text-[12px] mb-1.5">
                    <span className="text-[var(--text-muted)]">Error</span>
                    <span className="mono-data font-semibold text-[var(--text)]">4 (2.8%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--track-bg)] rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '2.8%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Re-run last task button */}
            <div className="pt-3 border-t border-[var(--border)] flex justify-center">
              <button
                type="button"
                className="text-[12px] font-medium text-[var(--text)] hover:text-[var(--primary)] flex items-center gap-1.5 transition-colors py-1 px-3 rounded-[6px] hover:bg-[var(--hover-subtle)]"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Re-run last task
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Row 3: Recent runs (8 cols) & Needs approval (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Recent runs */}
        <div className="lg:col-span-8">
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[var(--text)]">Recent runs</span>
              <Link
                href="/reports"
                className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text)] flex items-center gap-1 font-medium transition-colors"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    <th className="text-left py-2.5 px-4 w-28">Status</th>
                    <th className="text-left py-2.5 px-4">Website / Task</th>
                    <th className="text-left py-2.5 px-4">Engine</th>
                    <th className="text-left py-2.5 px-4">Duration</th>
                    <th className="text-right py-2.5 px-4">Started</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredRuns.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[var(--text-muted)] text-[12px]">
                        No runs recorded for {selectedEnv}.
                      </td>
                    </tr>
                  ) : (
                    filteredRuns.map((run) => (
                      <tr key={run.id} className="hover:bg-[var(--hover-row)] transition-colors">
                        <td className="py-3 px-4">
                          {run.status === 'running' ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-medium bg-[#E6F4FB] text-[#0284C7] dark:bg-sky-950/40 dark:text-sky-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#0284C7] dark:bg-sky-400 animate-pulse" />
                              Running
                            </span>
                          ) : (
                            <StatusBadge status={run.status as StatusValue} />
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            href={`/runs/${run.id}`}
                            className="font-medium text-[var(--text)] hover:text-[var(--primary)] transition-colors block leading-snug"
                          >
                            {run.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-[var(--text-muted)]">{run.website}</span>
                            <EnvBadge env={run.env} />
                          </div>
                        </td>
                        <td className="py-3 px-4 mono-data text-[12px] text-[var(--text-muted)]">
                          {run.engine}
                        </td>
                        <td className="py-3 px-4 mono-data text-[12px] text-[var(--text)]">
                          {run.duration}
                        </td>
                        <td className="py-3 px-4 text-right mono-data text-[12px] text-[var(--text-muted)]">
                          {run.started}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Needs approval (matches screenshot exactly) */}
        <div className="lg:col-span-4">
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[13px] font-semibold text-[var(--text)]">Needs approval</span>
              <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-[#FDF3E1] text-[#D97706] dark:bg-amber-950/40 dark:text-amber-400 text-[11px] font-semibold mono-data flex items-center justify-center">
                2
              </span>
            </div>

            {/* Approval Item 1 */}
            <div className="p-3 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-hover)] transition-colors flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[var(--text)] truncate">
                  Verify login & Tracking page (v2)
                </p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Riya S. · 5 cases · 18m ago
                </p>
              </div>
              <Button variant="secondary" size="sm" asChild className="shrink-0 gap-1 text-[12px] h-8">
                <Link href="/plans/plan-1">
                  Review <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            {/* Approval Item 2 */}
            <div className="p-3 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-hover)] transition-colors flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[var(--text)] truncate">
                  SSO callback failure recovery (v1)
                </p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Alex M. · 3 cases · 1h ago
                </p>
              </div>
              <Button variant="secondary" size="sm" asChild className="shrink-0 gap-1 text-[12px] h-8">
                <Link href="/plans/plan-1">
                  Review <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
