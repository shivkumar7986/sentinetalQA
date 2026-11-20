'use client'

import React from 'react'
import { Trash2, GripVertical } from 'lucide-react'
import type { TestStep, ValidationType } from '@/mocks/data/plans.mock'
import { cn } from '@/lib/utils'

interface StepEditorProps {
  steps: TestStep[]
  isLocked?: boolean
  onChange: (steps: TestStep[]) => void
}

const VALIDATION_TYPES: { value: ValidationType; label: string }[] = [
  { value: 'route_check', label: 'Route Check' },
  { value: 'form_structure', label: 'Form Structure' },
  { value: 'auth_response', label: 'Auth Response' },
  { value: 'redirect', label: 'Redirect Target' },
  { value: 'navigation', label: 'Navigation Link' },
  { value: 'heading', label: 'Heading / Text' },
  { value: 'content_rule', label: 'Business Rule' },
  { value: 'custom', label: 'Custom Assertion' },
]

export function StepEditor({ steps, isLocked, onChange }: StepEditorProps) {
  function updateStep(index: number, updates: Partial<TestStep>) {
    if (isLocked) return
    const updated = [...steps]
    updated[index] = { ...updated[index], ...updates }
    onChange(updated)
  }

  function deleteStep(index: number) {
    if (isLocked) return
    const updated = steps.filter((_, i) => i !== index)
    onChange(updated)
  }

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="w-full text-[13px] min-w-[600px]">
        <thead>
          <tr className="border-b border-[var(--border)] text-[11px] text-[var(--text-muted)] uppercase tracking-[0.05em]">
            <th className="text-left py-2 px-2 w-8">#</th>
            <th className="text-left py-2 px-2">Action / Step</th>
            <th className="text-left py-2 px-2 w-40">Validation Type</th>
            <th className="text-left py-2 px-2">Target / Selector</th>
            {!isLocked && <th className="text-right py-2 px-2 w-10"></th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {steps.map((step, idx) => (
            <tr key={step.id || idx} className="hover:bg-[var(--hover-row)] transition-colors">
              <td className="py-2.5 px-2 mono-data text-[12px] text-[var(--text-muted)]">
                {idx + 1}
              </td>
              <td className="py-2.5 px-2">
                {isLocked ? (
                  <span className="text-[var(--text)] font-medium">{step.action}</span>
                ) : (
                  <input
                    type="text"
                    value={step.action}
                    onChange={(e) => updateStep(idx, { action: e.target.value })}
                    className="w-full h-8 px-2.5 text-[13px] bg-[var(--bg)] border border-[var(--border)] rounded-[4px] focus:outline-none focus:border-[var(--primary)]"
                  />
                )}
              </td>
              <td className="py-2.5 px-2">
                {isLocked ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-muted)]">
                    {step.validationType}
                  </span>
                ) : (
                  <select
                    value={step.validationType}
                    onChange={(e) => updateStep(idx, { validationType: e.target.value as ValidationType })}
                    className="w-full h-8 px-2 text-[12px] bg-[var(--bg)] border border-[var(--border)] rounded-[4px] focus:outline-none focus:border-[var(--primary)]"
                  >
                    {VALIDATION_TYPES.map((vt) => (
                      <option key={vt.value} value={vt.value}>
                        {vt.label}
                      </option>
                    ))}
                  </select>
                )}
              </td>
              <td className="py-2.5 px-2">
                {isLocked ? (
                  <span className="mono-data text-[12px] text-[var(--text-muted)]">
                    {step.target?.selector || step.target?.url || '—'}
                  </span>
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. #map-container or /login"
                    value={step.target?.selector || step.target?.url || ''}
                    onChange={(e) => {
                      const val = e.target.value
                      const isUrl = val.startsWith('http') || val.startsWith('/')
                      updateStep(idx, {
                        target: isUrl ? { url: val } : { selector: val },
                      })
                    }}
                    className="w-full h-8 px-2.5 text-[12px] mono-data bg-[var(--bg)] border border-[var(--border)] rounded-[4px] focus:outline-none focus:border-[var(--primary)]"
                  />
                )}
              </td>
              {!isLocked && (
                <td className="py-2.5 px-2 text-right">
                  <button
                    type="button"
                    onClick={() => deleteStep(idx)}
                    className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors p-1"
                    title="Delete step"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

