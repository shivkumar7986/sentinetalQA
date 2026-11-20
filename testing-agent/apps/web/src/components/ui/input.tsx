import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-[0.05em]"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'h-9 w-full rounded-[6px] border border-[var(--border)] bg-[var(--bg)] px-3 text-[14px] text-[var(--text)]',
            'placeholder:text-[var(--text-muted)]',
            'transition-colors duration-150',
            'focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ai-ring)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-[var(--danger)] focus:ring-[var(--danger-tint)]',
            className
          )}
          {...props}
        />
        {error && <p className="text-[12px] text-[var(--danger)]">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

