'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, RefreshCw, XCircle, Terminal, Radio } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatusBadge, type StatusValue } from '@/components/domain/StatusBadge'
import { Timeline } from '@/components/domain/Timeline'
import { StepLogDrawer } from '@/components/domain/StepLogDrawer'
import { useRunSocket } from '@/lib/socket'
import { mockClient } from '@/mocks/mockClient'
import { mockSocket } from '@/mocks/mockSocket'
import type { StepLog } from '@/mocks/data/runs.mock'
import { formatDuration } from '@/lib/format'
import { toast } from 'sonner'

export default function RunPage({ params }: { params: { id: string } }) {
  const { run, isLive, setRun } = useRunSocket(params.id)
  const [selectedLog, setSelectedLog] = useState<StepLog | null>(null)

  // Start simulation if running and has empty steps
  useEffect(() => {
    if (run && run.status === 'running' && run.stepLogs.length === 0) {
      mockClient.getPlanById(run.planId).then((plan) => {
        if (plan) {
          mockSocket.startLiveRunSimulation(run.id, plan)
        }
      })
    }
  }, [run])

  if (!run) {
    return <div className="py-12 text-center text-[var(--text-muted)]">Loading execution run...</div>
  }

  const passedSteps = run.stepLogs.filter((s) => s.status === 'passed').length
  const failedSteps = run.stepLogs.filter((s) => s.status === 'failed').length
  const totalSteps = run.stepLogs.length || 1
  const progressPercent = Math.min(100, Math.round((passedSteps / totalSteps) * 100))

  async function handleRerun() {
    try {
      const newRun = await mockClient.triggerRun(run!.planId)
      toast.success('New run started!')
      window.location.href = `/runs/${newRun.id}`
    } catch {
      toast.error('Failed to trigger re-run')
    }
  }

  function handleCancel() {
    mockSocket.stopRunSimulation(run!.id)
    toast.info('Run execution stopped')
  }

  function handleAddNote(note: string) {
    if (!selectedLog) return
    mockClient.addQaNoteToStepLog(run!.id, selectedLog.id, note, 'QA Engineer').then((updated) => {
      setRun({ ...updated })
      const found = updated.stepLogs.find((l) => l.id === selectedLog.id)
      if (found) setSelectedLog(found)
      toast.success('Audit note saved')
    })
  }

  return (
    <div className="animate-enter space-y-6">
      <PageHeader
        title={`Run #${run.runNumber} — ${run.taskTitle}`}
        description={`Target Website: ${run.websiteName} (${run.environment.toUpperCase()})`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/tasks/${run.taskId}`}>
                <ArrowLeft className="h-4 w-4" /> Back to Task
              </Link>
            </Button>
            {isLive ? (
              <Button variant="danger" size="sm" onClick={handleCancel} className="gap-1.5">
                <XCircle className="h-3.5 w-3.5" /> Stop Run
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={handleRerun} className="gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" /> Re-run
              </Button>
            )}
          </div>
        }
      />

      {/* Progress & Live Badge Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-[13px]">
          <div className="flex items-center gap-3">
            <StatusBadge status={run.status as StatusValue} />
            {isLive && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--info-tint)] text-[var(--info)] text-[11px] font-semibold mono-data uppercase tracking-wider">
                <Radio className="h-3 w-3 animate-ai-pulse" /> Live Execution
              </span>
            )}
            <span className="mono-data text-[var(--text-muted)]">
              Duration: <b className="text-[var(--text)]">{formatDuration(run.durationMs)}</b>
            </span>
          </div>

          <div className="flex items-center gap-4 mono-data text-[12px] text-[var(--text-muted)]">
            <span>Passed: <b className="text-[var(--success)]">{passedSteps}</b></span>
            <span>Failed: <b className="text-[var(--danger)]">{failedSteps}</b></span>
            <span>Pass Rate: <b className="text-[var(--text)]">{run.status === 'running' ? `${progressPercent}%` : `${run.passRate}%`}</b></span>
          </div>
        </div>

        {/* Progress track */}
        <div className="w-full h-1.5 bg-[var(--track-bg)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--success)] transition-all duration-300"
            style={{ width: `${run.status === 'running' ? progressPercent : run.passRate}%` }}
          />
        </div>
      </Card>

      {/* Split Run View: Timeline (Left 4 cols) & Step Table (Right 8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <Card>
            <div className="text-[12px] font-semibold text-[var(--text)] uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Chronological Timeline</span>
              <span className="mono-data text-[11px] text-[var(--text-muted)]">{run.stepLogs.length} events</span>
            </div>
            <Timeline
              logs={run.stepLogs}
              selectedLogId={selectedLog?.id}
              onSelectLog={setSelectedLog}
            />
          </Card>
        </div>

        <div className="lg:col-span-8">
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[var(--text)] uppercase tracking-wider">
                Step Execution Matrix
              </span>
              <span className="text-[12px] text-[var(--text-muted)]">
                Click any step to inspect request/response payloads
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
                    <th className="text-left py-3 px-4 w-12">#</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Test Step Action</th>
                    <th className="text-left py-3 px-4">Validation Type</th>
                    <th className="text-right py-3 px-4">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {run.stepLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[var(--text-muted)]">
                        No step events recorded yet.
                      </td>
                    </tr>
                  ) : (
                    run.stepLogs.map((log, idx) => (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className={`cursor-pointer transition-colors ${
                          selectedLog?.id === log.id
                            ? 'bg-[var(--surface-elevated)]'
                            : 'hover:bg-[var(--hover-row)]'
                        }`}
                      >
                        <td className="py-3 px-4 mono-data text-[12px] text-[var(--text-muted)]">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={log.status as StatusValue} />
                        </td>
                        <td className="py-3 px-4 font-medium text-[var(--text)]">
                          {log.action}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono bg-[var(--surface-elevated)] text-[var(--text-muted)] border border-[var(--border)]">
                            {log.validationType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right mono-data text-[var(--text-muted)]">
                          {formatDuration(log.durationMs)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Diagnostics Drawer */}
      <StepLogDrawer
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
        onAddNote={handleAddNote}
      />
    </div>
  )
}
