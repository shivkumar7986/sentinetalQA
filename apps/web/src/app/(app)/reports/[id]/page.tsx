'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Lock,
  ChevronDown,
  ChevronRight,
  Share2,
  Download,
  ArrowUpRight,
  ExternalLink,
  Check,
  X,
  Clock,
  Plus,
} from 'lucide-react'
import { mockClient } from '@/mocks/mockClient'
import { cn } from '@/lib/utils'
import type { Run } from '@/mocks/data/runs.mock'
import type { Task } from '@/mocks/data/tasks.mock'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface CaseOutcome {
  id: string
  number: string
  title: string
  status: 'passed' | 'failed' | 'skipped'
  duration: string
  isExpanded?: boolean
  stepNumber?: string
  stepTitle?: string
  recordedDetail?: string
  note?: string
  check?: string
}

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [run, setRun] = useState<Run | null>(null)
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareLink, setShareLink] = useState('')

  // Accordion state for test cases
  const [expandedCases, setExpandedCases] = useState<Record<string, boolean>>({
    '01': false,
    '02': false,
    '03': true,
    '04': true,
    '05': true,
  })

  // Editable QA notes
  const [qaNotes, setQaNotes] = useState<Record<string, string>>({
    '03': 'Confirmed regression in staging auth-router v2.4.1',
    '04': '',
    '05': '',
  })
  const [editingNoteFor, setEditingNoteFor] = useState<string | null>(null)
  const [noteDraft, setNoteDraft] = useState('')

  useEffect(() => {
    loadRunData()
  }, [params.id])

  async function loadRunData() {
    setLoading(true)
    const data = await mockClient.getRunById(params.id)
    setRun(data)
    if (data?.taskId) {
      const taskData = await mockClient.getTaskById(data.taskId)
      setTask(taskData)
    } else {
      setTask(null)
    }
    setLoading(false)
  }

  function toggleCase(caseNumber: string) {
    setExpandedCases((prev) => ({
      ...prev,
      [caseNumber]: !prev[caseNumber],
    }))
  }

  function handleSaveNote(caseNumber: string) {
    if (noteDraft.trim()) {
      setQaNotes((prev) => ({
        ...prev,
        [caseNumber]: noteDraft.trim(),
      }))
      toast.success('Post-run QA note saved')
    }
    setEditingNoteFor(null)
    setNoteDraft('')
  }

  function handleExport() {
    const reportData = {
      id: run?.id || params.id,
      taskTitle: run?.taskTitle || 'Dispatcher role redirect & Tracking verification',
      environment: run?.environment || 'staging',
      status: run?.status || 'failed',
      passRate: run?.passRate || 71.4,
      cases: '3/5 Passed',
      steps: '7 Total (5 Passed, 1 Failed, 1 Skipped)',
      duration: '19.30s',
      timestamp: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report_${params.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Report downloaded')
  }

  function handleShare() {
    const link = `https://testingagent.internal/reports/${params.id}?token=sh_${Math.random().toString(36).substring(2, 9)}`
    setShareLink(link)
    setShareOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-1/4"></div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl"></div>
          ))}
        </div>
        <div className="h-40 bg-gray-100 rounded-xl"></div>
      </div>
    )
  }

  const isFailed = run ? run.status === 'failed' : params.id === 'run-940'
  const isPassed = run ? run.status === 'passed' : params.id !== 'run-940'
  const currentRunId = run?.id || params.id || 'run-940'
  const targetTaskId = run?.taskId || task?.id || 'tsk-201'
  const targetTaskTitle = run?.taskTitle || task?.title || 'Dispatcher role redirect & Tracking verification'
  const targetWebsiteName = run?.websiteName || task?.websiteName || 'Logistics Portal'
  const targetPlanId = run?.planId || task?.currentPlanId || 'plan-1'
  const passRateDisplay = run?.passRate !== undefined ? `${run.passRate}%` : '100%'
  const totalCases = run?.totalCases || (run?.stepLogs?.length) || 3
  const passedCases = run?.passedCases !== undefined ? run.passedCases : (isPassed ? totalCases : Math.max(0, totalCases - 1))
  const durationDisplay = run?.durationMs ? `${(run.durationMs / 1000).toFixed(2)}s` : '1.42s'
  const totalSteps = run?.stepLogs?.length || 3
  const passedSteps = run?.stepLogs?.filter((s) => s.status === 'passed').length || (isPassed ? totalSteps : Math.max(0, totalSteps - 1))

  return (
    <div className="space-y-5">
      {/* Top Banner Row: Reports / run-id + Immutable Report badge + Related Task */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[13px] text-[var(--text-muted)] font-medium">
            Reports / <span className="text-[var(--text)] font-semibold">{currentRunId}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-amber-500 bg-amber-500/10 border border-amber-500/20">
            <Lock className="h-3 w-3" /> Immutable Report
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <span className="text-indigo-400/80 font-normal">Related Task:</span>
            <Link
              href={`/tasks/${targetTaskId}`}
              className="font-mono font-semibold hover:underline flex items-center gap-0.5"
            >
              {targetTaskId}
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </span>
        </div>
      </div>

      {/* Main Title Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-[20px] font-bold text-[var(--text)] tracking-tight">
              {targetTaskTitle}
            </h1>
            {isFailed ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                ✕ Failed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ✓ Passed
              </span>
            )}
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase">
              {run?.environment || 'STAGING'}
            </span>
          </div>

          {/* Connected Context: Task, Website, Plan, Trigger Meta */}
          <div className="flex items-center gap-2 mt-2 flex-wrap text-[12px]">
            <span className="text-[var(--text-muted)] font-medium">Task:</span>
            <Link
              href={`/tasks/${targetTaskId}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-medium border border-indigo-500/30 transition-colors shadow-2xs"
            >
              <span className="font-mono font-semibold">{targetTaskId}</span>
              <span className="text-indigo-400/60">·</span>
              <span className="font-medium text-[var(--text)]">{targetTaskTitle}</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            </Link>

            <span className="text-[var(--border)]">|</span>
            <span className="text-[var(--text-muted)] font-medium">Website:</span>
            <span className="text-[var(--text)] font-medium">{targetWebsiteName}</span>

            {targetPlanId && (
              <>
                <span className="text-[var(--border)]">|</span>
                <span className="text-[var(--text-muted)] font-medium">Plan:</span>
                <Link
                  href={`/plans/${targetPlanId}`}
                  className="font-mono text-[var(--text)] hover:text-indigo-400 hover:underline flex items-center gap-0.5"
                >
                  {targetPlanId}
                  <ArrowUpRight className="h-3 w-3 text-[var(--text-muted)]" />
                </Link>
              </>
            )}

            <span className="text-[var(--border)]">|</span>
            <span className="text-[var(--text-muted)] font-mono text-[11px]">
              Run: {currentRunId} · {run?.executor || 'http-executor'} · {run?.dateLabel || 'Today'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="secondary" size="sm" asChild>
            <Link href={`/tasks/${targetTaskId}`}>
              <ExternalLink className="h-3.5 w-3.5 text-[var(--text-muted)]" /> View Task
            </Link>
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download className="h-3.5 w-3.5 text-[var(--text-muted)]" /> Export JSON
          </Button>
          <Button variant="primary" size="sm" onClick={handleShare}>
            <Share2 className="h-3.5 w-3.5" /> Share link
          </Button>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Card 1: Pass Rate */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5">
          <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            PASS RATE
          </div>
          <div
            className={cn(
              'text-[22px] font-bold mt-0.5',
              isPassed ? 'text-[#16A34A]' : 'text-[#DC2626]'
            )}
          >
            {passRateDisplay}
          </div>
          <div
            className={cn(
              'text-[11px] font-mono mt-0.5',
              isPassed ? 'text-emerald-500' : 'text-red-400'
            )}
          >
            {isPassed ? '100% assertions satisfied' : '-28.6% vs baseline'}
          </div>
        </div>

        {/* Card 2: Cases */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5">
          <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            CASES
          </div>
          <div className="text-[20px] font-bold text-[var(--text)] mt-0.5">
            {passedCases} / {totalCases} Passed
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
            Atomic verifications
          </div>
        </div>

        {/* Card 3: Steps */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5">
          <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            STEPS
          </div>
          <div className="text-[20px] font-bold text-[var(--text)] mt-0.5">
            {totalSteps} Total
          </div>
          <div className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">
            {passedSteps} Passed · {Math.max(0, totalSteps - passedSteps)} Failed
          </div>
        </div>

        {/* Card 4: Duration */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5">
          <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            DURATION
          </div>
          <div className="text-[20px] font-bold text-[var(--text)] font-mono mt-0.5">
            {durationDisplay}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
            End-to-end execution
          </div>
        </div>

        {/* Card 5: AI Engine */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5">
          <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            AI ENGINE
          </div>
          <div className="text-[14px] font-bold text-[var(--text)] font-mono mt-1">
            {task?.model || task?.engineDisplay || 'ollama/qwen2.5:14b'}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
            Plan Execution Result
          </div>
        </div>
      </div>

      {/* Red Banner: Failure Details */}
      {isFailed && (
        <div className="rounded-[16px] border border-rose-900/50 overflow-hidden bg-[var(--surface)] shadow-none">
          <div className="bg-rose-950/20 px-5 py-3 flex items-center justify-between border-b border-rose-900/40">
            <span className="text-[13px] font-bold text-rose-400 flex items-center gap-1.5">
              ✕ Failure Details · 05 · Open dashboard / verify role redirect
            </span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono text-rose-400 bg-[var(--surface)] border border-rose-900/50 font-medium">
              category: assertion_failed
            </span>
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left: Expected vs Actual */}
            <div>
              <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                EXPECTED VS ACTUAL
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-3.5 space-y-1.5 text-[12px] font-mono">
                <p className="text-emerald-400">
                  <span className="font-semibold">Expected:</span> Final URL matches /dashboard (Dispatcher landing path)
                </p>
                <p className="text-rose-400">
                  <span className="font-semibold">Actual:</span> HTTP 302 redirected to /orders?from=login
                </p>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] font-mono mt-2.5 flex items-center gap-1.5">
                <span className="font-bold text-[var(--text)]">ℹ</span> Dependent step 06 (/tracking) was skipped; independent Case 05 still executed.
              </p>
            </div>

            {/* Right: Response Summary */}
            <div>
              <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                RESPONSE SUMMARY
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-3.5 text-[12px] font-mono text-[var(--text)] space-y-1">
                <p>GET /dashboard → 302 Found</p>
                <p>Location: /orders?from=login</p>
                <p>x-role-resolved: customer_fallback</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Per-Case Outcomes */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-[14px] font-semibold text-[var(--text)] mb-2">
            Per-Case Outcomes ({run?.stepLogs && run.stepLogs.length > 0 ? run.stepLogs.length : 5})
          </h2>

          {run?.stepLogs && run.stepLogs.length > 0 ? (
            run.stepLogs.map((log, idx) => {
              const num = String(idx + 1).padStart(2, '0')
              const isLogExpanded = expandedCases[num] !== false
              return (
                <div key={log.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 shadow-none">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleCase(num)}
                  >
                    <div className="flex items-center gap-2">
                      {isLogExpanded ? (
                        <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
                      )}
                      <span className="font-mono text-[12px] font-semibold text-[var(--text-muted)]">{num}</span>
                      <span className="text-[13px] font-medium text-[var(--text)]">{log.caseTitle || log.action}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] text-[var(--text-muted)] font-mono">{log.durationMs}ms</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        ✓ Passed
                      </span>
                    </div>
                  </div>

                  {isLogExpanded && (
                    <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                        <span>Validation: {log.validationType}</span>
                        <span>HTTP {log.responseSummary?.statusCode || 200} OK</span>
                      </div>
                      <p className="text-[12px] text-[var(--text)] bg-[var(--hover-subtle)] p-2.5 rounded-lg border border-[var(--border)] leading-relaxed font-sans">
                        {log.checkPerformed}
                      </p>
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <>
              {/* Case 01 */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 shadow-none">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleCase('01')}
            >
              <div className="flex items-center gap-2">
                {expandedCases['01'] ? (
                  <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
                )}
                <span className="font-mono text-[12px] font-semibold text-[var(--text-muted)]">01</span>
                <span className="text-[13px] font-medium text-[var(--text)]">
                  Login route & form structure accessible
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-[var(--text-muted)] font-mono">256ms</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ✓ Passed
                </span>
              </div>
            </div>
          </div>

          {/* Case 02 */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 shadow-none">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleCase('02')}
            >
              <div className="flex items-center gap-2">
                {expandedCases['02'] ? (
                  <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
                )}
                <span className="font-mono text-[12px] font-semibold text-[var(--text-muted)]">02</span>
                <span className="text-[13px] font-medium text-[var(--text)]">
                  Credentials validated and session issued
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-[var(--text-muted)] font-mono">550ms</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ✓ Passed
                </span>
              </div>
            </div>
          </div>

          {/* Case 03 (Failed) */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 shadow-none">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleCase('03')}
            >
              <div className="flex items-center gap-2">
                {expandedCases['03'] ? (
                  <ChevronDown className="h-4 w-4 text-[var(--text)]" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
                )}
                <span className="font-mono text-[12px] font-semibold text-[var(--text-muted)]">03</span>
                <span className="text-[13px] font-semibold text-[var(--text)]">
                  Role redirect to Dispatcher Dashboard
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-[var(--text-muted)] font-mono">384ms</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  ✕ Failed
                </span>
              </div>
            </div>

            {expandedCases['03'] && (
              <div className="mt-3 pt-3 border-t border-[var(--border)] overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[11px] font-semibold uppercase text-[var(--text-muted)] tracking-wider">
                      <th className="pb-2 font-medium w-10">#</th>
                      <th className="pb-2 font-medium">STEP & RECORDED DETAIL</th>
                      <th className="pb-2 font-medium">CHECK</th>
                      <th className="pb-2 font-medium">STATUS</th>
                      <th className="pb-2 font-medium text-right">TIME</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2.5 font-mono text-[var(--text-muted)] align-top">05</td>
                      <td className="py-2.5 align-top">
                        <div className="font-medium text-[var(--text)]">Open dashboard</div>
                        <div className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">
                          Expected /dashboard, received 302 → /orders?from=login
                        </div>
                        <div className="mt-2 p-2 rounded bg-[var(--surface-elevated)] border border-[var(--border)] text-[11px] text-[var(--text)] font-mono">
                          {qaNotes['03']}
                        </div>
                      </td>
                      <td className="py-2.5 font-mono text-[var(--text-muted)] align-top">redirect</td>
                      <td className="py-2.5 align-top">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          ✕ Failed
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-[var(--text-muted)] text-right align-top">384ms</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Case 04 (Skipped) */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 shadow-none">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleCase('04')}
            >
              <div className="flex items-center gap-2">
                {expandedCases['04'] ? (
                  <ChevronDown className="h-4 w-4 text-[var(--text)]" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
                )}
                <span className="font-mono text-[12px] font-semibold text-[var(--text-muted)]">04</span>
                <span className="text-[13px] font-medium text-[var(--text)]">
                  Dashboard to Tracking navigation
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-[var(--text-muted)] font-mono">0ms</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--hover-subtle)] text-[var(--text-muted)] border border-[var(--border)]">
                  - Skipped
                </span>
              </div>
            </div>

            {expandedCases['04'] && (
              <div className="mt-3 pt-3 border-t border-[var(--border)] overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[11px] font-semibold uppercase text-[var(--text-muted)] tracking-wider">
                      <th className="pb-2 font-medium w-10">#</th>
                      <th className="pb-2 font-medium">STEP & RECORDED DETAIL</th>
                      <th className="pb-2 font-medium">CHECK</th>
                      <th className="pb-2 font-medium">STATUS</th>
                      <th className="pb-2 font-medium text-right">TIME</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2.5 font-mono text-[var(--text-muted)] align-top">06</td>
                      <td className="py-2.5 align-top">
                        <div className="font-medium text-[var(--text)]">Open Tracking page</div>
                        <div className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">
                          Skipped due to failed parent dependency (Step 05)
                        </div>
                        {editingNoteFor === '04' ? (
                          <div className="mt-2 flex gap-2">
                            <input
                              type="text"
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value)}
                              placeholder="Write post-run QA note..."
                              className="text-xs border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] rounded px-2.5 py-1 flex-1"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveNote('04')}
                              className="text-xs bg-[#4F46E5] text-white px-2.5 py-1 rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingNoteFor(null)}
                              className="text-xs border border-[var(--border)] text-[var(--text-muted)] px-2 py-1 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : qaNotes['04'] ? (
                          <div className="mt-2 p-2 rounded bg-[var(--surface-elevated)] border border-[var(--border)] text-[11px] text-[var(--text)] font-mono">
                            {qaNotes['04']}
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingNoteFor('04')
                              setNoteDraft('')
                            }}
                            className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text)] mt-2 block"
                          >
                            + Add post-run QA note...
                          </button>
                        )}
                      </td>
                      <td className="py-2.5 font-mono text-[var(--text-muted)] align-top">navigation</td>
                      <td className="py-2.5 align-top">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--hover-subtle)] text-[var(--text-muted)] border border-[var(--border)]">
                          - Skipped
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-[var(--text-muted)] text-right align-top">0ms</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Case 05 (Passed) */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 shadow-none">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleCase('05')}
            >
              <div className="flex items-center gap-2">
                {expandedCases['05'] ? (
                  <ChevronDown className="h-4 w-4 text-[var(--text)]" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
                )}
                <span className="font-mono text-[12px] font-semibold text-[var(--text-muted)]">05</span>
                <span className="text-[13px] font-medium text-[var(--text)]">
                  Unauthenticated /tracking protection rule
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-[var(--text-muted)] font-mono">189ms</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ✓ Passed
                </span>
              </div>
            </div>

            {expandedCases['05'] && (
              <div className="mt-3 pt-3 border-t border-[var(--border)] overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[11px] font-semibold uppercase text-[var(--text-muted)] tracking-wider">
                      <th className="pb-2 font-medium w-10">#</th>
                      <th className="pb-2 font-medium">STEP & RECORDED DETAIL</th>
                      <th className="pb-2 font-medium">CHECK</th>
                      <th className="pb-2 font-medium">STATUS</th>
                      <th className="pb-2 font-medium text-right">TIME</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2.5 font-mono text-[var(--text-muted)] align-top">07</td>
                      <td className="py-2.5 align-top">
                        <div className="font-medium text-[var(--text)]">
                          Verify unauthenticated redirect rule
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">
                          Anonymous GET /tracking → 302 /login (Rule P1 passed)
                        </div>
                        {editingNoteFor === '05' ? (
                          <div className="mt-2 flex gap-2">
                            <input
                              type="text"
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value)}
                              placeholder="Write post-run QA note..."
                              className="text-xs border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] rounded px-2.5 py-1 flex-1"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveNote('05')}
                              className="text-xs bg-[#4F46E5] text-white px-2.5 py-1 rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingNoteFor(null)}
                              className="text-xs border border-[var(--border)] text-[var(--text-muted)] px-2 py-1 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : qaNotes['05'] ? (
                          <div className="mt-2 p-2 rounded bg-[var(--surface-elevated)] border border-[var(--border)] text-[11px] text-[var(--text)] font-mono">
                            {qaNotes['05']}
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingNoteFor('05')
                              setNoteDraft('')
                            }}
                            className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text)] mt-2 block"
                          >
                            + Add post-run QA note...
                          </button>
                        )}
                      </td>
                      <td className="py-2.5 font-mono text-[var(--text-muted)] align-top">content_rule</td>
                      <td className="py-2.5 align-top">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          ✓ Passed
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-[var(--text-muted)] text-right align-top">189ms</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
            </>
          )}
        </div>

        {/* Right Column: Chronological Timeline */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-none">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[15px] font-bold text-[var(--text)] tracking-tight">
                Chronological Timeline
              </h2>
              <span className="text-[13px] text-[var(--text-muted)] font-mono font-medium">
                {run?.stepLogs && run.stepLogs.length > 0 ? run.stepLogs.length : 7} steps
              </span>
            </div>

            <div className="relative pl-7 space-y-5 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-[var(--border)]">
              {run?.stepLogs && run.stepLogs.length > 0 ? (
                run.stepLogs.map((log, idx) => (
                  <div key={log.id} className="relative flex items-start justify-between gap-2">
                    <span className="absolute left-[7px] -translate-x-1/2 top-1.5 h-2 w-2 rounded-full bg-[#10B981] ring-4 ring-[var(--surface)]" />
                    <div>
                      <p className="text-[13px] font-medium text-[var(--text)]">
                        {String(idx + 1).padStart(2, '0')}. {log.caseTitle || log.action}
                      </p>
                      <p className="text-[12px] text-[var(--text-muted)] font-mono mt-0.5">
                        {log.validationType}
                      </p>
                    </div>
                    <span className="text-[12px] text-[var(--text-muted)] font-mono shrink-0">
                      {log.durationMs}ms
                    </span>
                  </div>
                ))
              ) : (
                <>
                  {/* Step 1 */}
              <div className="relative flex items-start justify-between gap-2">
                <span className="absolute left-[7px] -translate-x-1/2 top-1.5 h-2 w-2 rounded-full bg-[#10B981] ring-4 ring-[var(--surface)]" />
                <div>
                  <p className="text-[13px] font-medium text-[var(--text)]">
                    01. Open login page
                  </p>
                  <p className="text-[12px] text-[var(--text-muted)] font-mono mt-0.5">
                    14:10:04.120 · route_check
                  </p>
                </div>
                <span className="text-[12px] text-[var(--text-muted)] font-mono shrink-0">
                  214ms
                </span>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-start justify-between gap-2">
                <span className="absolute left-[7px] -translate-x-1/2 top-1.5 h-2 w-2 rounded-full bg-[#10B981] ring-4 ring-[var(--surface)]" />
                <div>
                  <p className="text-[13px] font-medium text-[var(--text)]">
                    02. Verify form fields
                  </p>
                  <p className="text-[12px] text-[var(--text-muted)] font-mono mt-0.5">
                    14:10:04.340 · form_structure
                  </p>
                </div>
                <span className="text-[12px] text-[var(--text-muted)] font-mono shrink-0">
                  42ms
                </span>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-start justify-between gap-2">
                <span className="absolute left-[7px] -translate-x-1/2 top-1.5 h-2 w-2 rounded-full bg-[#10B981] ring-4 ring-[var(--surface)]" />
                <div>
                  <p className="text-[13px] font-medium text-[var(--text)]">
                    03. Inject encrypted role secret
                  </p>
                  <p className="text-[12px] text-[var(--text-muted)] font-mono mt-0.5">
                    14:10:04.390 · form_structure
                  </p>
                </div>
                <span className="text-[12px] text-[var(--text-muted)] font-mono shrink-0">
                  38ms
                </span>
              </div>

              {/* Step 4 */}
              <div className="relative flex items-start justify-between gap-2">
                <span className="absolute left-[7px] -translate-x-1/2 top-1.5 h-2 w-2 rounded-full bg-[#10B981] ring-4 ring-[var(--surface)]" />
                <div>
                  <p className="text-[13px] font-medium text-[var(--text)]">
                    04. Submit login form
                  </p>
                  <p className="text-[12px] text-[var(--text-muted)] font-mono mt-0.5">
                    14:10:04.910 · auth_response
                  </p>
                </div>
                <span className="text-[12px] text-[var(--text-muted)] font-mono shrink-0">
                  512ms
                </span>
              </div>

              {/* Step 5 (Red) */}
              <div className="relative flex items-start justify-between gap-2">
                <span className="absolute left-[7px] -translate-x-1/2 top-1.5 h-2 w-2 rounded-full bg-[#EF4444] ring-4 ring-[var(--surface)]" />
                <div>
                  <p className="text-[13px] font-medium text-[var(--text)]">
                    05. Open dashboard
                  </p>
                  <p className="text-[12px] text-[var(--text-muted)] font-mono mt-0.5">
                    14:10:05.310 · redirect
                  </p>
                </div>
                <span className="text-[12px] text-[var(--text-muted)] font-mono shrink-0">
                  384ms
                </span>
              </div>

              {/* Step 6 (Gray) */}
              <div className="relative flex items-start justify-between gap-2">
                <span className="absolute left-[7px] -translate-x-1/2 top-1.5 h-2 w-2 rounded-full bg-[var(--text-muted)] ring-4 ring-[var(--surface)]" />
                <div>
                  <p className="text-[13px] font-medium text-[var(--text)]">
                    06. Open Tracking page
                  </p>
                  <p className="text-[12px] text-[var(--text-muted)] font-mono mt-0.5">
                    14:10:05.320 · navigation
                  </p>
                </div>
                <span className="text-[12px] text-[var(--text-muted)] font-mono shrink-0">
                  0ms
                </span>
              </div>

              {/* Step 7 */}
              <div className="relative flex items-start justify-between gap-2">
                <span className="absolute left-[7px] -translate-x-1/2 top-1.5 h-2 w-2 rounded-full bg-[#10B981] ring-4 ring-[var(--surface)]" />
                <div>
                  <p className="text-[13px] font-medium text-[var(--text)]">
                    07. Verify unauthenticated redirect rule
                  </p>
                  <p className="text-[12px] text-[var(--text-muted)] font-mono mt-0.5">
                    14:10:05.515 · content_rule
                  </p>
                </div>
                <span className="text-[12px] text-[var(--text-muted)] font-mono shrink-0">
                  189ms
                </span>
              </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-md bg-[var(--surface)] border-[var(--border)] text-[var(--text)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--text)]">Share Immutable Report</DialogTitle>
            <DialogDescription className="text-[var(--text-muted)]">
              Anyone with this cryptographic link can inspect this test report without modifying results.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-2 space-y-3">
            <input
              type="text"
              readOnly
              value={shareLink}
              className="w-full text-xs font-mono border border-[var(--border)] rounded-lg p-2.5 bg-[var(--surface-elevated)] text-[var(--text)] select-all"
            />
            <Button
              variant="primary"
              onClick={() => {
                navigator.clipboard.writeText(shareLink)
                toast.success('Share link copied!')
                setShareOpen(false)
              }}
              className="w-full py-2 text-xs font-medium"
            >
              Copy to Clipboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
