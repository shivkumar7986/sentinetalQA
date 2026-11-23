'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  ChevronDown,
  Check,
  X,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StateView } from '@/components/data/StateView'
import { mockClient } from '@/mocks/mockClient'
import type { Run } from '@/mocks/data/runs.mock'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function ReportsPage() {
  const router = useRouter()
  const [runs, setRuns] = useState<Run[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedWebsite, setSelectedWebsite] = useState('all')
  const [selectedResult, setSelectedResult] = useState('all')
  const [viewGrouping, setViewGrouping] = useState<'date' | 'task'>('date')
  const [selectedRunIds, setSelectedRunIds] = useState<string[]>([])

  useEffect(() => {
    loadRuns()
  }, [])

  async function loadRuns() {
    setLoading(true)
    const data = await mockClient.getRuns()
    setRuns(data)
    setLoading(false)
  }

  function toggleSelect(id: string) {
    if (selectedRunIds.includes(id)) {
      setSelectedRunIds(selectedRunIds.filter((item) => item !== id))
    } else {
      if (selectedRunIds.length >= 2) {
        toast.info('You can compare at most 2 runs simultaneously')
        return
      }
      setSelectedRunIds([...selectedRunIds, id])
    }
  }

  function handleCompare() {
    if (selectedRunIds.length !== 2) return
    router.push(`/reports/compare?a=${selectedRunIds[0]}&b=${selectedRunIds[1]}`)
  }

  function handleGenerateReport() {
    // Generate and download full audit run report
    const headers = ['Run ID', 'Task', 'Website', 'Environment', 'Result', 'Pass Rate', 'Duration', 'Date']
    const rows = runs.map((r) => [
      r.id,
      `"${r.taskTitle.replace(/"/g, '""')}"`,
      `"${r.websiteName.replace(/"/g, '""')}"`,
      r.environment.toUpperCase(),
      r.status,
      `${r.passRate}%`,
      `${(r.durationMs / 1000).toFixed(1)}s`,
      r.dateLabel || r.startedAt.slice(0, 16).replace('T', ' '),
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `testing_agent_report_${new Date().toISOString().slice(0, 10)}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Generated and downloaded comprehensive report')
  }

  const websiteOptions = Array.from(new Set(runs.map((r) => r.websiteName)))

  const filtered = runs.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.taskTitle.toLowerCase().includes(search.toLowerCase()) ||
      r.websiteName.toLowerCase().includes(search.toLowerCase())
    const matchesWebsite =
      selectedWebsite === 'all' || r.websiteName === selectedWebsite
    const matchesResult =
      selectedResult === 'all' ||
      (selectedResult === 'passed' && r.status === 'passed') ||
      (selectedResult === 'failed' && r.status === 'failed') ||
      (selectedResult === 'error' && (r.status === 'error' || r.status === 'failed'))

    return matchesSearch && matchesWebsite && matchesResult
  })

  // Group by task if task-wise selected
  const displayedRuns = [...filtered].sort((a, b) => {
    if (viewGrouping === 'task') {
      return a.taskTitle.localeCompare(b.taskTitle)
    }
    return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  })

  return (
    <div className="space-y-5 animate-enter">
      {/* Header Row matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900 dark:text-white tracking-tight">
            Reports
          </h1>
          <p className="text-[13px] text-gray-500 dark:text-neutral-400 mt-0.5">
            Immutable run records, pass-rate history, side-by-side comparisons, and audit exports.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          {/* Compare (0/2) button */}
          <Button
            variant="secondary"
            size="md"
            type="button"
            disabled={selectedRunIds.length !== 2}
            onClick={handleCompare}
            className={cn(
              'h-10 px-4 text-[13px] font-medium rounded-lg transition-colors',
              selectedRunIds.length === 2
                ? 'text-[#4F46E5] border-[#4F46E5] shadow-xs'
                : 'opacity-70 cursor-not-allowed'
            )}
          >
            Compare ({selectedRunIds.length}/2)
          </Button>

          {/* + Generate report button */}
          <Button
            variant="primary"
            size="md"
            type="button"
            onClick={handleGenerateReport}
            className="gap-1.5 font-medium bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg px-4 py-2 text-[13px] shadow-none h-10"
          >
            <Plus className="h-4 w-4" /> Generate report
          </Button>
        </div>
      </div>

      {/* Control Bar: [ Search ] [ All websites ▾ ] [ All results ▾ ] ----- [ Date-wise | Task-wise ] */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        {/* Left Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search run ID or task..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full px-3.5 text-[13px] bg-[var(--surface)] border border-[var(--border)] rounded-[8px] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-hover)] transition-colors"
            />
          </div>

          {/* All websites dropdown */}
          <div className="relative">
            <select
              value={selectedWebsite}
              onChange={(e) => setSelectedWebsite(e.target.value)}
              className="h-10 px-3.5 pr-8 text-[13px] bg-[var(--surface)] border border-[var(--border)] rounded-[8px] text-[var(--text)] focus:outline-none focus:border-[var(--border-hover)] appearance-none cursor-pointer transition-colors"
            >
              <option value="all">All websites</option>
              {websiteOptions.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)] pointer-events-none" />
          </div>

          {/* All results dropdown */}
          <div className="relative">
            <select
              value={selectedResult}
              onChange={(e) => setSelectedResult(e.target.value)}
              className="h-10 px-3.5 pr-8 text-[13px] bg-[var(--surface)] border border-[var(--border)] rounded-[8px] text-[var(--text)] focus:outline-none focus:border-[var(--border-hover)] appearance-none cursor-pointer transition-colors"
            >
              <option value="all">All results</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="error">Error</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)] pointer-events-none" />
          </div>
        </div>

        {/* Right: [ Date-wise | Task-wise ] Segmented Switch Toggle */}
        <div className="flex items-center bg-[var(--hover-subtle)] p-0.5 rounded-[8px] border border-[var(--border)] self-end md:self-auto">
          <button
            type="button"
            onClick={() => setViewGrouping('date')}
            className={cn(
              'h-8 px-3.5 text-[12px] font-medium rounded-[6px] transition-colors select-none',
              viewGrouping === 'date'
                ? 'bg-white dark:bg-[var(--surface)] text-[var(--text)] border border-gray-200/80 dark:border-[var(--border)] font-semibold shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            )}
          >
            Date-wise
          </button>
          <button
            type="button"
            onClick={() => setViewGrouping('task')}
            className={cn(
              'h-8 px-3.5 text-[12px] font-medium rounded-[6px] transition-colors select-none',
              viewGrouping === 'task'
                ? 'bg-white dark:bg-[var(--surface)] text-[var(--text)] border border-gray-200/80 dark:border-[var(--border)] font-semibold shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            )}
          >
            Task-wise
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <StateView
        isLoading={loading}
        isEmpty={displayedRuns.length === 0}
        emptyMessage="No execution reports match your filter criteria."
      >
        <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[var(--border)] text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  <th className="w-12 py-3.5 pl-6 pr-2 text-left">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="text-left py-3.5 px-4 font-semibold">RUN</th>
                  <th className="text-left py-3.5 px-4 font-semibold">TASK & WEBSITE</th>
                  <th className="text-left py-3.5 px-4 font-semibold">ENV</th>
                  <th className="text-left py-3.5 px-4 font-semibold">RESULT</th>
                  <th className="text-left py-3.5 px-4 font-semibold">PASS RATE</th>
                  <th className="text-left py-3.5 px-4 font-semibold">DURATION</th>
                  <th className="text-left py-3.5 px-4 font-semibold">DATE</th>
                  <th className="text-right py-3.5 px-6 font-semibold">OPEN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {displayedRuns.map((run) => {
                  const isChecked = selectedRunIds.includes(run.id)
                  const dateString =
                    run.dateLabel || run.startedAt.slice(0, 16).replace('T', ' ')
                  const durationSeconds = (run.durationMs / 1000).toFixed(1) + 's'

                  return (
                    <tr
                      key={run.id}
                      className={cn(
                        'hover:bg-[var(--hover-row)] transition-colors',
                        isChecked && 'bg-[var(--primary-tint)]'
                      )}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 pl-6 pr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(run.id)}
                          className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--ai-ring)] cursor-pointer"
                        />
                      </td>

                      {/* RUN */}
                      <td className="py-3.5 px-4 mono-data font-semibold text-[13px] text-[var(--text)]">
                        <Link
                          href={`/reports/${run.id}`}
                          className="hover:text-[var(--primary)] transition-colors"
                        >
                          {run.id}
                        </Link>
                      </td>

                      {/* TASK & WEBSITE */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/reports/${run.id}`}
                          className="font-semibold text-[13px] text-[var(--text)] hover:text-[var(--primary)] transition-colors block leading-snug"
                        >
                          {run.taskTitle}
                        </Link>
                        <span className="text-[12px] text-[var(--text-muted)] block mt-0.5">
                          {run.websiteName}
                        </span>
                      </td>

                      {/* ENV Badge */}
                      <td className="py-3.5 px-4">
                        <span className="mono-data text-[11px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-[4px] bg-[var(--hover-subtle)] text-[var(--text-muted)] border border-[var(--border)]">
                          {run.environment.toUpperCase()}
                        </span>
                      </td>

                      {/* RESULT */}
                      <td className="py-3.5 px-4">
                        {run.status === 'passed' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#DCFCE7] text-[#16A34A] dark:bg-emerald-950/40 dark:text-emerald-400">
                            <Check className="h-3 w-3 stroke-[2.5]" /> Passed
                          </span>
                        )}
                        {run.status === 'failed' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#FEE2E2] text-[#DC2626] dark:bg-rose-950/40 dark:text-rose-400">
                            <X className="h-3 w-3 stroke-[2.5]" /> Failed
                          </span>
                        )}
                        {run.status === 'error' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#FEF3C7] text-[#D97706] dark:bg-amber-950/40 dark:text-amber-400">
                            ! Error
                          </span>
                        )}
                        {run.status === 'running' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#E0F2FE] text-[#0284C7] dark:bg-sky-950/40 dark:text-sky-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#0284C7] animate-pulse" /> Running
                          </span>
                        )}
                      </td>

                      {/* PASS RATE */}
                      <td className="py-3.5 px-4 mono-data font-semibold text-[13px] text-[var(--text)]">
                        {run.passRate}%
                      </td>

                      {/* DURATION */}
                      <td className="py-3.5 px-4 mono-data font-medium text-[13px] text-[var(--text)]">
                        {durationSeconds}
                      </td>

                      {/* DATE */}
                      <td className="py-3.5 px-4 mono-data text-[12px] text-[var(--text-muted)]">
                        {dateString}
                      </td>

                      {/* OPEN Action Button */}
                      <td className="py-3.5 px-6 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          asChild
                        >
                          <Link href={`/reports/${run.id}`}>Open</Link>
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </StateView>
    </div>
  )
}
