'use client'

import { Lock, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PlanLockBannerProps {
  version: number
  approvedAt?: string
  onCreateNewVersion: () => void
}

export function PlanLockBanner({ version, approvedAt, onCreateNewVersion }: PlanLockBannerProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-[10px] bg-[var(--success-tint)] border border-[var(--success)]/30 mb-6 animate-enter">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-[var(--success)] text-white flex items-center justify-center shrink-0">
          <Lock className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-[var(--text)]">
            Plan v{version} is Approved & Locked
          </p>
          <p className="text-[12px] text-[var(--text-muted)]">
            {approvedAt
              ? `Approved on ${new Date(approvedAt).toLocaleDateString()} · Steps are immutable to preserve audit integrity.`
              : 'Steps are immutable to preserve audit integrity.'}
          </p>
        </div>
      </div>

      <Button variant="secondary" size="sm" onClick={onCreateNewVersion} className="gap-2 shrink-0">
        <PlusCircle className="h-3.5 w-3.5 text-[var(--primary)]" />
        Create v{version + 1} to Edit
      </Button>
    </div>
  )
}

