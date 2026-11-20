'use client'

import { Button } from '@/components/ui/button'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="text-center max-w-sm">
        <h1 className="text-[20px] font-semibold text-[var(--text)]">Something went wrong</h1>
        <p className="text-[13px] text-[var(--text-muted)] mt-2 mb-6 font-mono text-[12px] break-all">
          {error.message}
        </p>
        <Button variant="primary" onClick={reset}>Try again</Button>
      </div>
    </div>
  )
}

