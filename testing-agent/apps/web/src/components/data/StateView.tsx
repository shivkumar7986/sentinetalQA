'use client'

import React from 'react'
import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface StateViewProps {
  isLoading?: boolean
  error?: Error | string | null
  isEmpty?: boolean
  emptyMessage?: string
  emptyAction?: React.ReactNode
  onRetry?: () => void
  skeletonCount?: number
  skeletonClassName?: string
  children: React.ReactNode
}

export function StateView({
  isLoading,
  error,
  isEmpty,
  emptyMessage = 'No items found.',
  emptyAction,
  onRetry,
  skeletonCount = 3,
  skeletonClassName = 'h-16 w-full',
  children,
}: StateViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 animate-enter">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Skeleton key={i} className={cn('rounded-[6px]', skeletonClassName)} />
        ))}
      </div>
    )
  }

  if (error) {
    const message = typeof error === 'string' ? error : error.message
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 rounded-[10px] border border-[var(--danger)]/20 bg-[var(--danger-tint)] animate-enter">
        <AlertTriangle className="h-8 w-8 text-[var(--danger)] mb-2" />
        <p className="text-[14px] font-medium text-[var(--text)]">Failed to load content</p>
        <p className="text-[12px] text-[var(--danger)] mt-1 mb-4 text-center max-w-md">{message}</p>
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </Button>
        )}
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] text-center animate-enter">
        <div className="h-10 w-10 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center mb-3">
          <Inbox className="h-5 w-5 text-[var(--text-muted)]" />
        </div>
        <p className="text-[14px] font-medium text-[var(--text)]">{emptyMessage}</p>
        <p className="text-[12px] text-[var(--text-muted)] mt-1 max-w-sm mb-4">
          Get started by adding a record or refining your filters.
        </p>
        {emptyAction}
      </div>
    )
  }

  return <>{children}</>
}

