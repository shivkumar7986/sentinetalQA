'use client'

import React, { useState, useEffect } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { mockClient } from '@/mocks/mockClient'
import type { Website } from '@/mocks/data/websites.mock'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useUIStore } from '@/stores/ui.store'
import { useAuthStore } from '@/stores/auth.store'

interface AddWebsiteDrawerProps {
  open?: boolean
  onClose?: () => void
  onSuccess?: (newSite: Website) => void
}

export function AddWebsiteDrawer({
  open: propOpen,
  onClose: propOnClose,
  onSuccess: propOnSuccess,
}: AddWebsiteDrawerProps) {
  const { formDrawer, closeFormDrawer } = useUIStore()
  const isOpen = propOpen !== undefined ? propOpen : formDrawer === 'add-website'
  const handleClose = propOnClose || closeFormDrawer

  const [name, setName] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [loginUrl, setLoginUrl] = useState('')
  const [environment, setEnvironment] = useState<'dev' | 'staging' | 'qa' | 'production'>('staging')
  const [groupKey, setGroupKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose])

  const { user } = useAuthStore()

  if (!isOpen || user?.role === 'qa_engineer') return null

  const isHttpOnProduction = environment === 'production' && baseUrl.startsWith('http://')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (user?.role === 'qa_engineer') {
      toast.error('Permission Denied', {
        description: 'QA Employees cannot register new websites.',
      })
      handleClose()
      return
    }
    setError('')

    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      setError('Base URL must begin with http:// or https://')
      return
    }

    setLoading(true)
    try {
      const created = await mockClient.createWebsite({
        name,
        baseUrl,
        loginUrl: loginUrl || baseUrl + '/login',
        environment,
        groupKey: groupKey || undefined,
        status: 'active',
      })
      toast.success(`Registered ${created.name}`)
      if (propOnSuccess) propOnSuccess(created)

      // Reset
      setName('')
      setBaseUrl('')
      setLoginUrl('')
      setEnvironment('staging')
      setGroupKey('')
      handleClose()
    } catch (err: any) {
      setError(err.message || 'Failed to register website')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Blurred Backdrop covering entire screen */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-[7px] transition-opacity animate-fade-in"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer Panel - Full Viewport Height without clipping or forced scrollbar */}
      <div
        className="relative z-10 w-full max-w-[500px] h-screen bg-white dark:bg-[#12151F] border-l border-gray-200 dark:border-neutral-800 shadow-2xl flex flex-col justify-between animate-slide-in-right select-text"
        role="dialog"
        aria-modal="true"
      >
        <form onSubmit={handleSubmit} className="h-full flex flex-col justify-between">
          {/* Header & Fields container */}
          <div className="px-8 pt-8 pb-4 space-y-4 overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-1">
              <div>
                <h2 className="text-[20px] font-bold text-gray-900 dark:text-white tracking-tight leading-snug">
                  Add website
                </h2>
                <p className="text-[13px] text-gray-500 dark:text-neutral-400 mt-0.5">
                  Register a target application environment for test planning.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-[6px] p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 text-[12px] text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-[6px]">
                {error}
              </div>
            )}

            {/* Field 1: Website Name */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                Website name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Logistics Portal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3.5 text-[14px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
                autoFocus
              />
            </div>

            {/* Field 2: Base URL */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                Base URL
              </label>
              <input
                type="url"
                required
                placeholder="https://staging.logistics.internal"
                value={baseUrl}
                onChange={(e) => {
                  const url = e.target.value
                  setBaseUrl(url)
                  if (!loginUrl) setLoginUrl(url ? `${url.replace(/\/$/, '')}/login` : '')
                }}
                className="w-full h-11 px-3.5 text-[14px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
              />
            </div>

            {isHttpOnProduction && (
              <div className="flex items-center gap-2 p-2.5 text-[12px] text-amber-700 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-[6px]">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Warning: Production sites should use HTTPS.</span>
              </div>
            )}

            {/* Field 3: Login URL */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                Login URL
              </label>
              <input
                type="url"
                placeholder="https://staging.logistics.internal/login"
                value={loginUrl}
                onChange={(e) => setLoginUrl(e.target.value)}
                className="w-full h-11 px-3.5 text-[14px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
              />
            </div>

            {/* Field 4: Environment Segmented Control */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                Environment
              </label>
              <div className="h-11 flex items-center bg-[#F1F3F5] dark:bg-neutral-800 p-1 rounded-lg border border-transparent dark:border-neutral-700">
                {(
                  [
                    { label: 'Dev', value: 'dev' },
                    { label: 'Staging', value: 'staging' },
                    { label: 'QA', value: 'qa' },
                    { label: 'Prod', value: 'production' },
                  ] as const
                ).map((env) => {
                  const isSelected = environment === env.value
                  return (
                    <button
                      key={env.value}
                      type="button"
                      onClick={() => setEnvironment(env.value)}
                      className={cn(
                        'flex-1 h-9 rounded-md text-[13px] font-medium transition-all select-none',
                        isSelected
                          ? 'bg-white dark:bg-neutral-900 text-gray-900 dark:text-white font-semibold shadow-xs'
                          : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                      )}
                    >
                      {env.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Field 5: Product group (optional) */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                Product group (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Core Logistics Suite"
                value={groupKey}
                onChange={(e) => setGroupKey(e.target.value)}
                className="w-full h-11 px-3.5 text-[14px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
              />
            </div>
          </div>

          {/* Bottom Actions - Exactly matching reference screenshot */}
          <div className="px-8 py-6 flex items-center justify-end gap-3 bg-white dark:bg-[#12151F] shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="h-10 px-5 rounded-lg border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-[13px] font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-10 px-5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium transition-colors shadow-none disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save website'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
