'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, type UserRole } from '@/stores/auth.store'
import { usePermissions } from '@/lib/permissions'
import { ChevronDown, Download, ShieldCheck, UserCheck, Filter } from 'lucide-react'
import { SettingsNav } from '@/components/layout/SettingsNav'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { mockClient } from '@/mocks/mockClient'
import type { AuditItem } from '@/mocks/data/audit.mock'

export default function AuditSettingsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { isAdmin, isLead, isEmployee, meta } = usePermissions()

  useEffect(() => {
    if (user?.role === 'qa_engineer') {
      toast.error('Access Denied: Settings are not available for QA Employees.')
      router.replace('/dashboard')
    }
  }, [user, router])

  const [logs, setLogs] = useState<AuditItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Load audit logs based on role and listen for real-time updates
  useEffect(() => {
    async function loadLogs() {
      const data = await mockClient.getAuditLogs(user?.role)
      setLogs(data)
      setLoading(false)
    }
    if (user?.role && user?.role !== 'qa_engineer') {
      loadLogs()
    }

    const handleAuditChange = () => {
      if (user?.role && user?.role !== 'qa_engineer') {
        mockClient.getAuditLogs(user?.role).then(setLogs)
      }
    }

    window.addEventListener('testing_agent_audit_changed', handleAuditChange)
    return () => window.removeEventListener('testing_agent_audit_changed', handleAuditChange)
  }, [user?.role])

  function handleExportCsv() {
    const headers = ['Timestamp', 'Actor', 'Role', 'Action', 'Entity']
    const rows = filtered.map((l) => [l.timestamp, l.actor, l.actorRole, l.action, l.entity])
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `testing_agent_audit_log_${user?.role || 'admin'}_${new Date().toISOString().slice(0, 10)}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Audit log CSV exported')
  }

  // Filter logs by search, role, and action
  const filtered = logs.filter((log) => {
    const matchesSearch =
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.entity.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase())

    const matchesRole = roleFilter === 'all' || log.actorRole === roleFilter
    const matchesAction = actionFilter === 'all' || log.action === actionFilter

    return matchesSearch && matchesRole && matchesAction
  })

  // Get distinct actions from available logs for filter dropdown
  const availableActions = Array.from(new Set(logs.map((l) => l.action)))

  function getRoleBadge(role: UserRole) {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
          Admin
        </span>
      )
    }
    if (role === 'qa_lead') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
          QA Lead
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
        QA Employee
      </span>
    )
  }

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
            className="h-10 px-4 text-[13px] font-medium border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 rounded-lg transition-colors gap-1.5"
          >
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />

      {/* Scope Informative Banner */}
      {isAdmin && (
        <div className="bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 rounded-lg p-3.5 text-[12px] flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-purple-900 dark:text-purple-200">
            <ShieldCheck className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400" />
            <span>
              <strong>Organization Audit Trail (Admin Scope):</strong> Full visibility covering all activities across <strong>Admin</strong>, <strong>QA Lead</strong>, and <strong>QA Employee</strong> roles.
            </span>
          </div>
          <span className="text-[11px] font-mono text-purple-700 dark:text-purple-300 font-semibold px-2 py-0.5 bg-purple-100/70 dark:bg-purple-900/40 rounded">
            {filtered.length} entries recorded
          </span>
        </div>
      )}

      {isLead && (
        <div className="bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-lg p-3.5 text-[12px] flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-indigo-900 dark:text-indigo-200">
            <UserCheck className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
            <span>
              <strong>Squad Audit Trail (QA Lead Scope):</strong> Scoped visibility covering all <strong>QA Lead</strong> and <strong>QA Employee</strong> activities in your squad.
            </span>
          </div>
          <span className="text-[11px] font-mono text-indigo-700 dark:text-indigo-300 font-semibold px-2 py-0.5 bg-indigo-100/70 dark:bg-indigo-900/40 rounded">
            {filtered.length} entries recorded
          </span>
        </div>
      )}

      {/* Control Bar: [ Search input ] [ Role filter ▾ ] [ Action filter ▾ ] */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Filter by user, action, or entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full px-3.5 text-[13px] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-[8px] text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#4F46E5] transition-colors"
          />
        </div>

        {/* Role Filter Dropdown */}
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'all' | UserRole)}
            className="h-10 px-3.5 pr-8 text-[13px] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-[8px] text-gray-800 dark:text-neutral-200 focus:outline-none focus:border-[#4F46E5] appearance-none cursor-pointer transition-colors"
          >
            <option value="all">
              {isAdmin ? 'All roles (Admin, Lead, Emp)' : 'All squad roles (Lead, Emp)'}
            </option>
            {isAdmin && <option value="admin">Admin only</option>}
            <option value="qa_lead">QA Lead only</option>
            <option value="qa_engineer">QA Employee only</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        </div>

        {/* Action Filter Dropdown */}
        <div className="relative">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="h-10 px-3.5 pr-8 text-[13px] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-[8px] text-gray-800 dark:text-neutral-200 focus:outline-none focus:border-[#4F46E5] appearance-none cursor-pointer transition-colors"
          >
            <option value="all">All actions ({availableActions.length})</option>
            {availableActions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Audit Log Table Card */}
      <div className="rounded-[8px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-neutral-800 text-[11px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                <th className="text-left py-3.5 px-6 font-semibold">TIMESTAMP</th>
                <th className="text-left py-3.5 px-4 font-semibold">ACTOR</th>
                <th className="text-left py-3.5 px-4 font-semibold">ROLE</th>
                <th className="text-left py-3.5 px-4 font-semibold">ACTION</th>
                <th className="text-left py-3.5 px-4 font-semibold">ENTITY</th>
                <th className="text-right py-3.5 px-6 font-semibold">DIFF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 dark:text-neutral-500 text-[13px]">
                    No audit records match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => {
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

                        {/* Role Badge */}
                        <td className="py-3.5 px-4">
                          {getRoleBadge(log.actorRole)}
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
                            className="inline-flex items-center gap-1 text-[12px] font-medium text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white transition-colors select-none cursor-pointer"
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
                          <td colSpan={6} className="px-6 py-3 border-b border-gray-100 dark:border-neutral-800">
                            <pre className="mono-data text-[12px] text-gray-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 p-3 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-x-auto whitespace-pre leading-relaxed">
                              {log.diffPreview}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
