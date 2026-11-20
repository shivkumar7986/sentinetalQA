import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type EngineKind = 'ollama' | 'gemini'

export function EngineBadge({
  engine,
  model,
  className,
}: {
  engine: EngineKind
  model?: string
  className?: string
}) {
  return (
    <Badge variant="neutral" className={cn('mono-data text-[11px] gap-1.5', className)}>
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full shrink-0',
          engine === 'ollama' ? 'bg-orange-400' : 'bg-blue-400'
        )}
      />
      {engine === 'ollama' ? 'Ollama' : 'Gemini'}
      {model && <span className="text-[var(--text-muted)]">· {model}</span>}
    </Badge>
  )
}

