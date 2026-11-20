'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react'
import type { TestCase, TestStep } from '@/mocks/data/plans.mock'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StepEditor } from './StepEditor'
import { cn } from '@/lib/utils'

interface CaseCardProps {
  testCase: TestCase
  isLocked?: boolean
  onChange: (updated: TestCase) => void
  onDelete?: () => void
}

export function CaseCard({ testCase, isLocked, onChange, onDelete }: CaseCardProps) {
  const [isOpen, setIsOpen] = useState(true)

  function addStep() {
    if (isLocked) return
    const newStep: TestStep = {
      id: `step-${Date.now()}`,
      position: testCase.steps.length + 1,
      action: 'New validation step',
      validationType: 'heading',
      expected: {},
    }
    onChange({
      ...testCase,
      steps: [...testCase.steps, newStep],
    })
  }

  return (
    <Card className="p-0 overflow-hidden mb-4 border-[var(--border)] transition-all">
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--hover-subtle)] transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          <button type="button" className="text-[var(--text-muted)]" aria-label="Toggle Case">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <span className="mono-data text-[12px] font-semibold text-[var(--primary)] bg-[var(--primary-tint)] px-2 py-0.5 rounded">
            CASE #{testCase.position}
          </span>
          <span className="text-[14px] font-medium text-[var(--text)]">{testCase.title}</span>
        </div>

        <div className="flex items-center gap-3 text-[12px] text-[var(--text-muted)]">
          <span className="mono-data">{testCase.steps.length} steps</span>
          {testCase.isOptional && (
            <span className="px-2 py-0.5 rounded text-[11px] bg-[var(--hover-subtle)] border border-[var(--border)]">
              Optional
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      {isOpen && (
        <div className="px-5 pb-5 pt-2 border-t border-[var(--border)] bg-[var(--surface)]">
          {testCase.objective && (
            <div className="mb-3 text-[12px]">
              <span className="font-medium text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Objective: </span>
              <span className="text-[var(--text)]">{testCase.objective}</span>
            </div>
          )}

          <div className="mb-4 text-[12px]">
            <span className="font-medium text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Expected Outcome: </span>
            <span className="text-[var(--text)]">{testCase.expectedOutcome}</span>
          </div>

          <StepEditor
            steps={testCase.steps}
            isLocked={isLocked}
            onChange={(steps) => onChange({ ...testCase, steps })}
          />

          {!isLocked && (
            <div className="mt-3 flex justify-between items-center pt-2 border-t border-[var(--border)]">
              <Button variant="ghost" size="sm" onClick={addStep} className="gap-1.5 text-[12px]">
                <Plus className="h-3.5 w-3.5" /> Add Step
              </Button>
              {onDelete && (
                <Button variant="danger" size="sm" onClick={onDelete} className="text-[12px]">
                  Delete Case
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

