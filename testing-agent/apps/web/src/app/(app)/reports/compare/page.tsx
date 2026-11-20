'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, GitCompare, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatusBadge, type StatusValue } from '@/components/domain/StatusBadge'
import { StateView } from '@/components/data/StateView'
import { mockClient } from '@/mocks/mockClient'
import type { Run } from '@/mocks/data/runs.mock'
import { formatDuration } from '@/lib/format'

export default function CompareReportsPage() {
  const searchParams = useSearchParams()
  const runAId = searchParams.get('a')
  const runBId = searchParams.get('b')

  const [runA, setRunA] = useState<Run | null>(null)
  const [runB, setRunB] = useState<Run | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!runAId || !runBId) {
      setLoading(false)
      return
    }

    Promise.all([mockClient.getRunById(runAId), mockClient.getRunById(runBId)]).then(
      ([a, b]) => {
        setRunA(a)
        setRunB(b)
        setLoading(false)
      }
    )
  }, [runAId, runBId])

  if (loading) {
    return <StateView isLoading={true} skeletonCount={4}><div /></StateView>
  }

  if (!runA || !runB) {
    return (
      <div className="py-12 text-center text-[var(--text-muted)] space-y-4">
        <p>Please select two valid runs from the Reports page to compare.</p>
        <Button variant="secondary" asChild>
          <Link href="/reports">Back to Reports</Link>
        </Button>
      </div>
    )
  }

  const maxSteps = Math.max(runA.stepLogs.length, runB.stepLogs.length)

  return (
    <div className="animate-enter space-y-6">
      <PageHeader
        title="Side-by-Side Run Comparison"
        description="Analyze regression deltas, timing variances, and step failures"
        action={
          <Button variant="ghost" size="sm" asChild>
            <Link href="/reports">
              <ArrowLeft className="h-4 w-4" /> Back to Reports
            </Link>
          </Button>
        }
      />

      {/* Overview Cards Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Run A */}
        <Card className="border-[var(--border)]">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="mono-data text-[12px] font-semibold text-[var(--primary)]">
                RUN #{runA.runNumber} (BASE)
              </span>
              <h3 className="text-[14px] font-medium text-[var(--text)] mt-1">{runA.taskTitle}</h3>
            </div>
            <StatusBadge status={runA.status as StatusValue} />
          </div>
          <div className="flex items-center gap-4 text-[12px] mono-data text-[var(--text-muted)] mt-3 pt-3 border-t border-[var(--border)]">
            <span>Pass Rate: <b className="text-[var(--text)]">{runA.passRate}%</b></span>
            <span>Duration: <b className="text-[var(--text)]">{formatDuration(runA.durationMs)}</b></span>
          </div>
        </Card>

        {/* Run B */}
        <Card className="border-[var(--border)]">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="mono-data text-[12px] font-semibold text-[var(--info)]">
                RUN #{runB.runNumber} (TARGET)
              </span>
              <h3 className="text-[14px] font-medium text-[var(--text)] mt-1">{runB.taskTitle}</h3>
            </div>
            <StatusBadge status={runB.status as StatusValue} />
          </div>
          <div className="flex items-center gap-4 text-[12px] mono-data text-[var(--text-muted)] mt-3 pt-3 border-t border-[var(--border)]">
            <span>Pass Rate: <b className="text-[var(--text)]">{runB.passRate}%</b></span>
            <span>Duration: <b className="text-[var(--text)]">{formatDuration(runB.durationMs)}</b></span>
          </div>
        </Card>
      </div>

      {/* Step Comparison Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-[var(--border)]">
          <h3 className="text-[13px] font-semibold text-[var(--text)] uppercase tracking-wider">
            Step-by-Step Execution Diff
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--border)] text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-left">#</th>
                <th className="py-3 px-4 text-left">Test Step Action</th>
                <th className="py-3 px-4 text-left">Run #{runA.runNumber} Status</th>
                <th className="py-3 px-4 text-left">Run #{runB.runNumber} Status</th>
                <th className="py-3 px-4 text-right">Duration Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {Array.from({ length: maxSteps }).map((_, idx) => {
                const stepA = runA.stepLogs[idx]
                const stepB = runB.stepLogs[idx]
                const action = stepA?.action || stepB?.action || '—'

                const durA = stepA?.durationMs || 0
                const durB = stepB?.durationMs || 0
                const delta = durB - durA
                const hasDiff = stepA && stepB && stepA.status !== stepB.status

                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${hasDiff ? 'bg-[var(--danger-tint)]/40' : 'hover:bg-[var(--hover-row)]'}`}
                  >
                    <td className="py-3 px-4 mono-data text-[var(--text-muted)]">{idx + 1}</td>
                    <td className="py-3 px-4 font-medium text-[var(--text)]">{action}</td>
                    <td className="py-3 px-4">
                      {stepA ? (
                        <div className="flex items-center gap-2">
                          <StatusBadge status={stepA.status as StatusValue} />
                          <span className="mono-data text-[11px] text-[var(--text-muted)]">
                            {formatDuration(stepA.durationMs)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[var(--text-muted)]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {stepB ? (
                        <div className="flex items-center gap-2">
                          <StatusBadge status={stepB.status as StatusValue} />
                          <span className="mono-data text-[11px] text-[var(--text-muted)]">
                            {formatDuration(stepB.durationMs)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[var(--text-muted)]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right mono-data text-[12px]">
                      {stepA && stepB ? (
                        <span className={delta > 0 ? 'text-[var(--danger)]' : 'text-[var(--success)]'}>
                          {delta > 0 ? `+${delta}ms` : `${delta}ms`}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
