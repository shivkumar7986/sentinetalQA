import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={textareaId} className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-[0.05em]">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            'w-full rounded-[6px] border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[14px] text-[var(--text)]',
            'placeholder:text-[var(--text-muted)] resize-y min-h-[80px]',
            'transition-colors duration-150',
            'focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ai-ring)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-[var(--danger)]',
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-[12px] text-[var(--text-muted)]">{hint}</p>}
        {error && <p className="text-[12px] text-[var(--danger)]">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

