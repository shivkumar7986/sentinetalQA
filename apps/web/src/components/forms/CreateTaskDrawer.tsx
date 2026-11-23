'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Sparkles, Lock } from 'lucide-react'
import { mockClient } from '@/mocks/mockClient'
import type { Website } from '@/mocks/data/websites.mock'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useUIStore } from '@/stores/ui.store'
import { Button } from '@/components/ui/button'

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
  const { formDrawer, formDrawerData, closeFormDrawer } = useUIStore()
  const isOpen = propOpen !== undefined ? propOpen : formDrawer === 'create-task'
  const handleClose = propOnClose || closeFormDrawer

  const [websites, setWebsites] = useState<Website[]>([])
  const [selectedWebsiteId, setSelectedWebsiteId] = useState('')
  const [title, setTitle] = useState('')
  const [instruction, setInstruction] = useState('')
  const [priority, setPriority] = useState<'P0' | 'P1' | 'P2' | 'P3'>('P1')
  const [engine, setEngine] = useState<'ollama' | 'gemini' | 'hybrid'>('ollama')
  const [role, setRole] = useState('Admin')
  const [loading, setLoading] = useState(false)

  const isWebsiteLocked = Boolean(formDrawerData?.websiteId)

  useEffect(() => {
    if (isOpen) {
      if (formDrawerData?.websiteId) {
        setSelectedWebsiteId(formDrawerData.websiteId)
      }
      mockClient.getWebsites().then((sites) => {
        setWebsites(sites)
        if (formDrawerData?.websiteId) {
          setSelectedWebsiteId(formDrawerData.websiteId)
        } else if (sites.length > 0 && !selectedWebsiteId) {
          setSelectedWebsiteId(sites[0].id)
        }
      })
    }
  }, [isOpen, formDrawerData])

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
        prompt: instruction,
        priority,
        role,
        roleName: role,
        engine,
        engineDisplay: `${engine}/qwen2.5:14b`,
        status: 'draft',
      })
      toast.success('Task created successfully')
      handleClose()
      if (propOnSuccess) propOnSuccess()
      router.push(`/tasks/${created.id}`)
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
        className="fixed inset-0 bg-black/45 backdrop-blur-[7px] transition-opacity animate-fade-in"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div
        className="relative z-10 w-full max-w-[500px] h-screen bg-[var(--surface)] border-l border-[var(--border)] shadow-2xl flex flex-col justify-between animate-slide-in-right select-text"
        role="dialog"
        aria-modal="true"
      >
        <form onSubmit={handleSubmit} className="h-full flex flex-col justify-between">
          {/* Header & Fields */}
          <div className="px-8 pt-8 pb-4 space-y-4 overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-1">
              <div>
                <h2 className="text-[20px] font-bold text-[var(--text)] tracking-tight leading-snug flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#4F46E5]" /> Create testing task
                </h2>
                <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
                  Instruct AI to explore user journeys or validate business invariants.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-[6px] p-1 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Target Website */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-[13px] font-medium text-[var(--text)]">
                  Target website
                </label>
                {isWebsiteLocked && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    <Lock className="h-3 w-3" /> Locked to current website
                  </span>
                )}
              </div>
              <select
                value={selectedWebsiteId}
                disabled={isWebsiteLocked}
                onChange={(e) => setSelectedWebsiteId(e.target.value)}
                className={cn(
                  'w-full h-11 px-3.5 text-[14px] rounded-lg border transition-all',
                  isWebsiteLocked
                    ? 'border-[var(--border)] bg-[var(--hover-subtle)] text-[var(--text-muted)] cursor-not-allowed select-none opacity-90'
                    : 'border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text)] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 cursor-pointer'
                )}
              >
                {websites.map((w) => (
                  <option key={w.id} value={w.id} className="bg-[var(--surface)] text-[var(--text)]">
                    {w.name} ({w.environment.toUpperCase()})
                  </option>
                ))}
              </select>
              {isWebsiteLocked && (
                <p className="text-[11px] text-[var(--text-muted)]">
                  Task will be automatically registered and linked to this application.
                </p>
              )}
            </div>

            {/* Task Title */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-[var(--text)]">
                Task title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Verify login and filter active shipments"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-11 px-3.5 text-[14px] rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
                autoFocus
              />
            </div>

            {/* Natural Language Instructions */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-[var(--text)]">
                Natural language instructions
              </label>
              <textarea
                rows={4}
                required
                placeholder="Describe step-by-step what the AI agent should test, what invariants to assert, and edge cases to check..."
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                className="w-full p-3.5 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all resize-none"
              />
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-[var(--text)]">
                Priority
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['P0', 'P1', 'P2', 'P3'] as const).map((p) => {
                  const isSelected = priority === p
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={cn(
                        'h-9 rounded-lg text-[12px] font-mono font-semibold transition-all border',
                        isSelected
                          ? 'border-[#4F46E5] bg-[#4F46E5] text-white shadow-xs'
                          : 'border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text)] hover:bg-[var(--hover-subtle)]'
                      )}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* AI Engine Selector */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-[var(--text)]">
                AI Engine
              </label>
              <div className="h-11 flex items-center bg-[var(--hover-subtle)] p-1 rounded-lg border border-[var(--border)]">
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
                          ? 'bg-[var(--surface)] text-[var(--text)] font-semibold shadow-xs'
                          : 'text-[var(--text-muted)] hover:text-[var(--text)]'
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
              <label className="block text-[13px] font-medium text-[var(--text)]">
                Test persona / Role
              </label>
              <input
                type="text"
                placeholder="e.g. Admin or Dispatcher"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-11 px-3.5 text-[14px] rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
              />
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="px-8 py-6 flex items-center justify-end gap-3 bg-[var(--surface)] border-t border-[var(--border)] shrink-0">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="h-10 px-5 text-[13px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="h-10 px-5 text-[13px]"
            >
              {loading ? 'Generating...' : 'Create task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
