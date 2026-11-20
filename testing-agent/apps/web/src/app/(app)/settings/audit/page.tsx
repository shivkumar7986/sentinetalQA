'use client'

import React, { useState } from 'react'
import { ChevronDown, Download } from 'lucide-react'
import { SettingsNav } from '@/components/layout/SettingsNav'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface AuditItem {
  id: string
  timestamp: string
  actor: string
  action: string
  entity: string
  diffPreview?: string
}

const INITIAL_AUDIT_LOGS: AuditItem[] = [
  {
    id: 'aud-1',
    timestamp: '2026-11-19 16:40:12',
    actor: 'Riya Sharma',
    action: 'plan.approved',
    entity: 'plan-108 (v2)',
    diffPreview: 'status: "in_review" → "approved"\napprovedBy: "Riya Sharma"\napprovedAt: "2026-11-19T16:40:12Z"',
  },
  {
    id: 'aud-2',
    timestamp: '2026-11-19 15:18:04',
    actor: 'Aarav Mehta',
    action: 'provider.updated',
    entity: 'ollama',
    diffPreview: 'model: "qwen2.5:7b" → "qwen2.5:14b"\nlatency: 28ms',
  },
  {
    id: 'aud-3',
    timestamp: '2026-11-19 11:02:55',
    actor: 'Aarav Mehta',
    action: 'credentials.updated',
    entity: 'ws-1/Dispatcher',
    diffPreview: 'username: "dispatcher_prod" (masked)\npassword: •••••••• (vault sealed)',
  },
  {
    id: 'aud-4',
    timestamp: '2026-11-18 17:45:19',
    actor: 'Karan Verma',
    action: 'website.created',
    entity: 'ws-3',
    diffPreview: 'name: "Customer Checkout"\nbaseUrl: "https://app.company.com"\nenvironment: "production"',
  },
]

export default function AuditSettingsPage() {
  const [logs] = useState<AuditItem[]>(INITIAL_AUDIT_LOGS)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function handleExportCsv() {
    const headers = ['Timestamp', 'Actor', 'Action', 'Entity']
    const rows = logs.map((l) => [l.timestamp, l.actor, l.action, l.entity])
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `sentinel_audit_log_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Audit log CSV exported')
  }

  const filtered = logs.filter((log) => {
    const matchesSearch =
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.entity.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase())
    const matchesAction = actionFilter === 'all' || log.action === actionFilter
    return matchesSearch && matchesAction
  })

  return (
    <div className="space-y-6 animate-enter">
      {/* Shared Header with Export CSV button */}
      <SettingsNav
        action={
          <Button
            variant="secondary"
            size="md"
            type="button"
            onClick={handleExportCsv}
            className="h-10 px-4 text-[13px] font-medium border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
          >
            Export CSV
          </Button>
        }
      />

      {/* Control Bar: [ Filter input ] [ All actions ▾ ] */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Filter by user or entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full px-3.5 text-[13px] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-[8px] text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#4F46E5] transition-colors"
          />
        </div>

        <div className="relative">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="h-10 px-3.5 pr-8 text-[13px] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-[8px] text-gray-800 dark:text-neutral-200 focus:outline-none focus:border-[#4F46E5] appearance-none cursor-pointer transition-colors"
          >
            <option value="all">All actions</option>
            <option value="plan.approved">plan.approved</option>
            <option value="provider.updated">provider.updated</option>
            <option value="credentials.updated">credentials.updated</option>
            <option value="website.created">website.created</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Audit Log Table Card matching reference screenshot */}
      <div className="rounded-[8px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-neutral-800 text-[11px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                <th className="text-left py-3.5 px-6 font-semibold">TIMESTAMP</th>
                <th className="text-left py-3.5 px-4 font-semibold">ACTOR</th>
                <th className="text-left py-3.5 px-4 font-semibold">ACTION</th>
                <th className="text-left py-3.5 px-4 font-semibold">ENTITY</th>
                <th className="text-right py-3.5 px-6 font-semibold">DIFF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/80">
              {filtered.map((log) => {
                const isExpanded = expandedId === log.id
                return (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-gray-50/70 dark:hover:bg-neutral-800/40 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3.5 px-6 mono-data text-[12px] text-gray-500 dark:text-neutral-400">
                        {log.timestamp}
                      </td>

                      {/* Actor */}
                      <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                        {log.actor}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 mono-data text-[13px] text-[#4F46E5] dark:text-indigo-400 font-medium">
                        {log.action}
                      </td>

                      {/* Entity */}
                      <td className="py-3.5 px-4 mono-data text-[13px] text-gray-700 dark:text-neutral-300">
                        {log.entity}
                      </td>

                      {/* Diff dropdown trigger */}
                      <td className="py-3.5 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : log.id)}
                          className="inline-flex items-center gap-1 text-[12px] font-medium text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white transition-colors select-none"
                        >
                          <span>Inspect</span>
                          <ChevronDown
                            className={cn(
                              'h-3.5 w-3.5 transition-transform duration-150',
                              isExpanded && 'rotate-180'
                            )}
                          />
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Diff Viewer */}
                    {isExpanded && log.diffPreview && (
                      <tr className="bg-gray-50/80 dark:bg-neutral-800/30">
                        <td colSpan={5} className="px-6 py-3 border-b border-gray-100 dark:border-neutral-800">
                          <pre className="mono-data text-[12px] text-gray-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 p-3 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-x-auto whitespace-pre leading-relaxed">
                            {log.diffPreview}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
