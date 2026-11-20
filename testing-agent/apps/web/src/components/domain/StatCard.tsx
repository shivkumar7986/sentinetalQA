import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  delta?: { value: string; positive: boolean }
  icon: LucideIcon
  className?: string
}

export function StatCard({ title, value, delta, icon: Icon, className }: StatCardProps) {
  return (
    <Card className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-[0.05em]">
          {title}
        </span>
        <Icon className="h-4 w-4 text-[var(--text-muted)]" />
      </div>
      <div className="flex items-end justify-between">
        <span className="mono-data text-[24px] font-semibold text-[var(--text)] leading-none tracking-[-0.02em]">
          {value}
        </span>
        {delta && (
          <span
            className={cn(
              'text-[12px] font-medium mono-data',
              delta.positive ? 'text-[var(--success)]' : 'text-[var(--danger)]'
            )}
          >
            {delta.positive ? '↑' : '↓'} {delta.value}
          </span>
        )}
      </div>
    </Card>
  )
}

