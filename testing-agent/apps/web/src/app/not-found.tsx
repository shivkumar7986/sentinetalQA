import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="text-center">
        <p className="mono-data text-[72px] font-semibold leading-none" style={{ color: 'var(--border-hover)' }}>
          404
        </p>
        <h1 className="text-[20px] font-semibold text-[var(--text)] mt-4">Page not found</h1>
        <p className="text-[13px] text-[var(--text-muted)] mt-2">The page you are looking for does not exist.</p>
        <Button variant="primary" size="md" className="mt-6" asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}

