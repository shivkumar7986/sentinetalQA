'use client'

import React, { useState } from 'react'
import { X, MessageSquare, Terminal } from 'lucide-react'
import type { StepLog } from '@/mocks/data/runs.mock'
import { StatusBadge } from './StatusBadge'
import { Button } from '@/components/ui/button'
import { formatDuration } from '@/lib/format'

interface StepLogDrawerProps {
  log: StepLog | null
  onClose: () => void
  onAddNote: (note: string) => void
}

export function StepLogDrawer({ log, onClose, onAddNote }: StepLogDrawerProps) {
  const [noteText, setNoteText] = useState('')

  if (!log) return null

  function handleSubmitNote(e: React.FormEvent) {
    e.preventDefault()
    if (!noteText.trim()) return
    onAddNote(noteText)
    setNoteText('')
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-[var(--surface)] border-l border-[var(--border)] z-40 flex flex-col shadow-none animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={log.status} />
            <span className="mono-data text-[12px] text-[var(--text-muted)]">
              {formatDuration(log.durationMs)}
            </span>
          </div>
          <h3 className="text-[14px] font-semibold text-[var(--text)]">{log.action}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-[var(--text-muted)] hover:text-[var(--text)] p-1 rounded transition-colors"
          aria-label="Close details"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div>
          <h4 className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Check Performed
          </h4>
          <p className="text-[13px] text-[var(--text)] font-mono bg-[var(--surface-elevated)] p-2.5 rounded-[6px] border border-[var(--border)]">
            {log.checkPerformed}
          </p>
        </div>

        {log.requestSummary && (
          <div>
            <h4 className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
              Request Payload
            </h4>
            <pre className="text-[12px] mono-data text-[var(--text)] bg-[var(--bg)] p-3 rounded-[6px] border border-[var(--border)] overflow-x-auto">
              {JSON.stringify(log.requestSummary, null, 2)}
            </pre>
          </div>
        )}

        {log.responseSummary && (
          <div>
            <h4 className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
              Response Summary
            </h4>
            <pre className="text-[12px] mono-data text-[var(--text)] bg-[var(--bg)] p-3 rounded-[6px] border border-[var(--border)] overflow-x-auto">
              {JSON.stringify(log.responseSummary, null, 2)}
            </pre>
          </div>
        )}

        {log.errorMessage && (
          <div>
            <h4 className="text-[11px] font-medium text-[var(--danger)] uppercase tracking-wider mb-1">
              Failure Details ({log.errorCategory})
            </h4>
            <div className="text-[12px] text-[var(--danger)] bg-[var(--danger-tint)] p-3 rounded-[6px] border border-[var(--danger)]/30 font-mono">
              {log.errorMessage}
            </div>
          </div>
        )}

        {/* QA Notes */}
        <div>
          <h4 className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" /> QA Notes
          </h4>

          {log.qaNotes && log.qaNotes.length > 0 ? (
            <div className="space-y-2 mb-3">
              {log.qaNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-2.5 rounded-[6px] bg-[var(--surface-elevated)] border border-[var(--border)] text-[12px]"
                >
                  <div className="flex justify-between text-[11px] text-[var(--text-muted)] mb-1">
                    <span className="font-medium text-[var(--text)]">{note.author}</span>
                    <span>{new Date(note.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[var(--text)]">{note.note}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-[var(--text-muted)] italic mb-3">No QA notes added yet.</p>
          )}

          <form onSubmit={handleSubmitNote} className="flex gap-2">
            <input
              type="text"
              placeholder="Add an audit note..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="flex-1 h-8 px-2.5 text-[12px] bg-[var(--bg)] border border-[var(--border)] rounded-[4px] focus:outline-none focus:border-[var(--primary)]"
            />
            <Button type="submit" variant="primary" size="sm" className="h-8 text-[12px]">
              Post Note
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

