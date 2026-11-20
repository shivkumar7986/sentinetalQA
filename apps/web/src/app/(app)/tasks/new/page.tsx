'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function NewTaskRedirectInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const webId = searchParams.get('websiteId')
    const query = webId ? `?new=true&websiteId=${encodeURIComponent(webId)}` : '?new=true'
    router.replace(`/tasks${query}`)
  }, [router, searchParams])

  return (
    <div className="h-64 flex items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <span className="h-4 w-4 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
        <span>Opening task creator...</span>
      </div>
    </div>
  )
}

export default function NewTaskRedirectPage() {
  return (
    <Suspense fallback={<div className="h-64" />}>
      <NewTaskRedirectInner />
    </Suspense>
  )
}
