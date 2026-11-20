'use client'

import { cn } from '@/lib/utils'

interface EngineSwitchProps {
  value: 'ollama' | 'gemini'
  onChange: (val: 'ollama' | 'gemini') => void
  disabled?: boolean
  className?: string
}

export function EngineSwitch({ value, onChange, disabled, className }: EngineSwitchProps) {
  return (
    <div
      role="radiogroup"
      aria-label="AI Engine Provider"
      className={cn(
        'inline-flex items-center p-0.5 rounded-[6px] bg-[var(--surface-elevated)] border border-[var(--border)]',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={value === 'ollama'}
        disabled={disabled}
        onClick={() => onChange('ollama')}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-colors select-none',
          value === 'ollama'
            ? 'bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] shadow-none'
            : 'text-[var(--text-muted)] hover:text-[var(--text)]'
        )}
      >
        <span className="h-2 w-2 rounded-full bg-orange-400" />
        <span>Ollama Local</span>
        <span className="text-[10px] mono-data text-[var(--text-muted)] bg-[var(--bg)] px-1 py-0.2 rounded border border-[var(--border)]">
          Private
        </span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={value === 'gemini'}
        disabled={disabled}
        onClick={() => onChange('gemini')}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-colors select-none',
          value === 'gemini'
            ? 'bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] shadow-none'
            : 'text-[var(--text-muted)] hover:text-[var(--text)]'
        )}
      >
        <span className="h-2 w-2 rounded-full bg-blue-400" />
        <span>Gemini Cloud</span>
        <span className="text-[10px] mono-data text-[var(--text-muted)] bg-[var(--bg)] px-1 py-0.2 rounded border border-[var(--border)]">
          Fast
        </span>
      </button>
    </div>
  )
}

