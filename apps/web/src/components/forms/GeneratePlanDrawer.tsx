'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  X,
  Sparkles,
  Layers,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react'
import { useUIStore } from '@/stores/ui.store'
import { mockClient } from '@/mocks/mockClient'
import type { Task } from '@/mocks/data/tasks.mock'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface GeneratePlanDrawerProps {
  open?: boolean
  task?: Task | null
  onClose?: () => void
  onSuccess?: (plan: any) => void
}

type CompilationStrategy = 'comprehensive' | 'smoke' | 'regression'

export function GeneratePlanDrawer({
  open: propOpen,
  task: propTask,
  onClose: propOnClose,
  onSuccess: propOnSuccess,
}: GeneratePlanDrawerProps) {
  const router = useRouter()
  const { formDrawer, formDrawerData, closeFormDrawer } = useUIStore()

  const isOpen = propOpen !== undefined ? propOpen : formDrawer === 'generate-plan'
  const handleClose = propOnClose || closeFormDrawer

  const [activeTask, setActiveTask] = useState<Task | null>(
    (propTask !== undefined ? propTask : (formDrawerData?.task as Task | null)) || null
  )

  // Form states
  const [strategy, setStrategy] = useState<CompilationStrategy>('comprehensive')
  const [engine, setEngine] = useState<'ollama' | 'gemini' | 'hybrid'>('ollama')
  const [model, setModel] = useState('ollama/qwen2.5:14b')
  const [feedback, setFeedback] = useState('')
  const [includeVisualDifs, setIncludeVisualDiffs] = useState(true)
  const [strictHttpChecks, setStrictHttpChecks] = useState(true)
  const [isolateCookies, setIsolateCookies] = useState(true)
  const [loading, setLoading] = useState(false)

  const isRegenerate = formDrawerData?.mode === 'regenerate'
  const nextVersion = formDrawerData?.currentVersion ? formDrawerData.currentVersion + 1 : 2

  // Sync incoming task
  useEffect(() => {
    if (propTask) {
      setActiveTask(propTask)
    } else if (formDrawerData?.task) {
      setActiveTask(formDrawerData.task)
    } else if (formDrawerData?.taskId) {
      mockClient.getTaskById(formDrawerData.taskId).then((t) => {
        if (t) setActiveTask(t)
      })
    }
  }, [propTask, formDrawerData])

  // Sync initial task engine
  useEffect(() => {
    if (activeTask) {
      const taskEngine = (activeTask.providerKind || activeTask.engine || 'ollama') as 'ollama' | 'gemini' | 'hybrid'
      setEngine(taskEngine)
      setModel(activeTask.model || (taskEngine === 'gemini' ? 'gemini-2.5-pro' : 'ollama/qwen2.5:14b'))
    }
  }, [activeTask])

  // Update default model on engine switch
  function handleEngineChange(newEngine: 'ollama' | 'gemini' | 'hybrid') {
    setEngine(newEngine)
    if (newEngine === 'gemini') {
      setModel('gemini-2.5-pro')
    } else if (newEngine === 'ollama') {
      setModel('ollama/qwen2.5:14b')
    } else {
      setModel('hybrid-fast-verify')
    }
  }

  // Escape key handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) handleClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose])

  if (!isOpen || !activeTask) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!activeTask) return

    setLoading(true)
    try {
      // Build feedback directive including strategy preferences
      let fullDirective = feedback.trim()
      if (strategy === 'smoke') {
        fullDirective = `[Strategy: Smoke / Critical Path only] ${fullDirective}`
      } else if (strategy === 'regression') {
        fullDirective = `[Strategy: Deep Regression & Boundary Fuzzing] ${fullDirective}`
      }

      const newPlan = await mockClient.generatePlan(activeTask.id, fullDirective || undefined)

      toast.success(`Plan v${newPlan.version} compiled successfully!`, {
        description: `${newPlan.cases.length} test cases generated with deterministic assertions.`,
      })

      handleClose()
      if (propOnSuccess) propOnSuccess(newPlan)
      router.push(`/plans/${newPlan.id}`)
    } catch (err: any) {
      toast.error('Failed to compile test plan', {
        description: err.message || 'An unexpected error occurred.',
      })
    } finally {
      setLoading(false)
    }
  }

  const promptText = activeTask.prompt || activeTask.instruction || 'No prompt specified.'

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-[7px] transition-opacity animate-fade-in"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div
        className="relative z-10 w-full max-w-[520px] h-screen bg-white dark:bg-[#12151F] border-l border-gray-200 dark:border-neutral-800 shadow-2xl flex flex-col justify-between animate-slide-in-right select-text"
        role="dialog"
        aria-modal="true"
        aria-labelledby="generate-plan-drawer-title"
      >
        <form onSubmit={handleSubmit} className="h-full flex flex-col justify-between">
          {/* Scrollable Form Body */}
          <div className="px-8 pt-8 pb-5 space-y-6 overflow-y-auto flex-1">
            {/* Header */}
            <div className="flex items-start justify-between pb-1">
              <div>
                <h2
                  id="generate-plan-drawer-title"
                  className="text-[20px] font-bold text-gray-900 dark:text-white tracking-tight leading-snug flex items-center gap-2"
                >
                  <Sparkles className="h-5 w-5 text-[#6366F1]" />
                  {isRegenerate ? `Regenerate Test Plan (v${nextVersion})` : 'Generate Test Plan'}
                </h2>
                <p className="text-[13px] text-gray-500 dark:text-neutral-400 mt-0.5">
                  {isRegenerate
                    ? 'Refine test assertions, provide compiler feedback, and generate a new version.'
                    : 'Instruct the AI compiler to generate atomic, executable test cases.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-[6px] p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Section 1: Task Context Preview Card */}
            <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50/70 dark:bg-neutral-900/60 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-indigo-500" /> Target Goal
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300">
                  {activeTask.websiteName || 'Application'} · {activeTask.roleName || activeTask.role || 'User'}
                </span>
              </div>
              <p className="text-[13px] font-semibold text-gray-900 dark:text-white leading-snug">
                {activeTask.title}
              </p>
              <div className="bg-white dark:bg-neutral-800/80 rounded-lg p-2.5 border border-gray-200/80 dark:border-neutral-700/80 text-[12px] text-gray-600 dark:text-neutral-300 line-clamp-3 leading-relaxed">
                "{promptText}"
              </div>
            </div>

            {/* Section 2: Compilation Strategy */}
            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-indigo-500" />
                Compilation Strategy
              </label>
              <div className="grid grid-cols-1 gap-2">
                {/* Option 1: Comprehensive */}
                <div
                  onClick={() => setStrategy('comprehensive')}
                  className={cn(
                    'p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3',
                    strategy === 'comprehensive'
                      ? 'border-[#6366F1] bg-[#6366F1]/5 dark:bg-[#6366F1]/10 ring-1 ring-[#6366F1]'
                      : 'border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 hover:border-gray-300'
                  )}
                >
                  <div
                    className={cn(
                      'mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0',
                      strategy === 'comprehensive'
                        ? 'border-[#6366F1] bg-[#6366F1]'
                        : 'border-gray-300 dark:border-neutral-600'
                    )}
                  >
                    {strategy === 'comprehensive' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-gray-900 dark:text-white">
                        Comprehensive (Recommended)
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        Default
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-0.5">
                      Full end-to-end happy path, form validations, boundary checks, and route assertions.
                    </p>
                  </div>
                </div>

                {/* Option 2: Smoke */}
                <div
                  onClick={() => setStrategy('smoke')}
                  className={cn(
                    'p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3',
                    strategy === 'smoke'
                      ? 'border-[#6366F1] bg-[#6366F1]/5 dark:bg-[#6366F1]/10 ring-1 ring-[#6366F1]'
                      : 'border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 hover:border-gray-300'
                  )}
                >
                  <div
                    className={cn(
                      'mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0',
                      strategy === 'smoke'
                        ? 'border-[#6366F1] bg-[#6366F1]'
                        : 'border-gray-300 dark:border-neutral-600'
                    )}
                  >
                    {strategy === 'smoke' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className="text-[13px] font-semibold text-gray-900 dark:text-white">
                      Critical Path / Smoke
                    </span>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-0.5">
                      Fast validation focusing strictly on the critical primary user journey.
                    </p>
                  </div>
                </div>

                {/* Option 3: Regression */}
                <div
                  onClick={() => setStrategy('regression')}
                  className={cn(
                    'p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3',
                    strategy === 'regression'
                      ? 'border-[#6366F1] bg-[#6366F1]/5 dark:bg-[#6366F1]/10 ring-1 ring-[#6366F1]'
                      : 'border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 hover:border-gray-300'
                  )}
                >
                  <div
                    className={cn(
                      'mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0',
                      strategy === 'regression'
                        ? 'border-[#6366F1] bg-[#6366F1]'
                        : 'border-gray-300 dark:border-neutral-600'
                    )}
                  >
                    {strategy === 'regression' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className="text-[13px] font-semibold text-gray-900 dark:text-white">
                      Deep Regression & Edge Cases
                    </span>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-0.5">
                      Adds input fuzzing, negative assertions, session interruption, and error-state validations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: AI Engine & Model */}
            <div className="space-y-3">
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-indigo-500" />
                AI Compiler Engine
              </label>

              {/* Engine Toggle Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleEngineChange('ollama')}
                  className={cn(
                    'h-10 text-[12px] font-medium rounded-lg border transition-all flex items-center justify-center gap-1.5',
                    engine === 'ollama'
                      ? 'border-[#6366F1] bg-[#6366F1] text-white shadow-sm'
                      : 'border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                  )}
                >
                  Ollama (Local)
                </button>
                <button
                  type="button"
                  onClick={() => handleEngineChange('gemini')}
                  className={cn(
                    'h-10 text-[12px] font-medium rounded-lg border transition-all flex items-center justify-center gap-1.5',
                    engine === 'gemini'
                      ? 'border-[#6366F1] bg-[#6366F1] text-white shadow-sm'
                      : 'border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                  )}
                >
                  Gemini (Cloud)
                </button>
                <button
                  type="button"
                  onClick={() => handleEngineChange('hybrid')}
                  className={cn(
                    'h-10 text-[12px] font-medium rounded-lg border transition-all flex items-center justify-center gap-1.5',
                    engine === 'hybrid'
                      ? 'border-[#6366F1] bg-[#6366F1] text-white shadow-sm'
                      : 'border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                  )}
                >
                  Hybrid Engine
                </button>
              </div>

              {/* Model selection */}
              <div className="space-y-1">
                <span className="text-[11px] text-gray-500 dark:text-neutral-400">Target Model</span>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full h-10 px-3 text-[13px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
                >
                  {engine === 'ollama' && (
                    <>
                      <option value="ollama/qwen2.5:14b">qwen2.5:14b (Default High Precision)</option>
                      <option value="ollama/llama3.1:8b">llama3.1:8b (Fast Lightweight)</option>
                      <option value="ollama/deepseek-r1:14b">deepseek-r1:14b (Reasoning Specialist)</option>
                    </>
                  )}
                  {engine === 'gemini' && (
                    <>
                      <option value="gemini-2.5-pro">Gemini 2.5 Pro (Multimodal Complex Planning)</option>
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultra Fast Latency)</option>
                    </>
                  )}
                  {engine === 'hybrid' && (
                    <option value="hybrid-fast-verify">Hybrid: Ollama Fast Scout + Gemini Plan Synthesis</option>
                  )}
                </select>
              </div>
            </div>

            {/* Section 4: Refinement Guidance Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <SlidersHorizontal className="h-4 w-4 text-indigo-500" />
                  {isRegenerate ? 'Refinement Feedback & Directives' : 'Compiler Guidance & Refinements'}
                </label>
                <span className="text-[11px] text-gray-400 dark:text-neutral-500">
                  {isRegenerate ? 'Required for v' + nextVersion : 'Optional'}
                </span>
              </div>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required={isRegenerate}
                placeholder={
                  isRegenerate
                    ? 'e.g. Add strict assertion for ZIP MIME type application/zip and verify session token validity before download...'
                    : 'e.g. Ensure all error states are checked, assert the order token header, and verify toast notification message on submit...'
                }
                className="w-full h-24 px-3.5 py-2.5 text-[13px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all resize-none leading-relaxed"
              />
              <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                {isRegenerate
                  ? 'AI compiler will incorporate these directives into updated assertions and version diff.'
                  : 'You can specify exact DOM selectors, custom assertion strings, or mock payload values to include.'}
              </p>
            </div>

            {/* Section 5: Verification & Safety Toggles */}
            <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-neutral-800">
              <label className="block text-[12px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                Verification Safeguards
              </label>

              <div className="space-y-2.5">
                <label className="flex items-center gap-2.5 text-[13px] text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeVisualDifs}
                    onChange={(e) => setIncludeVisualDiffs(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#4F46E5] focus:ring-[#4F46E5]"
                  />
                  <span>Capture visual screenshots after each DOM state transition</span>
                </label>

                <label className="flex items-center gap-2.5 text-[13px] text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={strictHttpChecks}
                    onChange={(e) => setStrictHttpChecks(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#4F46E5] focus:ring-[#4F46E5]"
                  />
                  <span>Strict HTTP status validation (assert 200/201 on API endpoints)</span>
                </label>

                <label className="flex items-center gap-2.5 text-[13px] text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isolateCookies}
                    onChange={(e) => setIsolateCookies(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#4F46E5] focus:ring-[#4F46E5]"
                  />
                  <span>Isolate session storage and cookies between test cases</span>
                </label>
              </div>
            </div>
          </div>

          {/* Bottom Actions Bar */}
          <div className="px-8 py-5 flex items-center justify-between bg-white dark:bg-[#12151F] shrink-0 border-t border-gray-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={handleClose}
              className="h-10 px-5 rounded-lg border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-[13px] font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-10 px-6 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isRegenerate ? 'Compiling New Version...' : 'Compiling Plan...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>{isRegenerate ? `✦ Compile New Version (v${nextVersion})` : '✦ Generate Test Plan'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
