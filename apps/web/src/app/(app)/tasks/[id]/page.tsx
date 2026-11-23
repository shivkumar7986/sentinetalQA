'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Play, Sparkles, Copy, Archive, ExternalLink, Plus, AlertCircle } from 'lucide-react'
import { mockClient } from '@/mocks/mockClient'
import type { Task } from '@/mocks/data/tasks.mock'
import type { TestPlan } from '@/mocks/data/plans.mock'
import type { Run } from '@/mocks/data/runs.mock'
import { toast } from 'sonner'
import { useUIStore } from '@/stores/ui.store'
import { cn } from '@/lib/utils'

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { openFormDrawer } = useUIStore()
  const [task, setTask] = useState<Task | null>(null)
  const [plans, setPlans] = useState<TestPlan[]>([])
  const [runs, setRuns] = useState<Run[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()

    function handleUpdate() {
      loadData()
    }
    window.addEventListener('testing_agent_plans_changed', handleUpdate)
    window.addEventListener('testing_agent_tasks_changed', handleUpdate)
    return () => {
      window.removeEventListener('testing_agent_plans_changed', handleUpdate)
      window.removeEventListener('testing_agent_tasks_changed', handleUpdate)
    }
  }, [params.id])

  async function loadData() {
    setLoading(true)
    const t = await mockClient.getTaskById(params.id)
    if (t) {
      setTask(t)

      // Fetch actual plans for this task
      const allPlans = await mockClient.getPlans()
      const taskPlans = allPlans
        .filter((p) => p.taskId === params.id || (t.currentPlanId && p.id === t.currentPlanId))
        .sort((a, b) => b.version - a.version)
      setPlans(taskPlans)

      // Fetch actual runs for this task (NO dummy run injection!)
      const allRuns = await mockClient.getRuns()
      const taskRuns = allRuns.filter((r) => r.taskId === params.id || (t.lastRunId && r.id === t.lastRunId))
      setRuns(taskRuns)
    }
    setLoading(false)
  }

  async function handleTriggerRun() {
    if (plans.length === 0) {
      toast.error('No test plan found', {
        description: 'Please generate a test plan first before running.',
      })
      openFormDrawer('generate-plan', { task })
      return
    }

    const targetPlan = plans.find((p) => p.status === 'approved') || plans[0]
    try {
      const newRun = await mockClient.triggerRun(targetPlan.id)
      toast.success('Test execution initiated!')
      router.push(`/runs/${newRun.id}`)
    } catch {
      toast.error('Failed to trigger run')
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
        Task not found.{' '}
        <Link href="/tasks" className="text-indigo-600 underline ml-1">
          Return to Tasks
        </Link>
      </div>
    )
  }

  const promptText = task.prompt || task.instruction || 'No prompt instruction provided.'
  const displayId = task.displayId || task.id
  const roleName = task.roleName || task.role || 'Dispatcher'
  const engineText = task.engineDisplay || task.model || task.engine || 'ollama/qwen2.5:14b'
  const priority = task.priority ? task.priority.toUpperCase() : 'P1'

  return (
    <div className="space-y-6 animate-enter">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-[20px] font-bold text-gray-900 dark:text-white tracking-tight">
              {task.title}
            </h1>

            {/* Dynamic Status Badge */}
            {task.status === 'approved' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]">
                ✓ Approved
              </span>
            )}
            {task.status === 'in_review' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                🕒 In review
              </span>
            )}
            {task.status === 'plan_generated' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                ✦ Plan Generated
              </span>
            )}
            {task.status === 'completed' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                ✓ Completed
              </span>
            )}
            {task.status === 'running' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse">
                ● Running
              </span>
            )}
            {(task.status === 'draft' || !task.status) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                Draft
              </span>
            )}
          </div>
          <p className="text-[12px] text-gray-500 dark:text-neutral-400 font-mono mt-1">
            {displayId} · Role: {roleName} · Engine: {engineText} · Priority: {priority}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleArchiveTask}
            className="px-3.5 py-1.5 text-[13px] font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors shadow-none"
          >
            Archive
          </button>
          <button
            onClick={handleCloneTask}
            className="px-3.5 py-1.5 text-[13px] font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors shadow-none"
          >
            Clone
          </button>
          <button
            onClick={() => openFormDrawer('generate-plan', { task })}
            className="px-3.5 py-1.5 text-[13px] font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1.5 shadow-none"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> Generate plan
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
          <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#12151F] p-5 shadow-none">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-gray-900 dark:text-white">
                Natural-Language Prompt
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300">
                  {task.websiteName || 'Web App'}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300">
                  {roleName}
                </span>
              </div>
            </div>

            <p className="text-[13px] text-gray-700 dark:text-neutral-300 leading-relaxed mt-3 mb-4">
              {promptText}
            </p>

            <div className="border-t border-gray-100 dark:border-neutral-800 pt-3 flex flex-wrap items-center gap-y-2 gap-x-6 text-[12px] text-gray-500 dark:text-neutral-400 font-mono">
              <div>
                <span>Target Website: </span>
                <span className="text-gray-900 dark:text-white font-semibold">
                  {task.websiteName || 'Logistics Portal'}
                </span>
              </div>
              <div>
                <span>Role: </span>
                <span className="text-gray-900 dark:text-white font-semibold">{roleName}</span>
              </div>
              <div>
                <span>Engine: </span>
                <span className="text-gray-900 dark:text-white font-semibold">{engineText}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Plan Versions */}
          <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#12151F] p-5 shadow-none">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-semibold text-gray-900 dark:text-white">
                  Plan Versions
                </h2>
                <span className="text-[12px] text-gray-400 font-mono">({plans.length})</span>
              </div>
              <button
                onClick={() => openFormDrawer('generate-plan', { task })}
                className="px-2.5 py-1 text-[12px] font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-md hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
              >
                + New version
              </button>
            </div>

            {plans.length > 0 ? (
              <div className="space-y-3">
                {plans.map((p) => {
                  const isApproved = p.status === 'approved'
                  const totalSteps =
                    p.cases?.reduce((acc, c) => acc + (c.steps?.length || 0), 0) || 0

                  return (
                    <div
                      key={p.id}
                      className="rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#12151F] p-3.5 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono font-bold text-[11px] text-gray-800 dark:text-gray-200 px-1.5 py-0.5 border border-gray-200 dark:border-neutral-700 rounded bg-gray-50 dark:bg-neutral-800">
                            v{p.version}
                          </span>
                          <span
                            className={cn(
                              'text-[12px] font-medium flex items-center gap-1',
                              isApproved ? 'text-[#16A34A]' : 'text-amber-600'
                            )}
                          >
                            {isApproved ? '✓ Approved' : 'In review'}
                          </span>
                          <span className="text-[12px] text-gray-500 dark:text-neutral-400">
                            {p.cases?.length || 0} cases · {totalSteps} steps
                          </span>
                        </div>
                        <Link
                          href={`/plans/${p.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 text-[12px] font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-md hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                        >
                          Inspect plan ↗
                        </Link>
                      </div>
                      <div className="text-[11px] text-gray-400 dark:text-neutral-500 font-mono mt-1.5">
                        Engine: {p.engine} · {p.tokensUsed || 1250} tok
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-gray-200 dark:border-neutral-800 rounded-lg">
                <p className="text-[13px] text-gray-500 dark:text-neutral-400 font-medium">
                  No test plans generated yet for this task.
                </p>
                <p className="text-[12px] text-gray-400 dark:text-neutral-500 mt-1">
                  Click below to compile this natural-language prompt into executable test cases.
                </p>
                <button
                  onClick={() => openFormDrawer('generate-plan', { task })}
                  className="mt-3.5 px-3.5 py-1.5 text-[12px] font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Generate First Plan Version
                </button>
              </div>
            )}
          </div>

          {/* Card 3: Run History */}
          <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#12151F] p-5 shadow-none">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-semibold text-gray-900 dark:text-white">
                Run History
              </h2>
              <span className="text-[12px] text-gray-400 font-mono">{runs.length} runs</span>
            </div>

            {runs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-neutral-800 text-[11px] font-semibold uppercase text-gray-400 tracking-wider">
                      <th className="pb-2.5 font-medium">RUN ID</th>
                      <th className="pb-2.5 font-medium">STATUS</th>
                      <th className="pb-2.5 font-medium">PASS RATE</th>
                      <th className="pb-2.5 font-medium">DURATION</th>
                      <th className="pb-2.5 font-medium text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-neutral-800/60">
                    {runs.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/40">
                        <td className="py-3 font-mono font-medium text-gray-900 dark:text-white">
                          {r.id}
                        </td>
                        <td className="py-3">
                          <span
                            className={cn(
                              'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium',
                              r.status === 'passed'
                                ? 'bg-[#DCFCE7] text-[#16A34A]'
                                : 'bg-rose-100 text-rose-700'
                            )}
                          >
                            {r.status === 'passed' ? '✓ Passed' : 'Failed'}
                          </span>
                        </td>
                        <td className="py-3 font-semibold text-gray-900 dark:text-white">
                          {r.passRate || 100}%
                        </td>
                        <td className="py-3 font-mono text-gray-600 dark:text-neutral-400">
                          {((r.durationMs || 1420) / 1000).toFixed(2)}s
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            href={`/reports/${r.id}`}
                            className="px-2.5 py-1 text-[12px] font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                          >
                            Open
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-gray-200 dark:border-neutral-800 rounded-lg">
                <p className="text-[13px] text-gray-500 dark:text-neutral-400 font-medium">
                  No test runs executed yet.
                </p>
                <p className="text-[12px] text-gray-400 dark:text-neutral-500 mt-1">
                  Once a plan is generated and run, execution metrics and step logs will appear
                  here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Dynamic Activity */}
        <div className="lg:col-span-1 space-y-5">
          <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#12151F] p-5 shadow-none">
            <h2 className="text-[14px] font-semibold text-gray-900 dark:text-white mb-4">
              Activity
            </h2>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-200 dark:before:bg-neutral-800">
              {runs.map((r) => (
                <div key={r.id} className="relative">
                  <span className="absolute -left-6 top-1.5 h-2 w-2 rounded-full bg-[#7C3AED] ring-4 ring-white dark:ring-[#12151F]" />
                  <p className="text-[13px] font-medium text-gray-900 dark:text-white">
                    Run {r.id} {r.status} ({r.passRate || 100}% passed)
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-0.5">
                    Runner Worker
                  </p>
                </div>
              ))}

              {plans.map((p) => (
                <div key={p.id} className="relative">
                  <span className="absolute -left-6 top-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-[#12151F]" />
                  <p className="text-[13px] font-medium text-gray-900 dark:text-white">
                    {p.status === 'approved'
                      ? `Approved Plan v${p.version}`
                      : `Generated Plan v${p.version}`}
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-0.5">
                    AI Compiler
                  </p>
                </div>
              ))}

              <div className="relative">
                <span className="absolute -left-6 top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-[#12151F]" />
                <p className="text-[13px] font-medium text-gray-900 dark:text-white">
                  Created task {displayId}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-0.5">
                  Task Creator · {task.updatedAtLabel || 'Recently'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
