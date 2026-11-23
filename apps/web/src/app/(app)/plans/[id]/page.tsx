'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronDown,
  ChevronRight,
  Plus,
  ArrowUp,
  ArrowDown,
  X,
  Sparkles,
  Check,
} from 'lucide-react'
import { mockClient } from '@/mocks/mockClient'
import type { TestPlan, TestCase, TestStep, ValidationType } from '@/mocks/data/plans.mock'
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
import { usePermissions } from '@/lib/permissions'
import { useUIStore } from '@/stores/ui.store'

const DEFAULT_CASES: TestCase[] = [
  {
    id: 'case-1',
    position: 1,
    title: 'Login route and form accessible',
    objective: 'Confirm /login loads 200 and exposes email/password inputs',
    expectedOutcome: 'Login form rendered without redirect loop',
    isOptional: false,
    steps: [
      {
        id: 'step-1-1',
        position: 1,
        action: 'Open login page',
        validationType: 'route_check',
        target: { url: '/login' },
        expected: { status: 200 },
      },
      {
        id: 'step-1-2',
        position: 2,
        action: 'Verify form fields',
        validationType: 'form_structure',
        target: { selector: 'form#login' },
        expected: { fields: 'email, password, submit' },
      },
    ],
  },
  {
    id: 'case-2',
    position: 2,
    title: 'Credentials validated and session issued',
    objective: 'Submit Dispatcher credentials via auth endpoint',
    expectedOutcome: 'Session cookie sid issued',
    isOptional: false,
    steps: [
      {
        id: 'step-2-1',
        position: 1,
        action: 'Submit credentials payload',
        validationType: 'auth_response',
        target: { url: '/api/auth/login' },
        expected: { status: 200 },
      },
      {
        id: 'step-2-2',
        position: 2,
        action: 'Validate session cookie sid presence',
        validationType: 'auth_response',
        target: { selector: 'cookie.sid' },
        expected: { cookiePresent: true },
      },
    ],
  },
  {
    id: 'case-3',
    position: 3,
    title: 'Dispatcher role redirected to Dashboard',
    objective: 'Verify post-login role landing path',
    expectedOutcome: 'URL resolves to /dashboard',
    isOptional: false,
    steps: [
      {
        id: 'step-3-1',
        position: 1,
        action: 'Observe role redirect',
        validationType: 'redirect',
        target: { url: '/dashboard' },
        expected: { path: '/dashboard' },
      },
    ],
  },
  {
    id: 'case-4',
    position: 4,
    title: 'Dashboard to Tracking navigation works',
    objective: 'Navigate via sidebar link to /tracking',
    expectedOutcome: 'Tracking page loads cleanly',
    isOptional: false,
    steps: [
      {
        id: 'step-4-1',
        position: 1,
        action: 'Click sidebar link to /tracking',
        validationType: 'navigation',
        target: { url: '/tracking' },
        expected: { path: '/tracking' },
      },
    ],
  },
  {
    id: 'case-5',
    position: 5,
    title: 'Tracking heading & business rule met',
    objective: 'Assert heading text and unauthenticated protection rule',
    expectedOutcome: "Heading matches 'Live Shipment Tracking'",
    isOptional: true,
    steps: [
      {
        id: 'step-5-1',
        position: 1,
        action: 'Assert heading element text',
        validationType: 'heading',
        target: { selector: 'h1' },
        expected: { text: 'Live Shipment Tracking' },
      },
    ],
  },
]

export default function PlanReviewPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { openFormDrawer } = useUIStore()
  const { can, meta } = usePermissions()
  const canApprove = can('plan.approve')
  const [plan, setPlan] = useState<TestPlan | null>(null)
  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [cases, setCases] = useState<TestCase[]>(DEFAULT_CASES)
  const [expandedCases, setExpandedCases] = useState<Record<string, boolean>>({
    'case-1': true,
  })

  // Reviewer notes state
  const [notes, setNotes] = useState<Array<{ author: string; time: string; text: string }>>([])
  const [newNote, setNewNote] = useState('')

  // Regenerate dialog
  const [regenOpen, setRegenOpen] = useState(false)
  const [regenFeedback, setRegenFeedback] = useState('')
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    loadPlan()
  }, [params.id])

  async function loadPlan() {
    setLoading(true)
    const p = await mockClient.getPlanById(params.id)
    if (p) {
      setPlan(p)
      if (p.cases && p.cases.length > 0) {
        setCases(p.cases)
      }
      if (p.taskId) {
        const t = await mockClient.getTaskById(p.taskId)
        if (t) setTask(t)
      }
      if (params.id === 'plan-1') {
        setNotes([
          {
            author: 'Riya Sharma',
            time: '20m ago',
            text: 'Added optional flag on case 05 pending staging data seed.',
          },
        ])
      }
    } else {
      // Look up associated task if params.id corresponds to a task
      const possibleTaskId = params.id.startsWith('p-') ? params.id.replace('p-', '') : params.id
      const associatedTask = await mockClient.getTaskById(possibleTaskId)

      if (associatedTask) {
        setTask(associatedTask)
        const dynamicCases: TestCase[] = [
          {
            id: `case-${Date.now()}-1`,
            position: 1,
            title: `Verify ${associatedTask.websiteName || 'Application'} Entry Point`,
            objective: `Ensure target route is accessible and loads HTTP 200`,
            expectedOutcome: `Page renders without errors or redirect loop`,
            isOptional: false,
            steps: [
              {
                id: `step-${Date.now()}-1`,
                position: 1,
                action: 'Open application endpoint',
                validationType: 'route_check',
                target: { url: '/' },
                expected: { status: 200 },
              },
            ],
          },
          {
            id: `case-${Date.now()}-2`,
            position: 2,
            title: `Execute Goal: ${associatedTask.title}`,
            objective: associatedTask.prompt || associatedTask.instruction || 'Execute workflow steps',
            expectedOutcome: `Goal interactions execute cleanly and pass assertion checks`,
            isOptional: false,
            steps: [
              {
                id: `step-${Date.now()}-2`,
                position: 1,
                action: 'Perform form inputs and interaction sequence',
                validationType: 'form_structure',
                target: { selector: 'body' },
                expected: { success: true },
              },
            ],
          },
        ]
        setCases(dynamicCases)
        setPlan({
          id: params.id,
          taskId: associatedTask.id,
          version: 1,
          status: 'in_review',
          generatedBy: 'ai',
          summary: `AI generated test plan for goal: "${associatedTask.title}"`,
          createdAt: associatedTask.createdAt || new Date().toISOString(),
          engine: (associatedTask.providerKind === 'gemini' ? 'gemini' : 'ollama') as 'gemini' | 'ollama',
          model: associatedTask.model || associatedTask.engineDisplay || 'ollama/qwen2.5:14b',
          tokensUsed: 1250,
          cases: dynamicCases,
        })
      } else {
        // Fallback demo plan
        setPlan({
          id: params.id,
          taskId: 'tsk-201',
          version: 2,
          status: 'in_review',
          generatedBy: 'ai',
          summary: 'Verify login and open Tracking',
          createdAt: new Date().toISOString(),
          engine: 'ollama',
          model: 'ollama/qwen2.5:14b',
          tokensUsed: 1420,
          cases: DEFAULT_CASES,
        })
      }
    }
    setLoading(false)
  }

  function toggleExpand(caseId: string) {
    setExpandedCases((prev) => ({
      ...prev,
      [caseId]: !prev[caseId],
    }))
  }

  function toggleOptional(caseId: string) {
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, isOptional: !c.isOptional } : c))
    )
  }

  function handleAddStep(caseId: string) {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const nextStep: TestStep = {
            id: `step-${Date.now()}`,
            position: c.steps.length + 1,
            action: 'New validation step',
            validationType: 'route_check',
            target: { url: '/path' },
            expected: { status: 200 },
          }
          return { ...c, steps: [...c.steps, nextStep] }
        }
        return c
      })
    )
    toast.success('Step added')
  }

  function handleDeleteStep(caseId: string, stepId: string) {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return { ...c, steps: c.steps.filter((s) => s.id !== stepId) }
        }
        return c
      })
    )
    toast.success('Step removed')
  }

  function handleMoveStep(caseId: string, stepIndex: number, direction: 'up' | 'down') {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const newSteps = [...c.steps]
          const targetIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1
          if (targetIndex < 0 || targetIndex >= newSteps.length) return c
          const temp = newSteps[stepIndex]
          newSteps[stepIndex] = newSteps[targetIndex]
          newSteps[targetIndex] = temp
          return { ...c, steps: newSteps }
        }
        return c
      })
    )
  }

  function handleAddCase() {
    const newCaseNum = cases.length + 1
    const newCase: TestCase = {
      id: `case-${Date.now()}`,
      position: newCaseNum,
      title: `Verification objective ${newCaseNum}`,
      objective: 'Assert specific scenario requirement',
      expectedOutcome: 'Requirement is validated successfully',
      isOptional: false,
      steps: [
        {
          id: `step-${Date.now()}-1`,
          position: 1,
          action: 'Perform scenario action',
          validationType: 'route_check',
          target: { url: '/target' },
          expected: { status: 200 },
        },
      ],
    }
    setCases((prev) => [...prev, newCase])
    setExpandedCases((prev) => ({ ...prev, [newCase.id]: true }))
    toast.success('Test case added')
  }

  async function handleApprove() {
    if (!plan) return
    if (isApproved) {
      toast.info('This plan is already approved and locked.')
      return
    }
    if (!canApprove) {
      toast.error('Permission Denied', {
        description: `Your active role (${meta.label}) cannot approve plans. Switch to QA Lead or Admin in the topbar.`,
      })
      return
    }
    try {
      await mockClient.approvePlan(plan.id)
      setPlan((prev) => (prev ? { ...prev, status: 'approved' } : null))
      toast.success(`Plan v${plan.version || 2} approved and locked!`)
      const destTaskId = plan.taskId || task?.id
      if (destTaskId) {
        router.push(`/tasks/${destTaskId}`)
      } else {
        router.push('/tasks')
      }
    } catch {
      toast.error('Failed to approve plan')
    }
  }

  async function handleReject() {
    if (!plan) return
    if (isApproved) {
      toast.info('This plan is already approved and locked.')
      return
    }
    if (isRejected) {
      toast.info('This plan is already rejected.')
      return
    }
    if (!canApprove) {
      toast.error('Permission Denied', {
        description: `Your active role (${meta.label}) cannot reject plans. Switch to QA Lead or Admin in the topbar.`,
      })
      return
    }
    try {
      await mockClient.rejectPlan(plan.id)
      setPlan((prev) => (prev ? { ...prev, status: 'rejected' } : null))
      toast.success(`Plan v${plan.version || 1} has been rejected.`)
    } catch {
      toast.error('Failed to reject plan')
    }
  }

  async function handleRegenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!plan) return
    setRegenerating(true)
    try {
      const destTaskId = plan.taskId || task?.id || params.id.replace('p-', '')
      const newPlan = await mockClient.generatePlan(destTaskId, regenFeedback)
      setRegenOpen(false)
      toast.success(`Plan regenerated as v${newPlan.version}`)
      router.push(`/plans/${newPlan.id}`)
    } catch {
      toast.error('Failed to regenerate plan')
    } finally {
      setRegenerating(false)
    }
  }

  function handleAddNote(e: React.FormEvent) {
    e.preventDefault()
    if (!newNote.trim()) return
    setNotes((prev) => [
      ...prev,
      {
        author: 'Aarav Mehta',
        time: 'Just now',
        text: newNote.trim(),
      },
    ])
    setNewNote('')
    toast.success('Reviewer note posted')
  }

  const totalSteps = cases.reduce((acc, c) => acc + c.steps.length, 0)

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-10 bg-gray-100 rounded-lg w-1/3"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-44 bg-gray-100 rounded-xl"></div>
            <div className="h-20 bg-gray-100 rounded-xl"></div>
            <div className="h-20 bg-gray-100 rounded-xl"></div>
          </div>
          <div className="lg:col-span-1 space-y-4">
            <div className="h-44 bg-gray-100 rounded-xl"></div>
            <div className="h-32 bg-gray-100 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  const isApproved = plan?.status === 'approved'
  const isRejected = plan?.status === 'rejected'

  const validationTypeCounts = cases.reduce((acc, c) => {
    c.steps?.forEach((s) => {
      acc[s.validationType] = (acc[s.validationType] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-[20px] font-bold text-[var(--text)] tracking-tight">
              Plan Review · {task?.title || plan?.summary || 'Test Plan'}
            </h1>
            <span className="font-mono text-[11px] font-semibold text-[var(--text-muted)] px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--surface-elevated)]">
              v{plan?.version || 1}
            </span>
            {isApproved ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ✓ Approved
              </span>
            ) : isRejected ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                ✕ Rejected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                ⏱ In review
              </span>
            )}
          </div>
          <p className="text-[12px] text-[var(--text-muted)] font-mono mt-1">
            {plan?.model || 'ollama/qwen2.5:14b'} · {plan?.tokensUsed || 1250} tokens · {plan?.engine || 'ai'} compiler
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              openFormDrawer('generate-plan', {
                taskId: plan?.taskId || task?.id,
                mode: 'regenerate',
                currentVersion: plan?.version || 1,
              })
            }
          >
            ✦ Regenerate with feedback
          </Button>

          {isApproved ? (
            <span className="px-4 py-1.5 text-[13px] font-medium rounded-lg flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 select-none shadow-xs">
              ✓ Plan Approved & Locked
            </span>
          ) : isRejected ? (
            <span className="px-4 py-1.5 text-[13px] font-medium rounded-lg flex items-center gap-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 select-none shadow-xs">
              ✕ Plan Rejected
            </span>
          ) : (
            <>
              <Button
                variant="danger"
                size="sm"
                disabled={!canApprove}
                onClick={handleReject}
                title={!canApprove ? 'Plan rejection requires QA Lead or Admin role' : undefined}
              >
                ✕ Reject {!canApprove && '(Lead/Admin only)'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!canApprove}
                onClick={handleApprove}
                title={!canApprove ? 'Plan approval requires QA Lead or Admin role' : undefined}
              >
                ✓ Approve & Finalize {!canApprove && '(Lead/Admin only)'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-[var(--text)]">
              Test Cases ({cases.length})
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAddCase}
              className="h-8 text-[12px]"
            >
              + Add test case
            </Button>
          </div>

          {/* List of Test Cases */}
          <div className="space-y-3">
            {cases.map((c, idx) => {
              const isExpanded = expandedCases[c.id]
              const formattedIdx = String(idx + 1).padStart(2, '0')

              return (
                <div
                  key={c.id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-none transition-all"
                >
                  {/* Case Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="flex items-start gap-2.5 cursor-pointer flex-1"
                      onClick={() => toggleExpand(c.id)}
                    >
                      <button
                        type="button"
                        className="text-[var(--text-muted)] hover:text-[var(--text)] mt-0.5 focus:outline-none"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-[var(--text)]" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
                        )}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[12px] font-semibold text-[var(--text-muted)]">
                            {formattedIdx}
                          </span>
                          <span className="text-[14px] font-semibold text-[var(--text)]">
                            {c.title}
                          </span>
                        </div>
                        <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
                          {c.objective || 'Confirm endpoint behavior'} · Expected: {c.expectedOutcome}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] text-[var(--text-muted)]">Optional</span>
                        <button
                          type="button"
                          onClick={() => toggleOptional(c.id)}
                          className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                            c.isOptional ? 'bg-[#4F46E5]' : 'bg-[var(--border)]'
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                              c.isOptional ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium text-[var(--text-muted)] border border-[var(--border)]">
                        {c.steps.length} steps
                      </span>
                    </div>
                  </div>

                  {/* Expanded Step Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-[var(--border)]">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[12px]">
                          <thead>
                            <tr className="border-b border-[var(--border)] text-[11px] font-semibold uppercase text-[var(--text-muted)] tracking-wider">
                              <th className="pb-2 font-medium">ACTION</th>
                              <th className="pb-2 font-medium">VALIDATION TYPE</th>
                              <th className="pb-2 font-medium">TARGET</th>
                              <th className="pb-2 font-medium">EXPECTED</th>
                              <th className="pb-2 font-medium text-right">ORDER / DEL</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--border)]">
                            {c.steps.map((step, sIdx) => {
                              const targetVal =
                                step.target?.url || step.target?.selector || (sIdx === 0 ? '/login' : 'form#login')
                              const expectedVal =
                                typeof step.expected === 'string'
                                   ? step.expected
                                   : step.expected?.text ||
                                     (sIdx === 0 ? 'HTTP 200' : 'email, password, submit')

                              return (
                                <tr key={step.id} className="hover:bg-[var(--hover-row)]">
                                  <td className="py-2.5 font-medium text-[var(--text)]">
                                    {step.action}
                                  </td>
                                  <td className="py-2.5">
                                    <select
                                      value={step.validationType}
                                      onChange={(e) => {
                                        const nextType = e.target.value as ValidationType
                                        setCases((prev) =>
                                          prev.map((item) => {
                                            if (item.id === c.id) {
                                              const updated = item.steps.map((st) =>
                                                st.id === step.id ? { ...st, validationType: nextType } : st
                                              )
                                              return { ...item, steps: updated }
                                            }
                                            return item
                                          })
                                        )
                                      }}
                                      className="border border-[var(--border)] rounded px-2 py-1 text-[11px] font-mono text-[var(--text)] bg-[var(--surface-elevated)] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    >
                                      <option value="route_check">route_check</option>
                                      <option value="form_structure">form_structure</option>
                                      <option value="auth_response">auth_response</option>
                                      <option value="redirect">redirect</option>
                                      <option value="navigation">navigation</option>
                                      <option value="heading">heading</option>
                                      <option value="custom">custom</option>
                                    </select>
                                  </td>
                                  <td className="py-2.5 font-mono text-[var(--text-muted)]">
                                    {targetVal}
                                  </td>
                                  <td className="py-2.5 font-mono text-[var(--text-muted)]">
                                    {expectedVal}
                                  </td>
                                  <td className="py-2.5 text-right">
                                    <div className="inline-flex items-center gap-1.5 text-[var(--text-muted)]">
                                      <button
                                        type="button"
                                        disabled={sIdx === 0}
                                        onClick={() => handleMoveStep(c.id, sIdx, 'up')}
                                        className="hover:text-[var(--text)] disabled:opacity-30 p-0.5"
                                        title="Move up"
                                      >
                                        <ArrowUp className="h-3 w-3" />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={sIdx === c.steps.length - 1}
                                        onClick={() => handleMoveStep(c.id, sIdx, 'down')}
                                        className="hover:text-[var(--text)] disabled:opacity-30 p-0.5"
                                        title="Move down"
                                      >
                                        <ArrowDown className="h-3 w-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteStep(c.id, step.id)}
                                        className="hover:text-red-400 p-0.5 ml-1"
                                        title="Delete step"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddStep(c.id)}
                        className="mt-3 text-[12px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                      >
                        + Add step
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column (1 col) */}
        <div className="lg:col-span-1 space-y-4">
          {/* Card 1: Plan Summary */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-none">
            <h2 className="text-[14px] font-semibold text-[var(--text)] mb-3.5">
              Plan Summary
            </h2>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] p-3">
                <div className="text-[11px] text-[var(--text-muted)] mb-1">Test cases</div>
                <div className="text-[20px] font-bold text-[var(--text)]">{cases.length}</div>
              </div>
              <div className="rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] p-3">
                <div className="text-[11px] text-[var(--text-muted)] mb-1">Total steps</div>
                <div className="text-[20px] font-bold text-[var(--text)]">{totalSteps}</div>
              </div>
            </div>

            <div className="text-[12px] font-semibold text-[var(--text)] mb-2">
              Validation types
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(validationTypeCounts).map(([type, count]) => (
                <span
                  key={type}
                  className="px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-muted)] text-[11px] font-mono"
                >
                  {type}: {count}
                </span>
              ))}
              {Object.keys(validationTypeCounts).length === 0 && (
                <span className="text-[11px] text-[var(--text-muted)] font-mono">None specified</span>
              )}
            </div>
          </div>

          {/* Card 2: Version Diff */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-none">
            <h2 className="text-[14px] font-semibold text-[var(--text)] mb-3">
              {plan?.version && plan.version > 1
                ? `Version Diff (v${plan.version - 1} → v${plan.version})`
                : 'Version Details (v1)'}
            </h2>

            {plan?.version && plan.version > 1 ? (
              <div className="space-y-2 text-[12px] font-mono">
                <p className="text-emerald-400">
                  + Incremented to Plan v{plan.version}
                </p>
                <p className="text-[var(--text-muted)] leading-relaxed font-sans text-[11px]">
                  ~ {plan.summary || 'Compiled with updated directives'}
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 text-[12px]">
                <p className="font-medium text-emerald-400 font-mono">
                  Initial Plan Compilation (v1)
                </p>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Compiled {cases.length} test cases and {totalSteps} validation steps from task prompt.
                </p>
              </div>
            )}
          </div>

          {/* Card 3: Reviewer Notes */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-none">
            <h2 className="text-[14px] font-semibold text-[var(--text)] mb-3">
              Reviewer Notes
            </h2>

            <div className="space-y-2.5 mb-3.5">
              {notes.map((note, nIdx) => (
                <div key={nIdx} className="rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] p-2.5">
                  <div className="text-[11px] font-medium text-[var(--text)]">
                    {note.author} · {note.time}
                  </div>
                  <p className="text-[12px] text-[var(--text-muted)] mt-1">
                    {note.text}
                  </p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add reviewer note..."
                className="flex-1 px-3 py-1.5 text-[12px] border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                className="h-8 text-[12px]"
              >
                Post
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Regenerate Modal */}
      <Dialog open={regenOpen} onOpenChange={setRegenOpen}>
        <DialogContent className="max-w-md bg-[var(--surface)] border-[var(--border)] text-[var(--text)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--text)]">Regenerate with Feedback</DialogTitle>
            <DialogDescription className="text-[var(--text-muted)]">
              Provide additional test guidance or prompt corrections for the AI engine to generate version 3.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegenerate} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-[var(--text)] block mb-1">
                Refinement Feedback
              </label>
              <textarea
                value={regenFeedback}
                onChange={(e) => setRegenFeedback(e.target.value)}
                placeholder="e.g. Ensure we check the error boundary when token expires..."
                className="w-full text-xs border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text)] rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                rows={3}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setRegenOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={regenerating}
              >
                {regenerating ? 'Regenerating...' : 'Regenerate Plan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
