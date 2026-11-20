import * as React from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Loader2, Clock, SkipForward, CircleDot } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type StatusValue =
  | 'queued' | 'running' | 'passed' | 'failed' | 'error' | 'cancelled' | 'skipped'
  | 'pending' | 'in_review' | 'approved' | 'rejected' | 'draft'
  | 'plan_generated' | 'completed' | 'superseded'

type StatusCfg = {
  label: string
  variant: 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'default'
  Icon: React.ComponentType<{ className?: string }>
  spinIcon?: boolean
}

const STATUS_MAP: Record<StatusValue, StatusCfg> = {
  passed:         { label: 'Passed',      variant: 'success', Icon: CheckCircle2 },
  completed:      { label: 'Completed',   variant: 'success', Icon: CheckCircle2 },
  approved:       { label: 'Approved',    variant: 'success', Icon: CheckCircle2 },
  failed:         { label: 'Failed',      variant: 'danger',  Icon: XCircle },
  rejected:       { label: 'Rejected',    variant: 'danger',  Icon: XCircle },
  cancelled:      { label: 'Cancelled',   variant: 'danger',  Icon: XCircle },
  error:          { label: 'Error',       variant: 'warning', Icon: AlertTriangle },
  in_review:      { label: 'In Review',   variant: 'warning', Icon: AlertTriangle },
  plan_generated: { label: 'Plan Ready',  variant: 'warning', Icon: AlertTriangle },
  running:        { label: 'Running',     variant: 'info',    Icon: Loader2, spinIcon: true },
  queued:         { label: 'Queued',      variant: 'neutral', Icon: Clock },
  pending:        { label: 'Pending',     variant: 'neutral', Icon: Clock },
  draft:          { label: 'Draft',       variant: 'neutral', Icon: CircleDot },
  skipped:        { label: 'Skipped',     variant: 'neutral', Icon: SkipForward },
  superseded:     { label: 'Superseded',  variant: 'neutral', Icon: CircleDot },
}

interface StatusBadgeProps {
  status: StatusValue
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const cfg = STATUS_MAP[status] ?? STATUS_MAP.draft
  const { label, variant, Icon, spinIcon } = cfg
  return (
    <Badge variant={variant} className={cn('gap-1', className)}>
      <Icon className={cn('h-3 w-3 shrink-0', spinIcon && 'animate-spin')} />
      <span>{label}</span>
    </Badge>
  )
}

