'use client'

import React from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Loader2, Clock } from 'lucide-react'
import type { StepLog } from '@/mocks/data/runs.mock'
import { formatDuration } from '@/lib/format'
import { cn } from '@/lib/utils'

interface TimelineProps {
  logs: StepLog[]
  selectedLogId?: string
  onSelectLog: (log: StepLog) => void
}

export function Timeline({ logs, selectedLogId, onSelectLog }: TimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="py-8 text-center text-[12px] text-[var(--text-muted)]">
        Waiting for steps to begin...
      </div>
    )
  }

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border)]">
      {logs.map((log, idx) => {
        const isSelected = selectedLogId === log.id
        const isPass = log.status === 'passed'
        const isFail = log.status === 'failed'

        return (
          <div
            key={log.id}
            onClick={() => onSelectLog(log)}
            className={cn(
              'relative group cursor-pointer p-2.5 rounded-[6px] border transition-colors select-none',
              isSelected
                ? 'bg-[var(--surface-elevated)] border-[var(--border-hover)]'
                : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-hover)]'
            )}
          >
            {/* Timeline dot */}
            <div
              className={cn(
                'absolute -left-[27px] top-3.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--surface)] flex items-center justify-center',
                isPass && 'bg-[var(--success)]',
                isFail && 'bg-[var(--danger)]',
                log.status === 'running' && 'bg-[var(--info)] animate-ai-pulse',
                log.status === 'pending' && 'bg-[var(--border-hover)]'
              )}
            />

            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="mono-data text-[var(--text-muted)]">
                {new Date(log.startedAt).toLocaleTimeString()}
              </span>
              <span className="mono-data px-1.5 py-0.2 rounded bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-muted)]">
                {formatDuration(log.durationMs)}
              </span>
            </div>

            <p className="text-[13px] font-medium text-[var(--text)] line-clamp-1">{log.action}</p>
            <p className="text-[11px] text-[var(--text-muted)] line-clamp-1 mt-0.5 font-mono">
              {log.checkPerformed}
            </p>
          </div>
        )
      })}
    </div>
  )
}

