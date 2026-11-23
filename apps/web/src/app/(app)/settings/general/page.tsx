'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { Plus } from 'lucide-react'
import { SettingsNav } from '@/components/layout/SettingsNav'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

interface ApiToken {
  id: string
  label: string
  prefix: string
  created: string
}

const INITIAL_TOKENS: ApiToken[] = [
  {
    id: 'tok-1',
    label: 'GitHub Actions CI',
    prefix: 'sqa_live_84f2••••••••',
    created: '12d ago',
  },
  {
    id: 'tok-2',
    label: 'Nightly Staging Cron',
    prefix: 'sqa_live_31a9••••••••',
    created: '3d ago',
  },
]

export default function GeneralSettingsPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user?.role === 'qa_engineer') {
      toast.error('Access Denied: Settings are not available for QA Employees.')
      router.replace('/dashboard')
    }
  }, [user, router])

  const [stepTimeout, setStepTimeout] = useState('15000')
  const [repairRetries, setRepairRetries] = useState('2 retries (recommended)')
  const [retention, setRetention] = useState('365 days')
  const [requireApprover, setRequireApprover] = useState(true)
  const [tokens, setTokens] = useState<ApiToken[]>(INITIAL_TOKENS)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    toast.success('Workspace execution & governance settings saved')
  }

  function handleRevokeToken(id: string, label: string) {
    setTokens((prev) => prev.filter((t) => t.id !== id))
    toast.success(`Revoked API token for "${label}"`)
  }

  function handleCreateToken() {
    const name = prompt('Enter a label for the new API token:')
    if (!name) return
    const newToken: ApiToken = {
      id: `tok-${Date.now()}`,
      label: name,
      prefix: `sqa_live_${Math.random().toString(36).slice(2, 6)}••••••••`,
      created: 'Just now',
    }
    setTokens((prev) => [newToken, ...prev])
    toast.success(`Generated token "${name}"`)
  }

  return (
    <div className="space-y-6 animate-enter">
      {/* Shared Header with + Create API token button */}
      <SettingsNav
        action={
          <Button
            variant="primary"
            size="md"
            type="button"
            onClick={handleCreateToken}
            className="gap-1.5 font-medium bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg px-4 py-2 text-[13px] shadow-none h-10"
          >
            <Plus className="h-4 w-4" /> Create API token
          </Button>
        }
      />

      {/* Card 1: Execution & Governance */}
      <form onSubmit={handleSave} className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-6 space-y-6 shadow-none">
        <h2 className="text-[15px] font-semibold text-[var(--text)]">
          Execution & Governance
        </h2>

        {/* 3 Fields Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step timeout */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-[var(--text-muted)]">
              Step timeout (ms)
            </label>
            <input
              type="number"
              value={stepTimeout}
              onChange={(e) => setStepTimeout(e.target.value)}
              className="w-full h-10 px-3.5 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:border-[var(--border-hover)] transition-colors"
            />
          </div>

          {/* JSON schema repair retries */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-[var(--text-muted)]">
              JSON schema repair retries
            </label>
            <select
              value={repairRetries}
              onChange={(e) => setRepairRetries(e.target.value)}
              className="w-full h-10 px-3.5 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:border-[var(--border-hover)] transition-colors"
            >
              <option value="2 retries (recommended)">2 retries (recommended)</option>
              <option value="1 retry">1 retry</option>
              <option value="3 retries">3 retries</option>
              <option value="Disabled (0 retries)">Disabled (0 retries)</option>
            </select>
          </div>

          {/* Audit & report retention */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-[var(--text-muted)]">
              Audit & report retention
            </label>
            <select
              value={retention}
              onChange={(e) => setRetention(e.target.value)}
              className="w-full h-10 px-3.5 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:border-[var(--border-hover)] transition-colors"
            >
              <option value="365 days">365 days</option>
              <option value="180 days">180 days</option>
              <option value="90 days">90 days</option>
              <option value="30 days">30 days</option>
            </select>
          </div>
        </div>

        {/* Require separate approver row */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-[13px] font-medium text-[var(--text)]">
              Require separate approver
            </p>
            <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
              Prevent task authors from approving their own AI-generated test plans.
            </p>
          </div>
          <Switch
            checked={requireApprover}
            onCheckedChange={setRequireApprover}
            className="data-[state=checked]:bg-[#4F46E5]"
          />
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
          >
            Save changes
          </Button>
        </div>
      </form>

      {/* Card 2: Workspace API Tokens */}
      <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-none">
        <div className="p-5 flex items-center justify-between border-b border-[var(--border)]">
          <h2 className="text-[15px] font-semibold text-[var(--text)]">
            Workspace API Tokens
          </h2>
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={handleCreateToken}
          >
            + New token
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--border)] text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                <th className="text-left py-3.5 px-6 font-semibold">LABEL</th>
                <th className="text-left py-3.5 px-4 font-semibold">TOKEN PREFIX</th>
                <th className="text-left py-3.5 px-4 font-semibold">CREATED</th>
                <th className="text-right py-3.5 px-6 font-semibold">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {tokens.map((token) => (
                <tr key={token.id} className="hover:bg-[var(--hover-row)] transition-colors">
                  <td className="py-3.5 px-6 font-semibold text-[13px] text-[var(--text)]">
                    {token.label}
                  </td>
                  <td className="py-3.5 px-4 mono-data text-[12px] text-[var(--text-muted)]">
                    {token.prefix}
                  </td>
                  <td className="py-3.5 px-4 text-[12px] text-[var(--text-muted)]">
                    {token.created}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      type="button"
                      onClick={() => handleRevokeToken(token.id, token.label)}
                      className="h-7 px-3 text-[12px] font-medium border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 bg-white dark:bg-[var(--surface)] hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-[6px] transition-colors"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
