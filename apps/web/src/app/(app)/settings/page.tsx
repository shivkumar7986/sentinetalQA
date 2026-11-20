'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { toast } from 'sonner'

export default function SettingsRedirectPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user?.role === 'qa_engineer') {
      toast.error('Access Denied', {
        description: 'QA Employees do not have permission to access the Settings module.',
      })
      router.replace('/dashboard')
    } else {
      router.replace('/settings/general')
    }
  }, [router, user])

  return null
}

