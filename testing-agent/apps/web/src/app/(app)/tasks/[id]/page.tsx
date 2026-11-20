'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Play, Sparkles, Copy, Archive, ExternalLink, Plus } from 'lucide-react'
import { mockClient } from '@/mocks/mockClient'
import type { Task } from '@/mocks/data/tasks.mock'
import type { TestPlan } from '@/mocks/data/plans.mock'
import type { Run } from '@/mocks/data/runs.mock'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [task, setTask] = useState<Task | null>(null)
  const [plan, setPlan] = useState<TestPlan | null>(null)
  const [runs, setRuns] = useState<Run[]>([])
  const [loading, setLoading] = useState(true)
  const [generateModalOpen, setGenerateModalOpen] = useState(false)
  const [feedbackInput, setFeedbackInput] = useState('')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    loadData()
  }, [params.id])

  async function loadData() {
    setLoading(true)
    const t = await mockClient.getTaskById(params.id)
    if (t) {
      setTask(t)
      const planId = t.currentPlanId || 'plan-3'
      const p = await mockClient.getPlanById(planId)
      setPlan(p)
      const allRuns = await mockClient.getRuns()
      const taskRuns = allRuns.filter((r) => r.taskId === params.id)
      setRuns(taskRuns.length > 0 ? taskRuns : [
        {
          id: 'run-942',
          taskId: t.id,
          taskTitle: t.title,
          planId: planId,
          planVersion: 2,
          status: 'passed',
          totalCases: 5,
          passedCases: 5,
          totalSteps: 7,
          passedSteps: 7,
          passRate: 100,
          durationMs: 1420,
          startedAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 13.9 * 60 * 1000).toISOString(),
          stepLogs: [],
        } as unknown as Run
      ])
    }
    setLoading(false)
  }

  async function handleTriggerRun() {
    const planId = task?.currentPlanId || 'plan-3'
    try {
      const newRun = await mockClient.triggerRun(planId)
      toast.success('Test execution initiated!')
      router.push(`/runs/${newRun.id}`)
    } catch {
      toast.error('Failed to trigger run')
    }
  }

  async function handleGeneratePlan(e: React.FormEvent) {
    e.preventDefault()
    if (!task) return
    setGenerating(true)
    try {
      const newPlan = await mockClient.generatePlan(task.id, feedbackInput)
      setGenerateModalOpen(false)
      toast.success(`Generated Plan v${newPlan.version}`)
      router.push(`/plans/${newPlan.id}`)
    } catch {
      toast.error('Failed to generate plan')
    } finally {
      setGenerating(false)
    }
  }

  function handleCloneTask() {
    toast.success('Task cloned as draft')
    router.push('/tasks')
  }

  function handleArchiveTask() {
    toast.success('Task archived')
    router.push('/tasks')
  }

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-10 bg-gray-100 rounded-lg w-1/3"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="h-44 bg-gray-100 rounded-xl"></div>
            <div className="h-56 bg-gray-100 rounded-xl"></div>
          </div>
          <div className="lg:col-span-1">
            <div className="h-80 bg-gray-100 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="py-16 text-center text-gray-500">
        Task not found. <Link href="/tasks" className="text-indigo-600 underline ml-1">Return to Tasks</Link>
      </div>
    )
  }

  const promptText = task.prompt || 'Verify login and open the Tracking page as Dispatcher. Confirm the login form renders email and password controls, submits valid credentials, issues a session cookie, redirects to /dashboard, navigates to /tracking, and displays the expected Live Shipment Tracking heading.'
  const displayId = task.displayId || task.id || 'tsk-201'
  const roleName = task.roleName || 'Dispatcher'
  const engineText = task.engineDisplay || task.model || 'ollama/qwen2.5:14b'
  const priority = task.priority ? task.priority.toUpperCase() : 'P1'
  const targetPlanId = task.currentPlanId || 'plan-3'

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">
              {task.title}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]">
              ✓ Approved
            </span>
          </div>
          <p className="text-[12px] text-gray-500 font-mono mt-1">
            {displayId} · Role: {roleName} · Engine: {engineText} · Priority: {priority}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleArchiveTask}
            className="px-3.5 py-1.5 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-none"
          >
            Archive
          </button>
          <button
            onClick={handleCloneTask}
            className="px-3.5 py-1.5 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-none"
          >
            Clone
          </button>
          <button
            onClick={() => setGenerateModalOpen(true)}
            className="px-3.5 py-1.5 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5 shadow-none"
          >
            ✦ Generate plan
          </button>
          <button
            onClick={handleTriggerRun}
            className="px-4 py-1.5 text-[13px] font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Play className="h-3.5 w-3.5 fill-current" /> Run plan
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Card 1: Natural-Language Prompt */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-none">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-gray-900">
                Natural-Language Prompt
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-gray-100 text-gray-600">auth</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-gray-100 text-gray-600">tracking</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-gray-100 text-gray-600">smoke</span>
              </div>
            </div>

            <p className="text-[13px] text-gray-700 leading-relaxed mt-3 mb-4">
              {promptText}
            </p>

            <div className="border-t border-gray-100 pt-3 flex flex-wrap items-center gap-y-2 gap-x-6 text-[12px] text-gray-500 font-mono">
              <div>
                <span>Target URL: </span>
                <span className="text-gray-900 font-semibold">/login → /tracking</span>
              </div>
              <div>
                <span>Owner: </span>
                <span className="text-gray-900 font-semibold">Riya Sharma</span>
              </div>
              <div>
                <span>Config Snapshot: </span>
                <span className="text-gray-900 font-semibold">v4</span>
              </div>
            </div>
          </div>

          {/* Card 2: Plan Versions */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-none">
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-[14px] font-semibold text-gray-900">
                Plan Versions
              </h2>
              <button
                onClick={() => setGenerateModalOpen(true)}
                className="px-2.5 py-1 text-[12px] font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                + New version
              </button>
            </div>

            <div className="space-y-3">
              {/* Version 2 (Approved/Locked) */}
              <div className="rounded-lg border border-gray-200 bg-white p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-bold text-[11px] text-gray-800 px-1.5 py-0.5 border border-gray-200 rounded bg-gray-50">
                      v2
                    </span>
                    <span className="text-[12px] font-medium text-[#16A34A] flex items-center gap-1">
                      ✓ Approved (Locked)
                    </span>
                    <span className="text-[12px] text-gray-500">
                      5 cases · 7 steps
                    </span>
                  </div>
                  <Link
                    href={`/plans/${targetPlanId}`}
                    className="inline-flex items-center gap-1 px-3 py-1 text-[12px] font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Inspect plan ↗
                  </Link>
                </div>
                <div className="text-[11px] text-gray-400 font-mono mt-1.5">
                  Author: Riya Sharma · {engineText} · 1420 tok · 18m ago
                </div>
              </div>

              {/* Version 1 (Superseded) */}
              <div className="rounded-lg border border-gray-200 bg-white p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-bold text-[11px] text-gray-800 px-1.5 py-0.5 border border-gray-200 rounded bg-gray-50">
                      v1
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-500">
                      Superseded
                    </span>
                    <span className="text-[12px] text-gray-500">
                      4 cases · 6 steps
                    </span>
                  </div>
                  <Link
                    href={`/plans/plan-1`}
                    className="inline-flex items-center gap-1 px-3 py-1 text-[12px] font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Inspect plan ↗
                  </Link>
                </div>
                <div className="text-[11px] text-gray-400 font-mono mt-1.5">
                  Author: Riya Sharma · {engineText} · 1180 tok · 2h ago
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Run History */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-none">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-semibold text-gray-900">
                Run History
              </h2>
              <span className="text-[12px] text-gray-400 font-mono">
                {runs.length} runs
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-semibold uppercase text-gray-400 tracking-wider">
                    <th className="pb-2.5 font-medium">RUN ID</th>
                    <th className="pb-2.5 font-medium">STATUS</th>
                    <th className="pb-2.5 font-medium">PLAN</th>
                    <th className="pb-2.5 font-medium">PASS RATE</th>
                    <th className="pb-2.5 font-medium">DURATION</th>
                    <th className="pb-2.5 font-medium">STARTED</th>
                    <th className="pb-2.5 font-medium text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {runs.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/50">
                      <td className="py-3 font-mono font-medium text-gray-900">
                        {r.id}
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#DCFCE7] text-[#16A34A]">
                          ✓ Passed
                        </span>
                      </td>
                      <td className="py-3 font-mono text-gray-600">
                        v{(r as any).planVersion || 2}
                      </td>
                      <td className="py-3 font-semibold text-gray-900">
                        {r.passRate || 100}% ({(r as any).passedSteps || r.passedCases || 7}/{(r as any).totalSteps || r.totalCases || 7})
                      </td>
                      <td className="py-3 font-mono text-gray-600">
                        {((r.durationMs || 1420) / 1000).toFixed(2)}s
                      </td>
                      <td className="py-3 text-gray-400">
                        14m ago
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/reports/${r.id}`}
                          className="px-2.5 py-1 text-[12px] font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1 col) */}
        <div className="lg:col-span-1 space-y-5">
          {/* Card: Activity */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-none">
            <h2 className="text-[14px] font-semibold text-gray-900 mb-4">
              Activity
            </h2>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-200">
              {/* Item 1 */}
              <div className="relative">
                <span className="absolute -left-6 top-1.5 h-2 w-2 rounded-full bg-[#7C3AED] ring-4 ring-white" />
                <p className="text-[13px] font-medium text-gray-900">
                  Run run-942 completed (7/7 passed)
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Runner Worker · 14m ago
                </p>
              </div>

              {/* Item 2 */}
              <div className="relative">
                <span className="absolute -left-6 top-1.5 h-2 w-2 rounded-full bg-gray-300 ring-4 ring-white" />
                <p className="text-[13px] font-medium text-gray-900">
                  Approved & locked Plan v2
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Aarav Mehta · 18m ago
                </p>
              </div>

              {/* Item 3 */}
              <div className="relative">
                <span className="absolute -left-6 top-1.5 h-2 w-2 rounded-full bg-gray-300 ring-4 ring-white" />
                <p className="text-[13px] font-medium text-gray-900">
                  Generated Plan v2 with feedback
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Riya Sharma · 22m ago
                </p>
              </div>

              {/* Item 4 */}
              <div className="relative">
                <span className="absolute -left-6 top-1.5 h-2 w-2 rounded-full bg-gray-300 ring-4 ring-white" />
                <p className="text-[13px] font-medium text-gray-900">
                  Created task tsk-201
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Riya Sharma · 2h ago
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Plan Modal */}
      <Dialog open={generateModalOpen} onOpenChange={setGenerateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate New Plan Version</DialogTitle>
            <DialogDescription>
              Submit feedback or instructions for the AI engine to generate an updated plan for this task.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGeneratePlan} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Refinement Feedback (Optional)
              </label>
              <textarea
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                placeholder="e.g. Ensure all error states are checked and add tracking heading assertion."
                className="w-full text-xs border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setGenerateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={generating}
                className="bg-[#4F46E5] hover:bg-[#4338CA] text-white"
              >
                {generating ? 'Generating...' : '✦ Generate Plan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
