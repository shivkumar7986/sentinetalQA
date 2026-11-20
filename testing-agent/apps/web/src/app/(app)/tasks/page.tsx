'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Plus,
  Search,
  Check,
  Clock,
  FileEdit,
  ChevronDown,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StateView } from '@/components/data/StateView'
import { mockClient } from '@/mocks/mockClient'
import type { Task } from '@/mocks/data/tasks.mock'
import { useUIStore } from '@/stores/ui.store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function TasksPage() {
  const searchParams = useSearchParams()
  const { formDrawer, openFormDrawer } = useUIStore()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedWebsite, setSelectedWebsite] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    loadTasks()
    if (searchParams.get('new') === 'true') {
      openFormDrawer('create-task')
    }
  }, [searchParams, formDrawer])

  async function loadTasks() {
    setLoading(true)
    const data = await mockClient.getTasks()
    setTasks(data)
    setLoading(false)
  }

  function handleCloneTask(task: Task) {
    mockClient
      .createTask({
        websiteId: task.websiteId,
        websiteName: task.websiteName,
        title: `${task.title} (Clone)`,
        instruction: task.prompt || 'Cloned task invariant suite',
        role: task.roleName || 'Dispatcher',
        engine: task.providerKind === 'gemini' ? 'gemini' : 'ollama',
        status: 'draft',
      })
      .then((created) => {
        toast.success(`Cloned as ${created.title}`)
        loadTasks()
      })
  }

  // Unique websites list for the dropdown filter
  const websiteOptions = Array.from(new Set(tasks.map((t) => t.websiteName)))

  const filtered = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.displayId || t.id).toLowerCase().includes(search.toLowerCase())
    const matchesWebsite =
      selectedWebsite === 'all' || t.websiteName === selectedWebsite
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'approved' && t.status === 'approved') ||
      (selectedStatus === 'completed' && t.status === 'completed') ||
      (selectedStatus === 'in_review' && (t.status === 'in_review' || t.status === 'plan_generated')) ||
      (selectedStatus === 'draft' && t.status === 'draft')

    return matchesSearch && matchesWebsite && matchesStatus
  })

  return (
    <div className="space-y-5 animate-enter">
      {/* Header Row matching reference image */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900 dark:text-white tracking-tight">
            Tasks
          </h1>
          <p className="text-[13px] text-gray-500 dark:text-neutral-400 mt-0.5">
            Natural-language testing goals compiled into versioned, human-approved test plans.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          type="button"
          onClick={() => openFormDrawer('create-task')}
          className="gap-1.5 font-medium shrink-0 self-start sm:self-auto bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-[8px] px-4 py-2 text-[13px] shadow-none"
        >
          <Plus className="h-4 w-4" /> Create task
        </Button>
      </div>

      {/* Control / Filter Bar: [ Search input ] [ All websites ▾ ] [ All statuses ▾ ] */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search testing goals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full px-3.5 text-[13px] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-[8px] text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#4F46E5] transition-colors"
          />
        </div>

        {/* All websites dropdown */}
        <div className="relative">
          <select
            value={selectedWebsite}
            onChange={(e) => setSelectedWebsite(e.target.value)}
            className="h-10 px-3.5 pr-8 text-[13px] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-[8px] text-gray-800 dark:text-neutral-200 focus:outline-none focus:border-[#4F46E5] appearance-none cursor-pointer transition-colors"
          >
            <option value="all">All websites</option>
            {websiteOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        </div>

        {/* All statuses dropdown */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 px-3.5 pr-8 text-[13px] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-[8px] text-gray-800 dark:text-neutral-200 focus:outline-none focus:border-[#4F46E5] appearance-none cursor-pointer transition-colors"
          >
            <option value="all">All statuses</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="in_review">In review</option>
            <option value="draft">Draft</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Main Table Card */}
      <StateView
        isLoading={loading}
        isEmpty={filtered.length === 0}
        emptyMessage="No testing tasks match your filters."
        emptyAction={
          <Button variant="primary" size="sm" onClick={() => openFormDrawer('create-task')}>
            Create a task
          </Button>
        }
      >
        <div className="rounded-[8px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-neutral-800 text-[11px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                  <th className="text-left py-3.5 px-6 font-semibold">TASK GOAL</th>
                  <th className="text-left py-3.5 px-4 font-semibold">WEBSITE & ROLE</th>
                  <th className="text-left py-3.5 px-4 font-semibold">STATUS</th>
                  <th className="text-left py-3.5 px-4 font-semibold">AI ENGINE</th>
                  <th className="text-left py-3.5 px-4 font-semibold">LAST RUN</th>
                  <th className="text-left py-3.5 px-4 font-semibold">UPDATED</th>
                  <th className="text-right py-3.5 px-6 font-semibold">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/80">
                {filtered.map((task) => {
                  const displayId = task.displayId || task.id
                  const isInReview = task.status === 'in_review' || task.status === 'plan_generated'

                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-gray-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      {/* Column 1: TASK GOAL */}
                      <td className="py-3.5 px-6">
                        <Link
                          href={`/tasks/${task.id}`}
                          className="font-semibold text-[13px] text-gray-900 dark:text-white hover:text-[var(--primary)] transition-colors block leading-snug"
                        >
                          {task.title}
                        </Link>
                        <span className="mono-data text-[12px] text-gray-400 block mt-0.5">
                          {displayId}
                        </span>
                      </td>

                      {/* Column 2: WEBSITE & ROLE */}
                      <td className="py-3.5 px-4">
                        <span className="text-[13px] font-medium text-gray-900 dark:text-white block leading-snug">
                          {task.websiteName}
                        </span>
                        <span className="text-[12px] text-gray-500 dark:text-neutral-400 block mt-0.5">
                          Role: {task.roleName || 'Dispatcher'}
                        </span>
                      </td>

                      {/* Column 3: STATUS */}
                      <td className="py-3.5 px-4">
                        {task.status === 'approved' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#DCFCE7] text-[#16A34A] dark:bg-emerald-950/40 dark:text-emerald-400">
                            <Check className="h-3 w-3 stroke-[2.5]" /> Approved
                          </span>
                        )}
                        {task.status === 'completed' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#DCFCE7] text-[#16A34A] dark:bg-emerald-950/40 dark:text-emerald-400">
                            <Check className="h-3 w-3 stroke-[2.5]" /> Completed
                          </span>
                        )}
                        {isInReview && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#FEF3C7] text-[#D97706] dark:bg-amber-950/40 dark:text-amber-400">
                            <Clock className="h-3 w-3" /> In review
                          </span>
                        )}
                        {task.status === 'draft' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400">
                            <FileEdit className="h-3 w-3" /> Draft
                          </span>
                        )}
                        {task.status === 'running' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#E0F2FE] text-[#0284C7] dark:bg-sky-950/40 dark:text-sky-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#0284C7] animate-pulse" /> Running
                          </span>
                        )}
                        {task.status === 'failed' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#FEE2E2] text-[#DC2626] dark:bg-rose-950/40 dark:text-rose-400">
                            Failed
                          </span>
                        )}
                      </td>

                      {/* Column 4: AI ENGINE */}
                      <td className="py-3.5 px-4 mono-data text-[13px] text-gray-600 dark:text-gray-300">
                        {task.engineDisplay || task.model || 'ollama/qwen2.5:14b'}
                      </td>

                      {/* Column 5: LAST RUN */}
                      <td className="py-3.5 px-4 mono-data text-[13px] font-medium text-gray-900 dark:text-white">
                        {task.lastRunId ? (
                          <Link
                            href={`/runs/${task.lastRunId}`}
                            className="hover:text-[var(--primary)] transition-colors"
                          >
                            {task.lastRunId}
                          </Link>
                        ) : (
                          <span className="text-gray-400 font-mono">—</span>
                        )}
                      </td>

                      {/* Column 6: UPDATED */}
                      <td className="py-3.5 px-4 text-[13px] text-gray-500 dark:text-neutral-400">
                        {task.updatedAtLabel || 'Recently'}
                      </td>

                      {/* Column 7: ACTIONS */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isInReview ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              asChild
                              className="h-8 px-3.5 text-[12px] font-medium border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 rounded-[6px]"
                            >
                              <Link href={`/plans/${task.currentPlanId || 'plan-3'}`}>
                                Review plan
                              </Link>
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              asChild
                              className="h-8 px-3.5 text-[12px] font-medium border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 rounded-[6px]"
                            >
                              <Link href={`/tasks/${task.id}`}>
                                Open
                              </Link>
                            </Button>
                          )}

                          <Button
                            variant="secondary"
                            size="sm"
                            type="button"
                            onClick={() => handleCloneTask(task)}
                            className="h-8 px-3.5 text-[12px] font-medium border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 rounded-[6px]"
                          >
                            Clone
                          </Button>
                        </div>
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
