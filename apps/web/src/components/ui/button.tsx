import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
  loading?: boolean
}

const variants = {
  primary:   'bg-[var(--primary)] text-[var(--primary-text)] hover:bg-[var(--primary-hover)] border border-transparent',
  secondary: 'bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--surface-elevated)]',
  ghost:     'bg-transparent text-[var(--text-muted)] hover:bg-[var(--hover-subtle)] hover:text-[var(--text)] border border-transparent',
  danger:    'bg-[var(--danger-tint)] text-[var(--danger)] border border-[var(--danger)]/30 hover:bg-[var(--danger)] hover:text-white',
}

const sizes = {
  sm: 'h-8 px-3 text-[12px] rounded-[6px]',
  md: 'h-9 px-4 text-[13px] rounded-[6px]',
  lg: 'h-10 px-5 text-[14px] rounded-[6px]',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', asChild, loading, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 cursor-pointer select-none tactile',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ai-ring)] focus-visible:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" />
        ) : children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

