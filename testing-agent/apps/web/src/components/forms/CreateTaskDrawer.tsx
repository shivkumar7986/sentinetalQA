'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Sparkles } from 'lucide-react'
import { mockClient } from '@/mocks/mockClient'
import type { Website } from '@/mocks/data/websites.mock'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useUIStore } from '@/stores/ui.store'

interface CreateTaskDrawerProps {
  open?: boolean
  onClose?: () => void
  onSuccess?: () => void
}

export function CreateTaskDrawer({
  open: propOpen,
  onClose: propOnClose,
  onSuccess: propOnSuccess,
}: CreateTaskDrawerProps) {
  const router = useRouter()
  const { formDrawer, closeFormDrawer } = useUIStore()
  const isOpen = propOpen !== undefined ? propOpen : formDrawer === 'create-task'
  const handleClose = propOnClose || closeFormDrawer

  const [websites, setWebsites] = useState<Website[]>([])
  const [selectedWebsiteId, setSelectedWebsiteId] = useState('')
  const [title, setTitle] = useState('')
  const [instruction, setInstruction] = useState('')
  const [engine, setEngine] = useState<'ollama' | 'gemini' | 'hybrid'>('ollama')
  const [role, setRole] = useState('Admin')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      mockClient.getWebsites().then((sites) => {
        setWebsites(sites)
        if (sites.length > 0 && !selectedWebsiteId) {
          setSelectedWebsiteId(sites[0].id)
        }
      })
    }
  }, [isOpen, selectedWebsiteId])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) handleClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose])

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !instruction.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const selectedSite = websites.find((w) => w.id === selectedWebsiteId)
      const created = await mockClient.createTask({
        websiteId: selectedWebsiteId,
        websiteName: selectedSite?.name || 'Logistics Portal',
        title,
        instruction,
        role,
        engine,
        status: 'plan_generated',
      })
      toast.success('Task created successfully')
      handleClose()
      if (propOnSuccess) propOnSuccess()
      router.push(`/plans/p-${created.id}`)
    } catch {
      toast.error('Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-[7px] transition-opacity animate-in fade-in duration-200"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div
        className="relative z-10 w-full max-w-[500px] h-screen bg-white dark:bg-[#12151F] border-l border-gray-200 dark:border-neutral-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250 ease-out select-text"
        role="dialog"
        aria-modal="true"
      >
        <form onSubmit={handleSubmit} className="h-full flex flex-col justify-between">
          {/* Header & Fields */}
          <div className="px-8 pt-8 pb-4 space-y-4 overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-1">
              <div>
                <h2 className="text-[20px] font-bold text-gray-900 dark:text-white tracking-tight leading-snug flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#4F46E5]" /> Create testing task
                </h2>
                <p className="text-[13px] text-gray-500 dark:text-neutral-400 mt-0.5">
                  Instruct AI to explore user journeys or validate business invariants.
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

            {/* Target Website */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                Target website
              </label>
              <select
                value={selectedWebsiteId}
                onChange={(e) => setSelectedWebsiteId(e.target.value)}
                className="w-full h-11 px-3.5 text-[14px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
              >
                {websites.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.environment.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Task Title */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                Task title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Verify login and filter active shipments"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-11 px-3.5 text-[14px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
                autoFocus
              />
            </div>

            {/* Natural Language Instructions */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                Natural language instructions
              </label>
              <textarea
                rows={4}
                required
                placeholder="Describe step-by-step what the AI agent should test, what invariants to assert, and edge cases to check..."
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                className="w-full p-3.5 text-[13px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all resize-none"
              />
            </div>

            {/* AI Engine Selector */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                AI Engine
              </label>
              <div className="h-11 flex items-center bg-[#F1F3F5] dark:bg-neutral-800 p-1 rounded-lg border border-transparent dark:border-neutral-700">
                {(
                  [
                    { label: 'Ollama (Local)', value: 'ollama' },
                    { label: 'Gemini (Cloud)', value: 'gemini' },
                    { label: 'Hybrid', value: 'hybrid' },
                  ] as const
                ).map((eng) => {
                  const isSelected = engine === eng.value
                  return (
                    <button
                      key={eng.value}
                      type="button"
                      onClick={() => setEngine(eng.value)}
                      className={cn(
                        'flex-1 h-9 rounded-md text-[12px] font-medium transition-all select-none',
                        isSelected
                          ? 'bg-white dark:bg-neutral-900 text-gray-900 dark:text-white font-semibold shadow-xs'
                          : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                      )}
                    >
                      {eng.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Persona / Role */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                Test persona / Role
              </label>
              <input
                type="text"
                placeholder="e.g. Admin or Dispatcher"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-11 px-3.5 text-[14px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
              />
            </div>
          </div>

          {/* Bottom Actions */}
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
              {loading ? 'Generating...' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
