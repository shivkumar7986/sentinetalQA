'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  Trash2,
  Edit,
  Shield,
  RotateCcw,
  ChevronDown,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StateView } from '@/components/data/StateView'
import { Switch } from '@/components/ui/switch'
import { mockClient } from '@/mocks/mockClient'
import type { Website } from '@/mocks/data/websites.mock'
import type {
  FullWebsiteConfig,
  WebsiteRole,
  WebsiteModule,
  BusinessRule,
  MaskedCredential,
  ConfigVersion,
} from '@/mocks/data/configs.mock'
import { useUIStore } from '@/stores/ui.store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function WebsiteConfigPage({ params }: { params: { id: string } }) {
  const { openFormDrawer } = useUIStore()
  const [website, setWebsite] = useState<Website | null>(null)
  const [config, setConfig] = useState<FullWebsiteConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<
    'roles' | 'modules' | 'auth' | 'rules' | 'instructions' | 'credentials' | 'versions'
  >('roles')

  // Version note state
  const [versionNote, setVersionNote] = useState('')

  // Expanded diff states in versions tab
  const [expandedDiffs, setExpandedDiffs] = useState<Record<number, boolean>>({
    4: true, // v4 diff visible by default as per screenshot
  })

  // Instructions text state
  const [instructionsText, setInstructionsText] = useState('')

  useEffect(() => {
    loadConfig()
  }, [params.id])

  async function loadConfig() {
    setLoading(true)
    const [data, site] = await Promise.all([
      mockClient.getConfigByWebsiteId(params.id),
      mockClient.getWebsiteById(params.id),
    ])
    setConfig(data)
    setWebsite(site)
    if (data?.customInstructions) {
      setInstructionsText(data.customInstructions)
    }
    setLoading(false)
  }

  async function handleSaveSection(sectionName: string) {
    if (!config) return
    const note = versionNote || `Updated ${sectionName} mapping`
    toast.success(`Saved ${sectionName} (snapshot noted: "${note}")`)
    setVersionNote('')
  }

  function toggleRule(id: string) {
    if (!config) return
    setConfig({
      ...config,
      businessRules: config.businessRules.map((r) =>
        r.id === id ? { ...r, isActive: !r.isActive } : r
      ),
    })
  }

  function handleDeleteRule(id: string) {
    if (!config) return
    setConfig({
      ...config,
      businessRules: config.businessRules.filter((r) => r.id !== id),
    })
    toast.success('Removed business rule')
  }

  function handleAddRule() {
    const text = prompt('Enter invariant rule description:')
    if (!text || !config) return
    const newRule: BusinessRule = {
      id: `rule-${Date.now()}`,
      text,
      tag: 'Custom',
      priority: 'P2',
      isActive: true,
    }
    setConfig({
      ...config,
      businessRules: [...config.businessRules, newRule],
    })
    toast.success('Added business rule')
  }

  function handleAddRole() {
    const name = prompt('Enter role name:')
    if (!name || !config) return
    const newRole: WebsiteRole = {
      id: `role-${Date.now()}`,
      name,
      description: 'Custom user persona for test execution',
      landingPath: '/dashboard',
      allowedModules: ['Dashboard'],
    }
    setConfig({
      ...config,
      roles: [...config.roles, newRole],
    })
    toast.success(`Added role "${name}"`)
  }

  function handleAddModule() {
    const name = prompt('Enter module name:')
    if (!name || !config) return
    const newMod: WebsiteModule = {
      id: `mod-${Date.now()}`,
      name,
      path: `/${name.toLowerCase().replace(/\s+/g, '-')}`,
      expectedHeading: `${name} Overview`,
      navigationPath: 'Direct URL',
    }
    setConfig({
      ...config,
      modules: [...config.modules, newMod],
    })
    toast.success(`Added module "${name}"`)
  }

  function handleAddCredential() {
    const username = prompt('Enter username / email for credential:')
    if (!username || !config) return
    const newCred: MaskedCredential = {
      roleId: `role-${Date.now()}`,
      roleName: 'Dispatcher',
      usernameMasked: username,
      secretMasked: '••••••••••••',
      hasPassword: true,
      lastUpdated: 'Just now',
    }
    setConfig({
      ...config,
      credentials: [...config.credentials, newCred],
    })
    toast.success(`Saved credential for ${username}`)
  }

  function handleRestoreVersion(v: ConfigVersion) {
    toast.success(`Restored configuration to v${v.version} ("${v.title}")`)
  }

  if (loading) {
    return <StateView isLoading={true} skeletonCount={5}><div /></StateView>
  }

  if (!config) {
    return (
      <div className="py-16 text-center text-[var(--text-muted)]">
        Configuration not found.
      </div>
    )
  }

  const tabsList = [
    { id: 'roles', label: 'Roles', count: config.roles.length },
    { id: 'modules', label: 'Modules', count: config.modules.length },
    { id: 'auth', label: 'Auth flow', count: null },
    { id: 'rules', label: 'Business rules', count: config.businessRules.length },
    { id: 'instructions', label: 'Instructions', count: null },
    { id: 'credentials', label: 'Credentials', count: config.credentials.length },
    { id: 'versions', label: 'Versions', count: config.versions.length },
  ] as const

  return (
    <div className="space-y-6 animate-enter">
      {/* Top Header matching user screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[22px] font-bold text-gray-900 dark:text-white tracking-tight">
              {website?.name || 'Logistics Portal'} · Configuration
            </h1>
            <span className="mono-data text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px] bg-[#E0F2FE] text-[#0284C7] dark:bg-sky-950/40 dark:text-sky-400">
              {website?.environment ? website.environment.toUpperCase() : 'STAGING'}
            </span>
          </div>
          <p className="mono-data text-[12px] text-gray-500 dark:text-neutral-400 mt-1">
            {website?.baseUrl || 'https://staging.logistics.internal'} · Context injected into Ollama & Gemini planners
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="md"
            asChild
            className="h-9 px-3.5 text-[13px] font-medium border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
          >
            <Link href={`/websites/${params.id}`}>
              ← Overview
            </Link>
          </Button>
          <Button
            variant="primary"
            size="md"
            type="button"
            onClick={() => openFormDrawer('create-task')}
            className="gap-1.5 font-medium bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg px-4 py-2 text-[13px] shadow-none h-9"
          >
            <Sparkles className="h-4 w-4" /> Create task
          </Button>
        </div>
      </div>

      {/* 7 Tabs Navigation Row matching screenshots */}
      <div className="flex items-center gap-6 border-b border-gray-200 dark:border-neutral-800 text-[13px] overflow-x-auto">
        {tabsList.map((t) => {
          const isActive = activeTab === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={cn(
                'flex items-center gap-1.5 pb-2.5 font-medium transition-colors select-none whitespace-nowrap cursor-pointer',
                isActive
                  ? 'text-gray-900 dark:text-white font-semibold border-b-2 border-[#4F46E5] -mb-[1px]'
                  : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <span>{t.label}</span>
              {t.count !== null && (
                <span className="text-[11px] font-medium text-gray-500 dark:text-neutral-400 bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.2 rounded-full">
                  {t.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* TAB 1: ROLES */}
      {activeTab === 'roles' && (
        <div className="rounded-[8px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-none">
          {/* Card Header */}
          <div className="p-6 pb-5 flex items-start justify-between border-b border-gray-100 dark:border-neutral-800">
            <div>
              <h2 className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight">
                Website User Roles
              </h2>
              <p className="text-[13px] text-gray-500 dark:text-neutral-400 mt-0.5">
                Application roles tested by the AI agent (separate from platform roles).
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddRole}
              className="h-8 px-3.5 text-[12px] font-medium bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-[6px] transition-colors shadow-none"
            >
              + Add role
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-neutral-800 text-[11px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                  <th className="text-left py-3.5 px-6 font-semibold">ROLE</th>
                  <th className="text-left py-3.5 px-4 font-semibold">DESCRIPTION</th>
                  <th className="text-left py-3.5 px-4 font-semibold">LANDING PATH</th>
                  <th className="text-left py-3.5 px-4 font-semibold">ALLOWED MODULES</th>
                  <th className="text-right py-3.5 px-6 font-semibold">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/80">
                {config.roles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50/70 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-gray-900 dark:text-white">
                      {role.name}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-neutral-300">
                      {role.description}
                    </td>
                    <td className="py-3.5 px-4 mono-data text-gray-800 dark:text-neutral-200">
                      {role.landingPath}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-neutral-300">
                      {Array.isArray(role.allowedModules) ? role.allowedModules.join(', ') : role.allowedModules}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="h-7 px-3 text-[12px] font-medium border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 rounded-[4px]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="h-7 px-3 text-[12px] font-medium border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-neutral-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 rounded-[4px]"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Version Note Bar */}
          <div className="p-4 px-6 border-t border-gray-100 dark:border-neutral-800 flex items-center gap-3 bg-white dark:bg-neutral-900">
            <input
              type="text"
              placeholder="Version note (e.g. Updated roles mapping)..."
              value={versionNote}
              onChange={(e) => setVersionNote(e.target.value)}
              className="flex-1 h-10 px-3.5 text-[13px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#4F46E5] transition-colors"
            />
            <button
              type="button"
              onClick={() => handleSaveSection('roles')}
              className="h-10 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium transition-colors shadow-none shrink-0"
            >
              Save roles
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: MODULES */}
      {activeTab === 'modules' && (
        <div className="rounded-[8px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-none">
          {/* Card Header */}
          <div className="p-6 pb-5 flex items-start justify-between border-b border-gray-100 dark:border-neutral-800">
            <div>
              <h2 className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight">
                Application Modules & Routes
              </h2>
              <p className="text-[13px] text-gray-500 dark:text-neutral-400 mt-0.5">
                Routes, expected headings, key selectors, and navigation paths.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddModule}
              className="h-8 px-3.5 text-[12px] font-medium bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-[6px] transition-colors shadow-none"
            >
              + Add module
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-neutral-800 text-[11px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                  <th className="text-left py-3.5 px-6 font-semibold">MODULE</th>
                  <th className="text-left py-3.5 px-4 font-semibold">ROUTE</th>
                  <th className="text-left py-3.5 px-4 font-semibold">EXPECTED HEADING</th>
                  <th className="text-left py-3.5 px-4 font-semibold">NAVIGATION PATH</th>
                  <th className="text-right py-3.5 px-6 font-semibold">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/80">
                {config.modules.map((mod) => (
                  <tr key={mod.id} className="hover:bg-gray-50/70 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-gray-900 dark:text-white">
                      {mod.name}
                    </td>
                    <td className="py-3.5 px-4 mono-data text-gray-800 dark:text-neutral-200">
                      {mod.path}
                    </td>
                    <td className="py-3.5 px-4 mono-data text-gray-600 dark:text-neutral-400">
                      {mod.expectedHeading || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-neutral-300">
                      {mod.navigationPath || (mod.navPath ? mod.navPath.join(' → ') : 'Direct URL')}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="h-7 px-3 text-[12px] font-medium border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 rounded-[4px]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="h-7 px-3 text-[12px] font-medium border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-neutral-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 rounded-[4px]"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Version Note Bar */}
          <div className="p-4 px-6 border-t border-gray-100 dark:border-neutral-800 flex items-center gap-3 bg-white dark:bg-neutral-900">
            <input
              type="text"
              placeholder="Version note (e.g. Updated modules mapping)..."
              value={versionNote}
              onChange={(e) => setVersionNote(e.target.value)}
              className="flex-1 h-10 px-3.5 text-[13px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#4F46E5] transition-colors"
            />
            <button
              type="button"
              onClick={() => handleSaveSection('modules')}
              className="h-10 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium transition-colors shadow-none shrink-0"
            >
              Save modules
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: AUTH FLOW */}
      {activeTab === 'auth' && (
        <div className="rounded-[8px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-none">
          {/* Card Header */}
          <div className="p-6 pb-5 border-b border-gray-100 dark:border-neutral-800">
            <h2 className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight">
              Authentication Flow
            </h2>
            <p className="text-[13px] text-gray-500 dark:text-neutral-400 mt-0.5">
              Defines how the runner signs in and verifies session establishment.
            </p>
          </div>

          {/* Form Fields matching screenshot */}
          <div className="p-6 space-y-5">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                  Auth method
                </label>
                <div className="relative">
                  <select
                    defaultValue="Form login (Email / Password)"
                    className="w-full h-10 px-3.5 pr-8 text-[13px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#4F46E5] appearance-none cursor-pointer transition-colors"
                  >
                    <option value="Form login (Email / Password)">
                      Form login (Email / Password)
                    </option>
                    <option value="SSO OAuth 2.0 / OIDC">SSO OAuth 2.0 / OIDC</option>
                    <option value="Bearer API Token">Bearer API Token</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                  Post-login redirect target
                </label>
                <input
                  type="text"
                  defaultValue={config.authFlow.redirectTarget || '/dashboard'}
                  className="w-full h-10 px-3.5 text-[13px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#4F46E5] transition-colors"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                  Username field name
                </label>
                <input
                  type="text"
                  defaultValue={config.authFlow.usernameSelector || 'email'}
                  className="w-full h-10 px-3.5 text-[13px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#4F46E5] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                  Password field name
                </label>
                <input
                  type="text"
                  defaultValue={config.authFlow.passwordSelector || 'password'}
                  className="w-full h-10 px-3.5 text-[13px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#4F46E5] transition-colors"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                  Success indicator
                </label>
                <input
                  type="text"
                  defaultValue={config.authFlow.successIndicatorSelector || 'Set-Cookie: sid + HTTP 200'}
                  className="w-full h-10 px-3.5 text-[13px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#4F46E5] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                  Expected failure message
                </label>
                <input
                  type="text"
                  defaultValue={config.authFlow.failureMessageSelector || 'Invalid credentials. Please try again.'}
                  className="w-full h-10 px-3.5 text-[13px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#4F46E5] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Bottom Version Note Bar */}
          <div className="p-4 px-6 border-t border-gray-100 dark:border-neutral-800 flex items-center gap-3 bg-white dark:bg-neutral-900">
            <input
              type="text"
              placeholder="Version note (e.g. Updated auth flow mapping)..."
              value={versionNote}
              onChange={(e) => setVersionNote(e.target.value)}
              className="flex-1 h-10 px-3.5 text-[13px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#4F46E5] transition-colors"
            />
            <button
              type="button"
              onClick={() => handleSaveSection('auth flow')}
              className="h-10 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium transition-colors shadow-none shrink-0"
            >
              Save auth flow
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: BUSINESS RULES */}
      {activeTab === 'rules' && (
        <div className="rounded-[8px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-none">
          {/* Card Header */}
          <div className="p-6 pb-5 flex items-start justify-between border-b border-gray-100 dark:border-neutral-800">
            <div>
              <h2 className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight">
                Business Rules
              </h2>
              <p className="text-[13px] text-gray-500 dark:text-neutral-400 mt-0.5">
                Domain invariants verified during plan generation and content assertions.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddRule}
              className="h-8 px-3.5 text-[12px] font-medium bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-[6px] transition-colors shadow-none"
            >
              + Add rule
            </button>
          </div>

          {/* Rules List Container */}
          <div className="p-6 space-y-3">
            {config.businessRules.map((rule) => (
              <div
                key={rule.id}
                className={cn(
                  'p-3.5 rounded-lg border flex items-center justify-between gap-4 transition-colors',
                  rule.isActive
                    ? 'border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                    : 'border-gray-100 dark:border-neutral-800 bg-gray-50/60 dark:bg-neutral-900/40 opacity-70'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Priority Badge */}
                  {rule.priority === 'P1' || rule.priority === 'high' ? (
                    <span className="mono-data text-[11px] font-bold px-2 py-0.5 rounded-[4px] bg-[#FEE2E2] text-[#DC2626] dark:bg-rose-950/40 dark:text-rose-400 shrink-0">
                      P1
                    </span>
                  ) : (
                    <span className="mono-data text-[11px] font-bold px-2 py-0.5 rounded-[4px] bg-[#FEF3C7] text-[#D97706] dark:bg-amber-950/40 dark:text-amber-400 shrink-0">
                      P2
                    </span>
                  )}

                  {/* Rule Text */}
                  <span
                    className={cn(
                      'text-[13px] text-gray-900 dark:text-white truncate',
                      !rule.isActive && 'line-through text-gray-400 dark:text-neutral-500'
                    )}
                  >
                    {rule.text}
                  </span>

                  {/* Tag Pill */}
                  {rule.tag && (
                    <span className="text-[11px] text-gray-500 dark:text-neutral-400 bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full shrink-0">
                      {rule.tag}
                    </span>
                  )}
                </div>

                {/* Right controls: Switch + Delete */}
                <div className="flex items-center gap-3 shrink-0">
                  <Switch
                    checked={rule.isActive}
                    onCheckedChange={() => toggleRule(rule.id)}
                    className="data-[state=checked]:bg-[#4F46E5]"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteRule(rule.id)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
                    title="Delete rule"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Version Note Bar */}
          <div className="p-4 px-6 border-t border-gray-100 dark:border-neutral-800 flex items-center gap-3 bg-white dark:bg-neutral-900">
            <input
              type="text"
              placeholder="Version note (e.g. Updated business rules mapping)..."
              value={versionNote}
              onChange={(e) => setVersionNote(e.target.value)}
              className="flex-1 h-10 px-3.5 text-[13px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#4F46E5] transition-colors"
            />
            <button
              type="button"
              onClick={() => handleSaveSection('business rules')}
              className="h-10 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium transition-colors shadow-none shrink-0"
            >
              Save business rules
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: INSTRUCTIONS */}
      {activeTab === 'instructions' && (
        <div className="rounded-[8px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-none">
          {/* Card Header */}
          <div className="p-6 pb-5 border-b border-gray-100 dark:border-neutral-800">
            <h2 className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight">
              Custom AI Instructions
            </h2>
            <p className="text-[13px] text-gray-500 dark:text-neutral-400 mt-0.5">
              Appended directly to the system prompt for Ollama and Gemini.
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                System instructions
              </label>
              <span className="mono-data text-[12px] text-gray-400">
                {instructionsText.length} / 2000
              </span>
            </div>

            <textarea
              rows={5}
              value={instructionsText}
              onChange={(e) => setInstructionsText(e.target.value)}
              placeholder="Enter instructions appended directly to all AI agent reasoning loops..."
              className="w-full p-3.5 text-[13px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#4F46E5] transition-colors resize-none leading-relaxed"
            />

            {/* Quick Insert Examples */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[12px]">
              <span className="text-gray-500 dark:text-neutral-400">Insert example:</span>
              <button
                type="button"
                onClick={() =>
                  setInstructionsText(
                    (prev) => prev + ' Ignore cookie consent banners.'
                  )
                }
                className="px-2.5 py-1 rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-50 transition-colors"
              >
                + Ignore cookie banners
              </button>
              <button
                type="button"
                onClick={() =>
                  setInstructionsText(
                    (prev) => prev + ' Wait for Tracking table hydration before asserting.'
                  )
                }
                className="px-2.5 py-1 rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-50 transition-colors"
              >
                + Wait for async hydration
              </button>
              <button
                type="button"
                onClick={() =>
                  setInstructionsText(
                    (prev) => prev + ' Read-only assertions only.'
                  )
                }
                className="px-2.5 py-1 rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-50 transition-colors"
              >
                + Read-only assertions
              </button>
            </div>
          </div>

          {/* Bottom Version Note Bar */}
          <div className="p-4 px-6 border-t border-gray-100 dark:border-neutral-800 flex items-center gap-3 bg-white dark:bg-neutral-900">
            <input
              type="text"
              placeholder="Version note (e.g. Updated instructions mapping)..."
              value={versionNote}
              onChange={(e) => setVersionNote(e.target.value)}
              className="flex-1 h-10 px-3.5 text-[13px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#4F46E5] transition-colors"
            />
            <button
              type="button"
              onClick={() => handleSaveSection('instructions')}
              className="h-10 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium transition-colors shadow-none shrink-0"
            >
              Save instructions
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: CREDENTIALS */}
      {activeTab === 'credentials' && (
        <div className="rounded-[8px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-none">
          {/* Card Header */}
          <div className="p-6 pb-5 flex items-start justify-between border-b border-gray-100 dark:border-neutral-800">
            <div>
              <h2 className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight">
                Role Credentials
              </h2>
              <p className="text-[13px] text-gray-500 dark:text-neutral-400 mt-0.5">
                Encrypted per website role; decrypted only inside execution workers.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddCredential}
              className="h-8 px-3.5 text-[12px] font-medium bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-[6px] transition-colors shadow-none"
            >
              + Add credential
            </button>
          </div>

          {/* Notice Banner matching screenshot */}
          <div className="mx-6 mt-4 p-3 rounded-lg bg-[#EEF2FF]/60 dark:bg-indigo-950/30 border border-[#4F46E5]/20 flex items-center gap-2.5 text-[12px] text-gray-700 dark:text-gray-300">
            <span className="text-[14px]">🛡</span>
            <span>
              <b className="font-semibold text-gray-900 dark:text-white">Never sent to AI:</b>{' '}
              Stored credentials are masked in the UI, redacted from logs, and stripped out of all Ollama and Gemini prompt packages.
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-neutral-800 text-[11px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                  <th className="text-left py-3.5 px-6 font-semibold">ROLE</th>
                  <th className="text-left py-3.5 px-4 font-semibold">USERNAME / EMAIL</th>
                  <th className="text-left py-3.5 px-4 font-semibold">SECRET</th>
                  <th className="text-left py-3.5 px-4 font-semibold">ROTATED</th>
                  <th className="text-right py-3.5 px-6 font-semibold">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/80">
                {config.credentials.map((cred) => (
                  <tr key={cred.roleId} className="hover:bg-gray-50/70 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-gray-900 dark:text-white">
                      {cred.roleName}
                    </td>
                    <td className="py-3.5 px-4 mono-data text-gray-700 dark:text-neutral-300">
                      {cred.usernameMasked}
                    </td>
                    <td className="py-3.5 px-4 mono-data text-gray-400">
                      {cred.secretMasked || '••••••••••••'}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 dark:text-neutral-400">
                      {cred.lastUpdated}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="h-7 px-3 text-[12px] font-medium border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 rounded-[4px]"
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          className="h-7 px-3 text-[12px] font-medium border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-neutral-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 rounded-[4px]"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Version Note Bar */}
          <div className="p-4 px-6 border-t border-gray-100 dark:border-neutral-800 flex items-center gap-3 bg-white dark:bg-neutral-900">
            <input
              type="text"
              placeholder="Version note (e.g. Updated credentials mapping)..."
              value={versionNote}
              onChange={(e) => setVersionNote(e.target.value)}
              className="flex-1 h-10 px-3.5 text-[13px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#4F46E5] transition-colors"
            />
            <button
              type="button"
              onClick={() => handleSaveSection('credentials')}
              className="h-10 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium transition-colors shadow-none shrink-0"
            >
              Save credentials
            </button>
          </div>
        </div>
      )}

      {/* TAB 7: VERSIONS */}
      {activeTab === 'versions' && (
        <div className="rounded-[8px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-none p-6 space-y-6">
          {/* Card Header */}
          <div>
            <h2 className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight">
              Configuration Version History
            </h2>
            <p className="text-[13px] text-gray-500 dark:text-neutral-400 mt-0.5">
              Every task locks the exact config snapshot version used at generation time.
            </p>
          </div>

          {/* Vertical Timeline List */}
          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-200 dark:before:bg-neutral-800">
            {config.versions.map((ver) => {
              const isDiffVisible = expandedDiffs[ver.version] || false
              const isActive = ver.isActive || ver.version === 4

              return (
                <div key={ver.version} className="relative">
                  {/* Timeline dot */}
                  <span
                    className={cn(
                      'absolute -left-[21px] top-4.5 h-2 w-2 rounded-full ring-4 ring-white dark:ring-neutral-900',
                      isActive ? 'bg-[#4F46E5]' : 'bg-gray-300 dark:bg-neutral-700'
                    )}
                  />

                  {/* Version Item Card */}
                  <div className="p-4 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {/* Version tag badge */}
                        <span
                          className={cn(
                            'mono-data text-[11px] font-bold px-2 py-0.5 rounded-[4px] border shrink-0',
                            isActive
                              ? 'border-[#4F46E5]/40 text-[#4F46E5] bg-[#EEF2FF] dark:bg-indigo-950/40'
                              : 'border-gray-200 text-gray-500 bg-gray-50 dark:bg-neutral-800 dark:text-neutral-400'
                          )}
                        >
                          v{ver.version}
                        </span>

                        <div>
                          <h3 className="font-bold text-[13px] text-gray-900 dark:text-white leading-snug">
                            {ver.title || ver.summary}
                          </h3>
                          <p className="text-[12px] text-gray-500 dark:text-neutral-400 mt-0.5">
                            {ver.author} · {ver.category || 'General'} · {ver.createdAt}
                          </p>
                        </div>
                      </div>

                      {/* Right actions */}
                      <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                        {ver.diff && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedDiffs((prev) => ({
                                ...prev,
                                [ver.version]: !prev[ver.version],
                              }))
                            }
                            className="h-8 px-3 text-[12px] font-medium border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 rounded-[6px] transition-colors"
                          >
                            {isDiffVisible ? 'Hide diff' : 'View diff'}
                          </button>
                        )}

                        {isActive ? (
                          <span className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-400 px-2">
                            Active
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRestoreVersion(ver)}
                            className="h-8 px-3 text-[12px] font-medium border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 rounded-[6px] transition-colors flex items-center gap-1.5"
                          >
                            <RotateCcw className="h-3 w-3" /> Restore
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Diff Viewer */}
                    {isDiffVisible && ver.diff && (
                      <div className="mt-3 p-3 rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50/70 dark:bg-neutral-800/40 font-mono text-[12px] text-gray-700 dark:text-neutral-300 whitespace-pre leading-relaxed">
                        {ver.diff}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
