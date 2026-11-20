import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type EnvValue = 'dev' | 'staging' | 'qa' | 'production'

const ENV_MAP: Record<EnvValue, { label: string; variant: 'neutral' | 'info' | 'default' | 'danger' }> = {
  dev:        { label: 'DEV',        variant: 'neutral' },
  staging:    { label: 'STAGING',    variant: 'info' },
  qa:         { label: 'QA',         variant: 'default' },
  production: { label: 'PRODUCTION', variant: 'danger' },
}

export function EnvBadge({ env, className }: { env: EnvValue; className?: string }) {
  const { label, variant } = ENV_MAP[env] ?? ENV_MAP.dev
  return (
    <Badge
      variant={variant}
      className={cn('mono-data text-[11px] uppercase tracking-[0.05em] rounded-[6px]', className)}
    >
      {label}
    </Badge>
  )
}

