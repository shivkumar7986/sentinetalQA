import { formatDistanceToNow, format } from 'date-fns'

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  const m = Math.floor(ms / 60_000)
  const s = Math.floor((ms % 60_000) / 1000)
  return `${m}m ${s}s`
}

export function formatTimestamp(date: string | Date): string {
  return format(new Date(date), 'HH:mm:ss.SSS')
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatPassRate(passed: number, total: number): string {
  if (total === 0) return '—'
  return `${((passed / total) * 100).toFixed(1)}%`
}

