'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  ChevronDown,
  Check,
  X,
  ArrowUpRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StateView } from '@/components/data/StateView'
import { mockClient } from '@/mocks/mockClient'
import type { Website } from '@/mocks/data/websites.mock'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useUIStore } from '@/stores/ui.store'

const ENV_OPTIONS = [
  { label: 'All environments', value: 'all', dot: null },
  { label: 'Production', value: 'production', dot: 'bg-rose-500' },
  { label: 'Staging', value: 'staging', dot: 'bg-sky-500' },
  { label: 'QA', value: 'qa', dot: 'bg-indigo-500' },
  { label: 'Dev', value: 'dev', dot: 'bg-neutral-400' },
]

export default function WebsitesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { formDrawer, openFormDrawer } = useUIStore()
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'active' | 'archived'>('active')
  const [selectedEnv, setSelectedEnv] = useState('All environments')
  const [envOpen, setEnvOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  useEffect(() => {
    loadWebsites()
    if (searchParams.get('new') === 'true') {
      openFormDrawer('add-website')
    }
  }, [searchParams, formDrawer])

  async function loadWebsites() {
    setLoading(true)
    const data = await mockClient.getWebsites()
    setWebsites(data)
    setLoading(false)
  }

  async function handleToggleArchive(site: Website) {
    try {
      if (site.status === 'active') {
        const updated = await mockClient.archiveWebsite(site.id)
        setWebsites((prev) => prev.map((s) => (s.id === site.id ? updated : s)))
        toast.success(`Archived ${site.name}`)
      } else {
        const updated = await mockClient.restoreWebsite(site.id)
        setWebsites((prev) => prev.map((s) => (s.id === site.id ? updated : s)))
        toast.success(`Restored ${site.name}`)
      }
    } catch {
      toast.error('Action failed')
    }
  }

  const filtered = websites.filter((site) => {
    const matchesTab = (site.status || 'active') === tab
    const matchesSearch =
      site.name.toLowerCase().includes(search.toLowerCase()) ||
      site.baseUrl.toLowerCase().includes(search.toLowerCase())
    const matchesEnv =
      selectedEnv === 'All environments' ||
      site.environment.toLowerCase() === selectedEnv.toLowerCase()
    return matchesTab && matchesSearch && matchesEnv
  })

  return (
    <div className="space-y-5 animate-enter">
      {/* Heading Row matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--text)] tracking-tight">Websites</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
            Registered target applications, environment groupings, and AI configuration snapshots.
          </p>
        </div>

        {/* Clicking opens the slide-over drawer modal directly */}
        <Button
          variant="primary"
          size="md"
          type="button"
          onClick={() => openFormDrawer('add-website')}
          className="gap-1.5 font-medium shrink-0 self-start sm:self-auto bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-[8px] px-4 py-2 text-[13px] shadow-none"
        >
          <Plus className="h-4 w-4" /> Add website
        </Button>
      </div>

      {/* Control Bar: [ Active | Archived ]  [ Search ]  [ All environments ▾ ]  -----  [ List | Grid ] */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        {/* Left Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active / Archived Pill Toggle */}
          <div
            className="flex items-center bg-[#F1F3F5] dark:bg-neutral-800 p-0.5 rounded-[6px] border border-transparent dark:border-neutral-700"
            role="tablist"
            aria-label="Filter status"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'active'}
              onClick={() => setTab('active')}
              className={cn(
                'h-7 px-3 text-[12px] font-medium rounded-[4px] transition-colors select-none',
                tab === 'active'
                  ? 'bg-white dark:bg-neutral-900 text-[var(--text)] border border-gray-200/80 dark:border-neutral-700 font-semibold shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              )}
            >
              Active
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'archived'}
              onClick={() => setTab('archived')}
              className={cn(
                'h-7 px-3 text-[12px] font-medium rounded-[4px] transition-colors select-none',
                tab === 'archived'
                  ? 'bg-white dark:bg-neutral-900 text-[var(--text)] border border-gray-200/80 dark:border-neutral-700 font-semibold shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              )}
            >
              Archived
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search name or URL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-full pl-8 pr-3 text-[12px] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-[6px] text-[var(--text)] placeholder:text-gray-400 focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>

          {/* Environment dropdown button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setEnvOpen((v) => !v)}
              className={cn(
                'h-8 px-3 rounded-[6px] bg-white dark:bg-neutral-900 border text-[12px] font-medium text-[var(--text)] flex items-center gap-2 transition-colors select-none',
                envOpen
                  ? 'border-[var(--primary)] ring-2 ring-[var(--ai-ring)]'
                  : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300'
              )}
              aria-haspopup="listbox"
              aria-expanded={envOpen}
            >
              <span>{selectedEnv}</span>
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 text-gray-400 transition-transform duration-150',
                  envOpen && 'rotate-180'
                )}
              />
            </button>

            {envOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setEnvOpen(false)} />
                <div
                  role="listbox"
                  className="absolute left-0 top-full mt-1.5 w-44 rounded-[8px] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 py-1 z-30 shadow-lg"
                >
                  {ENV_OPTIONS.map((opt) => {
                    const isSelected = selectedEnv === opt.label
                    return (
                      <button
                        key={opt.value}
                        role="option"
                        aria-selected={isSelected}
                        type="button"
                        onClick={() => {
                          setSelectedEnv(opt.label)
                          setEnvOpen(false)
                        }}
                        className={cn(
                          'w-full text-left px-3 py-1.5 text-[12px] flex items-center justify-between transition-colors',
                          isSelected
                            ? 'bg-[var(--primary-tint)] text-[var(--primary)] font-semibold'
                            : 'text-[var(--text)] hover:bg-[var(--hover-subtle)]'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {opt.dot ? (
                            <span className={cn('h-2 w-2 rounded-full shrink-0', opt.dot)} />
                          ) : (
                            <span className="h-2 w-2 rounded-full border border-gray-300 dark:border-neutral-600 shrink-0" />
                          )}
                          <span>{opt.label}</span>
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 text-[var(--primary)]" />}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: [ List | Grid ] Segmented Toggle */}
        <div className="flex items-center bg-[#F1F3F5] dark:bg-neutral-800 p-0.5 rounded-[6px] border border-transparent dark:border-neutral-700 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={cn(
              'h-7 px-3 text-[12px] font-medium rounded-[4px] transition-colors select-none',
              viewMode === 'list'
                ? 'bg-white dark:bg-neutral-900 text-[var(--text)] border border-gray-200/80 dark:border-neutral-700 font-semibold shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            )}
          >
            List
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={cn(
              'h-7 px-3 text-[12px] font-medium rounded-[4px] transition-colors select-none',
              viewMode === 'grid'
                ? 'bg-white dark:bg-neutral-900 text-[var(--text)] border border-gray-200/80 dark:border-neutral-700 font-semibold shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            )}
          >
            Grid
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <StateView
        isLoading={loading}
        isEmpty={filtered.length === 0}
        emptyMessage={
          tab === 'archived'
            ? 'No archived websites found.'
            : 'No websites match your filter criteria.'
        }
        emptyAction={
          tab === 'active' ? (
            <Button variant="primary" size="sm" onClick={() => openFormDrawer('add-website')}>
              Register a Website
            </Button>
          ) : undefined
        }
      >
        {viewMode === 'list' ? (
          /* Table View matching screenshot 1:1 */
          <div className="rounded-[8px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-neutral-800 text-[11px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                    <th className="text-left py-3.5 px-6 font-semibold">WEBSITE</th>
                    <th className="text-left py-3.5 px-4 font-semibold">ENVIRONMENT</th>
                    <th className="text-left py-3.5 px-4 font-semibold">LAST RUN</th>
                    <th className="text-left py-3.5 px-4 font-semibold">TASKS</th>
                    <th className="text-left py-3.5 px-4 font-semibold">UPDATED</th>
                    <th className="text-right py-3.5 px-6 font-semibold">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/80">
                  {filtered.map((site) => (
                    <tr key={site.id} className="hover:bg-gray-50/70 dark:hover:bg-neutral-800/40 transition-colors">
                      {/* Website Name & URL */}
                      <td className="py-3.5 px-6">
                        <Link
                          href={`/websites/${site.id}`}
                          className="font-semibold text-[13px] text-gray-900 dark:text-white hover:text-[var(--primary)] transition-colors block leading-snug"
                        >
                          {site.name}
                        </Link>
                        <a
                          href={site.baseUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mono-data text-[12px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 inline-flex items-center gap-1 mt-0.5 transition-colors"
                        >
                          <span>{site.baseUrl}</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </a>
                      </td>

                      {/* Environment Badge */}
                      <td className="py-3.5 px-4">
                        {site.environment === 'staging' && (
                          <span className="mono-data text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-[4px] bg-[#E0F2FE] text-[#0284C7] dark:bg-sky-950/40 dark:text-sky-400">
                            STAGING
                          </span>
                        )}
                        {site.environment === 'qa' && (
                          <span className="mono-data text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-[4px] bg-[#EEF2FF] text-[#4F46E5] dark:bg-indigo-950/40 dark:text-indigo-400">
                            QA
                          </span>
                        )}
                        {site.environment === 'production' && (
                          <span className="mono-data text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-[4px] bg-[#FFE4E6] text-[#E11D48] dark:bg-rose-950/40 dark:text-rose-400">
                            PRODUCTION
                          </span>
                        )}
                        {site.environment === 'dev' && (
                          <span className="mono-data text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-[4px] bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400">
                            DEV
                          </span>
                        )}
                      </td>

                      {/* Last Run Status */}
                      <td className="py-3.5 px-4">
                        {site.lastRunStatus === 'passed' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#DCFCE7] text-[#16A34A] dark:bg-emerald-950/40 dark:text-emerald-400">
                            <Check className="h-3 w-3 stroke-[2.5]" /> Passed
                          </span>
                        )}
                        {site.lastRunStatus === 'failed' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#FEE2E2] text-[#DC2626] dark:bg-rose-950/40 dark:text-rose-400">
                            <X className="h-3 w-3 stroke-[2.5]" /> Failed
                          </span>
                        )}
                        {site.lastRunStatus === 'running' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#E0F2FE] text-[#0284C7] dark:bg-sky-950/40 dark:text-sky-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#0284C7] animate-pulse" /> Running
                          </span>
                        )}
                        {!site.lastRunStatus && (
                          <span className="text-[12px] text-gray-400">—</span>
                        )}
                      </td>

                      {/* Tasks count */}
                      <td className="py-3.5 px-4 mono-data font-medium text-[13px] text-gray-800 dark:text-neutral-200">
                        {site.taskCount}
                      </td>

                      {/* Updated */}
                      <td className="py-3.5 px-4 mono-data text-[12px] text-gray-500 dark:text-neutral-400">
                        {site.updatedAtLabel || 'Recently'}
                      </td>

                      {/* Actions: Configure & Archive */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            asChild
                            className="h-8 px-3 text-[12px] font-medium border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 rounded-[6px]"
                          >
                            <Link href={`/websites/${site.id}/config`}>Configure</Link>
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleToggleArchive(site)}
                            className="h-8 px-3 text-[12px] font-medium border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 rounded-[6px]"
                          >
                            {site.status === 'archived' ? 'Restore' : 'Archive'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((site) => (
              <div
                key={site.id}
                className="p-4 rounded-[8px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between hover:border-gray-300 dark:hover:border-neutral-700 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <Link
                      href={`/websites/${site.id}`}
                      className="font-semibold text-[14px] text-gray-900 dark:text-white hover:text-[var(--primary)] transition-colors leading-snug"
                    >
                      {site.name}
                    </Link>
                    {site.environment === 'staging' && (
                      <span className="mono-data text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-[4px] bg-[#E0F2FE] text-[#0284C7] dark:bg-sky-950/40 dark:text-sky-400">
                        STAGING
                      </span>
                    )}
                    {site.environment === 'qa' && (
                      <span className="mono-data text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-[4px] bg-[#EEF2FF] text-[#4F46E5] dark:bg-indigo-950/40 dark:text-indigo-400">
                        QA
                      </span>
                    )}
                    {site.environment === 'production' && (
                      <span className="mono-data text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-[4px] bg-[#FFE4E6] text-[#E11D48] dark:bg-rose-950/40 dark:text-rose-400">
                        PRODUCTION
                      </span>
                    )}
                  </div>

                  <a
                    href={site.baseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mono-data text-[12px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 inline-flex items-center gap-1 mb-4 truncate"
                  >
                    <span>{site.baseUrl}</span>
                    <ArrowUpRight className="h-3 w-3 shrink-0" />
                  </a>

                  <div className="flex items-center justify-between text-[12px] text-gray-500 dark:text-neutral-400 py-2 border-t border-gray-100 dark:border-neutral-800">
                    <span>
                      Tasks: <b className="mono-data text-gray-900 dark:text-white">{site.taskCount}</b>
                    </span>
                    {site.lastRunStatus === 'passed' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#DCFCE7] text-[#16A34A] dark:bg-emerald-950/40 dark:text-emerald-400">
                        <Check className="h-3 w-3" /> Passed
                      </span>
                    )}
                    {site.lastRunStatus === 'failed' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FEE2E2] text-[#DC2626] dark:bg-rose-950/40 dark:text-rose-400">
                        <X className="h-3 w-3" /> Failed
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-end gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    asChild
                    className="h-8 px-3 text-[12px] font-medium border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-200 rounded-[6px]"
                  >
                    <Link href={`/websites/${site.id}/config`}>Configure</Link>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleToggleArchive(site)}
                    className="h-8 px-3 text-[12px] font-medium border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-200 rounded-[6px]"
                  >
                    {site.status === 'archived' ? 'Restore' : 'Archive'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </StateView>
    </div>
  )
}
