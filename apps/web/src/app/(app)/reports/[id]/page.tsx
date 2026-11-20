'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Lock,
  ChevronDown,
  ChevronRight,
  Play,
  Share2,
  Download,
  ArrowLeftRight,
  ArrowUpRight,
  ExternalLink,
  Check,
  X,
  Clock,
  Plus,
} from 'lucide-react'
import { mockClient } from '@/mocks/mockClient'
import type { Run } from '@/mocks/data/runs.mock'
import type { Task } from '@/mocks/data/tasks.mock'
import { toast } from 'sonner'
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

  function handleSelectSample(sampleId: string) {
    router.push(`/reports/${sampleId}`)
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

  async function handleRerun() {
    try {
      const newRun = await mockClient.triggerRun(run?.planId || 'plan-1')
      toast.success('Re-run triggered successfully!')
      router.push(`/reports/${newRun.id}`)
    } catch {
      toast.error('Failed to trigger re-run')
    }
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
  const passRateDisplay = run?.passRate !== undefined ? `${run.passRate}%` : '71.4%'
  const totalCases = run?.totalCases || 5
  const passedCases = run?.passedCases || 3
  const durationDisplay = run?.durationMs ? `${(run.durationMs / 1000).toFixed(2)}s` : '19.30s'

  return (
    <div className="space-y-5">
      {/* Top Banner Row: Reports / run-id + Immutable Report badge + Related Task + Preview sample dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[13px] text-gray-500 font-medium">
            Reports / <span className="text-gray-900 font-semibold">{currentRunId}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-amber-700 bg-amber-50 border border-amber-200">
            <Lock className="h-3 w-3" /> Immutable Report
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span className="text-indigo-400 font-normal">Related Task:</span>
            <Link
              href={`/tasks/${targetTaskId}`}
              className="font-mono font-semibold hover:underline flex items-center gap-0.5"
            >
              {targetTaskId}
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </span>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[12px] text-gray-400">Preview sample:</span>
          <select
            value={currentRunId}
            onChange={(e) => handleSelectSample(e.target.value)}
            className="h-8 px-2.5 text-[12px] font-mono font-medium bg-white border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="run-940">run-940 (Failed - tsk-201)</option>
            <option value="run-941">run-941 (Passed - tsk-200)</option>
            <option value="run-939">run-939 (Passed - tsk-199)</option>
            <option value="run-937">run-937 (Passed - tsk-201)</option>
            <option value="run-936">run-936 (Error - tsk-198)</option>
          </select>
        </div>
      </div>

      {/* Main Title Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">
              {targetTaskTitle}
            </h1>
            {isFailed ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#FEE2E2] text-[#DC2626] border border-rose-200">
                ✕ Failed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#DCFCE7] text-[#16A34A] border border-emerald-200">
                ✓ Passed
              </span>
            )}
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#E0F2FE] text-[#0284C7] uppercase">
              {run?.environment || 'STAGING'}
            </span>
          </div>

          {/* Connected Context: Task, Website, Plan, Trigger Meta */}
          <div className="flex items-center gap-2 mt-2 flex-wrap text-[12px]">
            <span className="text-gray-500 font-medium">Task:</span>
            <Link
              href={`/tasks/${targetTaskId}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] font-medium border border-indigo-200/80 transition-colors shadow-2xs"
            >
              <span className="font-mono font-semibold">{targetTaskId}</span>
              <span className="text-indigo-300">·</span>
              <span className="font-medium text-gray-800">{targetTaskTitle}</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#4F46E5] shrink-0" />
            </Link>

            <span className="text-gray-300">|</span>
            <span className="text-gray-500 font-medium">Website:</span>
            <span className="text-gray-800 font-medium">{targetWebsiteName}</span>

            {targetPlanId && (
              <>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500 font-medium">Plan:</span>
                <Link
                  href={`/plans/${targetPlanId}`}
                  className="font-mono text-gray-700 hover:text-indigo-600 hover:underline flex items-center gap-0.5"
                >
                  {targetPlanId}
                  <ArrowUpRight className="h-3 w-3 text-gray-400" />
                </Link>
              </>
            )}

            <span className="text-gray-300">|</span>
            <span className="text-gray-400 font-mono text-[11px]">
              Run: {currentRunId} · {run?.executor || 'http-executor'} · {run?.dateLabel || 'Today'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/tasks/${targetTaskId}`}
            className="px-3 py-1.5 text-[12px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="h-3.5 w-3.5 text-gray-500" /> View Task
          </Link>
          <Link
            href="/reports/compare"
            className="px-3.5 py-1.5 text-[12px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeftRight className="h-3.5 w-3.5 text-gray-500" /> Compare vs baseline
          </Link>
          <button
            onClick={handleExport}
            className="px-3.5 py-1.5 text-[12px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5 text-gray-500" /> Export
          </button>
          <button
            onClick={handleShare}
            className="px-3.5 py-1.5 text-[12px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            <Share2 className="h-3.5 w-3.5 text-gray-500" /> Share link
          </button>
          <button
            onClick={handleRerun}
            className="px-4 py-1.5 text-[12px] font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Play className="h-3.5 w-3.5 fill-current" /> Re-run
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Card 1: Pass Rate */}
        <div className="rounded-xl border border-gray-200 bg-white p-3.5">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            PASS RATE
          </div>
          <div className="text-[22px] font-bold text-[#DC2626] mt-0.5">
            {passRateDisplay}
          </div>
          <div className="text-[11px] text-red-500 font-mono mt-0.5">
            -28.6% vs run-937
          </div>
        </div>

        {/* Card 2: Cases */}
        <div className="rounded-xl border border-gray-200 bg-white p-3.5">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            CASES
          </div>
          <div className="text-[20px] font-bold text-gray-900 mt-0.5">
            {passedCases} / {totalCases} Passed
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">
            Atomic verifications
          </div>
        </div>

        {/* Card 3: Steps */}
        <div className="rounded-xl border border-gray-200 bg-white p-3.5">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            STEPS
          </div>
          <div className="text-[20px] font-bold text-gray-900 mt-0.5">
            7 Total
          </div>
          <div className="text-[11px] text-gray-400 font-mono mt-0.5">
            5 Passed · 1 Failed · 1 Skipped
          </div>
        </div>

        {/* Card 4: Duration */}
        <div className="rounded-xl border border-gray-200 bg-white p-3.5">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            DURATION
          </div>
          <div className="text-[20px] font-bold text-gray-900 font-mono mt-0.5">
            {durationDisplay}
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">
            End-to-end execution
          </div>
        </div>

        {/* Card 5: AI Engine */}
        <div className="rounded-xl border border-gray-200 bg-white p-3.5">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            AI ENGINE
          </div>
          <div className="text-[14px] font-bold text-gray-900 font-mono mt-1">
            ollama/qwen2.5:14b
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">
            Approved Plan v2
          </div>
        </div>
      </div>

      {/* Red Banner: Failure Details */}
      {isFailed && (
        <div className="rounded-[16px] border border-[#FECACA] overflow-hidden bg-white shadow-none">
          <div className="bg-[#FEF2F2] px-5 py-3 flex items-center justify-between border-b border-[#FEE2E2]">
            <span className="text-[13px] font-bold text-[#DC2626] flex items-center gap-1.5">
              ✕ Failure Details · 05 · Open dashboard / verify role redirect
            </span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono text-[#DC2626] bg-white border border-[#FECACA] font-medium">
              category: assertion_failed
            </span>
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left: Expected vs Actual */}
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                EXPECTED VS ACTUAL
              </div>
              <div className="rounded-lg border border-gray-200/80 bg-white p-3.5 space-y-1.5 text-[12px] font-mono">
                <p className="text-[#16A34A]">
                  <span className="font-semibold">Expected:</span> Final URL matches /dashboard (Dispatcher landing path)
                </p>
                <p className="text-[#DC2626]">
                  <span className="font-semibold">Actual:</span> HTTP 302 redirected to /orders?from=login
                </p>
              </div>
              <p className="text-[11px] text-gray-500 font-mono mt-2.5 flex items-center gap-1.5">
                <span className="font-bold text-gray-600">ℹ</span> Dependent step 06 (/tracking) was skipped; independent Case 05 still executed.
              </p>
            </div>

            {/* Right: Response Summary */}
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                RESPONSE SUMMARY
              </div>
              <div className="rounded-lg border border-gray-200/80 bg-white p-3.5 text-[12px] font-mono text-gray-700 space-y-1">
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
        {/* Left Column: Per-Case Outcomes (5) */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-[14px] font-semibold text-gray-900 mb-2">
            Per-Case Outcomes (5)
          </h2>

          {/* Case 01 */}
          <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-none">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleCase('01')}
            >
              <div className="flex items-center gap-2">
                {expandedCases['01'] ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
                <span className="font-mono text-[12px] font-semibold text-gray-500">01</span>
                <span className="text-[13px] font-medium text-gray-900">
                  Login route & form structure accessible
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-gray-400 font-mono">256ms</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#DCFCE7] text-[#16A34A]">
                  ✓ Passed
                </span>
              </div>
            </div>
          </div>

          {/* Case 02 */}
          <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-none">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleCase('02')}
            >
              <div className="flex items-center gap-2">
                {expandedCases['02'] ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
                <span className="font-mono text-[12px] font-semibold text-gray-500">02</span>
                <span className="text-[13px] font-medium text-gray-900">
                  Credentials validated and session issued
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-gray-400 font-mono">550ms</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#DCFCE7] text-[#16A34A]">
                  ✓ Passed
                </span>
              </div>
            </div>
          </div>

          {/* Case 03 (Failed) */}
          <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-none">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleCase('03')}
            >
              <div className="flex items-center gap-2">
                {expandedCases['03'] ? (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
                <span className="font-mono text-[12px] font-semibold text-gray-500">03</span>
                <span className="text-[13px] font-semibold text-gray-900">
                  Role redirect to Dispatcher Dashboard
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-gray-400 font-mono">384ms</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FEE2E2] text-[#DC2626]">
                  ✕ Failed
                </span>
              </div>
            </div>

            {expandedCases['03'] && (
              <div className="mt-3 pt-3 border-t border-gray-100 overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-gray-100 text-[11px] font-semibold uppercase text-gray-400 tracking-wider">
                      <th className="pb-2 font-medium w-10">#</th>
                      <th className="pb-2 font-medium">STEP & RECORDED DETAIL</th>
                      <th className="pb-2 font-medium">CHECK</th>
                      <th className="pb-2 font-medium">STATUS</th>
                      <th className="pb-2 font-medium text-right">TIME</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2.5 font-mono text-gray-400 align-top">05</td>
                      <td className="py-2.5 align-top">
                        <div className="font-medium text-gray-900">Open dashboard</div>
                        <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                          Expected /dashboard, received 302 → /orders?from=login
                        </div>
                        <div className="mt-2 p-2 rounded bg-gray-50 border border-gray-100 text-[11px] text-gray-700 font-mono">
                          {qaNotes['03']}
                        </div>
                      </td>
                      <td className="py-2.5 font-mono text-gray-600 align-top">redirect</td>
                      <td className="py-2.5 align-top">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FEE2E2] text-[#DC2626]">
                          ✕ Failed
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-gray-600 text-right align-top">384ms</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Case 04 (Skipped) */}
          <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-none">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleCase('04')}
            >
              <div className="flex items-center gap-2">
                {expandedCases['04'] ? (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
                <span className="font-mono text-[12px] font-semibold text-gray-500">04</span>
                <span className="text-[13px] font-medium text-gray-900">
                  Dashboard to Tracking navigation
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-gray-400 font-mono">0ms</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500">
                  - Skipped
                </span>
              </div>
            </div>

            {expandedCases['04'] && (
              <div className="mt-3 pt-3 border-t border-gray-100 overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-gray-100 text-[11px] font-semibold uppercase text-gray-400 tracking-wider">
                      <th className="pb-2 font-medium w-10">#</th>
                      <th className="pb-2 font-medium">STEP & RECORDED DETAIL</th>
                      <th className="pb-2 font-medium">CHECK</th>
                      <th className="pb-2 font-medium">STATUS</th>
                      <th className="pb-2 font-medium text-right">TIME</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2.5 font-mono text-gray-400 align-top">06</td>
                      <td className="py-2.5 align-top">
                        <div className="font-medium text-gray-900">Open Tracking page</div>
                        <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                          Skipped due to failed parent dependency (Step 05)
                        </div>
                        {editingNoteFor === '04' ? (
                          <div className="mt-2 flex gap-2">
                            <input
                              type="text"
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value)}
                              placeholder="Write post-run QA note..."
                              className="text-xs border border-gray-200 rounded px-2.5 py-1 flex-1"
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
                              className="text-xs border border-gray-200 px-2 py-1 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : qaNotes['04'] ? (
                          <div className="mt-2 p-2 rounded bg-gray-50 border border-gray-100 text-[11px] text-gray-700 font-mono">
                            {qaNotes['04']}
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingNoteFor('04')
                              setNoteDraft('')
                            }}
                            className="text-[11px] text-gray-400 hover:text-gray-700 mt-2 block"
                          >
                            + Add post-run QA note...
                          </button>
                        )}
                      </td>
                      <td className="py-2.5 font-mono text-gray-600 align-top">navigation</td>
                      <td className="py-2.5 align-top">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500">
                          - Skipped
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-gray-600 text-right align-top">0ms</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Case 05 (Passed) */}
          <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-none">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleCase('05')}
            >
              <div className="flex items-center gap-2">
                {expandedCases['05'] ? (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
                <span className="font-mono text-[12px] font-semibold text-gray-500">05</span>
                <span className="text-[13px] font-medium text-gray-900">
                  Unauthenticated /tracking protection rule
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-gray-400 font-mono">189ms</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#DCFCE7] text-[#16A34A]">
                  ✓ Passed
                </span>
              </div>
            </div>

            {expandedCases['05'] && (
              <div className="mt-3 pt-3 border-t border-gray-100 overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-gray-100 text-[11px] font-semibold uppercase text-gray-400 tracking-wider">
                      <th className="pb-2 font-medium w-10">#</th>
                      <th className="pb-2 font-medium">STEP & RECORDED DETAIL</th>
                      <th className="pb-2 font-medium">CHECK</th>
                      <th className="pb-2 font-medium">STATUS</th>
                      <th className="pb-2 font-medium text-right">TIME</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2.5 font-mono text-gray-400 align-top">07</td>
                      <td className="py-2.5 align-top">
                        <div className="font-medium text-gray-900">
                          Verify unauthenticated redirect rule
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                          Anonymous GET /tracking → 302 /login (Rule P1 passed)
                        </div>
                        {editingNoteFor === '05' ? (
                          <div className="mt-2 flex gap-2">
                            <input
                              type="text"
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value)}
                              placeholder="Write post-run QA note..."
                              className="text-xs border border-gray-200 rounded px-2.5 py-1 flex-1"
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
                              className="text-xs border border-gray-200 px-2 py-1 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : qaNotes['05'] ? (
                          <div className="mt-2 p-2 rounded bg-gray-50 border border-gray-100 text-[11px] text-gray-700 font-mono">
                            {qaNotes['05']}
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingNoteFor('05')
                              setNoteDraft('')
                            }}
                            className="text-[11px] text-gray-400 hover:text-gray-700 mt-2 block"
                          >
                            + Add post-run QA note...
                          </button>
                        )}
                      </td>
                      <td className="py-2.5 font-mono text-gray-600 align-top">content_rule</td>
                      <td className="py-2.5 align-top">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#DCFCE7] text-[#16A34A]">
                          ✓ Passed
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-gray-600 text-right align-top">189ms</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chronological Timeline */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-[16px] border border-gray-200 bg-white p-6 shadow-none">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">
                Chronological Timeline
              </h2>
              <span className="text-[13px] text-gray-500 font-mono font-medium">
                7 steps
              </span>
            </div>

            <div className="relative pl-7 space-y-5 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-200">
              {/* Step 1 */}
              <div className="relative flex items-start justify-between gap-2">
                <span className="absolute left-[7px] -translate-x-1/2 top-1.5 h-2 w-2 rounded-full bg-[#10B981] ring-4 ring-white" />
                <div>
                  <p className="text-[13px] font-medium text-gray-900">
                    01. Open login page
                  </p>
                  <p className="text-[12px] text-gray-400 font-mono mt-0.5">
                    14:10:04.120 · route_check
                  </p>
                </div>
                <span className="text-[12px] text-gray-500 font-mono shrink-0">
                  214ms
                </span>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-start justify-between gap-2">
                <span className="absolute left-[7px] -translate-x-1/2 top-1.5 h-2 w-2 rounded-full bg-[#10B981] ring-4 ring-white" />
                <div>
                  <p className="text-[13px] font-medium text-gray-900">
                    02. Verify form fields
                  </p>
                  <p className="text-[12px] text-gray-400 font-mono mt-0.5">
                    14:10:04.340 · form_structure
                  </p>
                </div>
                <span className="text-[12px] text-gray-500 font-mono shrink-0">
                  42ms
                </span>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-start justify-between gap-2">
                <span className="absolute left-[7px] -translate-x-1/2 top-1.5 h-2 w-2 rounded-full bg-[#10B981] ring-4 ring-white" />
                <div>
                  <p className="text-[13px] font-medium text-gray-900">
                    03. Inject encrypted role secret
                  </p>
                  <p className="text-[12px] text-gray-400 font-mono mt-0.5">
                    14:10:04.390 · form_structure
                  </p>
                </div>
                <span className="text-[12px] text-gray-500 font-mono shrink-0">
                  38ms
                </span>
              </div>

              {/* Step 4 */}
              <div className="relative flex items-start justify-between gap-2">
                <span className="absolute left-[7px] -translate-x-1/2 top-1.5 h-2 w-2 rounded-full bg-[#10B981] ring-4 ring-white" />
                <div>
                  <p className="text-[13px] font-medium text-gray-900">
                    04. Submit login form
                  </p>
                  <p className="text-[12px] text-gray-400 font-mono mt-0.5">
                    14:10:04.910 · auth_response
                  </p>
                </div>
                <span className="text-[12px] text-gray-500 font-mono shrink-0">
                  512ms
                </span>
              </div>

              {/* Step 5 (Red) */}
              <div className="relative flex items-start justify-between gap-2">
                <span className="absolute left-[7px] -translate-x-1/2 top-1.5 h-2 w-2 rounded-full bg-[#EF4444] ring-4 ring-white" />
                <div>
                  <p className="text-[13px] font-medium text-gray-900">
                    05. Open dashboard
                  </p>
                  <p className="text-[12px] text-gray-400 font-mono mt-0.5">
                    14:10:05.310 · redirect
                  </p>
                </div>
                <span className="text-[12px] text-gray-500 font-mono shrink-0">
                  384ms
                </span>
              </div>

              {/* Step 6 (Gray) */}
              <div className="relative flex items-start justify-between gap-2">
                <span className="absolute left-[7px] -translate-x-1/2 top-1.5 h-2 w-2 rounded-full bg-[#CBD5E1] ring-4 ring-white" />
                <div>
                  <p className="text-[13px] font-medium text-gray-900">
                    06. Open Tracking page
                  </p>
                  <p className="text-[12px] text-gray-400 font-mono mt-0.5">
                    14:10:05.320 · navigation
                  </p>
                </div>
                <span className="text-[12px] text-gray-500 font-mono shrink-0">
                  0ms
                </span>
              </div>

              {/* Step 7 */}
              <div className="relative flex items-start justify-between gap-2">
                <span className="absolute left-[7px] -translate-x-1/2 top-1.5 h-2 w-2 rounded-full bg-[#10B981] ring-4 ring-white" />
                <div>
                  <p className="text-[13px] font-medium text-gray-900">
                    07. Verify unauthenticated redirect rule
                  </p>
                  <p className="text-[12px] text-gray-400 font-mono mt-0.5">
                    14:10:05.515 · content_rule
                  </p>
                </div>
                <span className="text-[12px] text-gray-500 font-mono shrink-0">
                  189ms
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Immutable Report</DialogTitle>
            <DialogDescription>
              Anyone with this cryptographic link can inspect this test report without modifying results.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-2 space-y-3">
            <input
              type="text"
              readOnly
              value={shareLink}
              className="w-full text-xs font-mono border border-gray-200 rounded-lg p-2.5 bg-gray-50 select-all"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareLink)
                toast.success('Share link copied!')
                setShareOpen(false)
              }}
              className="w-full py-2 bg-[#4F46E5] text-white text-xs font-medium rounded-lg hover:bg-[#4338CA] transition-colors"
            >
              Copy to Clipboard
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
