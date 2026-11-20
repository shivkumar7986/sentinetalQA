'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NewWebsitePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to websites page with the new-website slide-over drawer open
    router.replace('/websites?new=true')
  }, [router])

  return (
    <div className="h-64 flex items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <span className="h-4 w-4 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
        <span>Opening registration drawer...</span>
      </div>
    </div>
  )
}
