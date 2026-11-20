import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'neutral'
}

const badgeVariants = {
  default: 'bg-[var(--primary-tint)] text-[var(--primary)]',
  success: 'bg-[var(--success-tint)] text-[var(--success)]',
  danger:  'bg-[var(--danger-tint)] text-[var(--danger)]',
  warning: 'bg-[var(--warning-tint)] text-[var(--warning)]',
  info:    'bg-[var(--info-tint)] text-[var(--info)]',
  neutral: 'bg-[var(--hover-subtle)] text-[var(--text-muted)]',
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 h-[22px] px-2 text-[12px] font-medium rounded-full whitespace-nowrap',
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  )
}

