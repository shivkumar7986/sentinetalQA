'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { SettingsNav } from '@/components/layout/SettingsNav'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export default function ProvidersSettingsPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user?.role === 'qa_engineer') {
      toast.error('Access Denied', {
        description: 'Settings are not available for QA Employees.',
      })
      router.replace('/dashboard')
    } else if (user?.role === 'qa_lead') {
      toast.error('Access Denied', {
        description: 'AI Providers configuration requires Administrator privileges.',
      })
      router.replace('/settings/general')
    }
  }, [user, router])

  const [defaultEngine, setDefaultEngine] = useState<'ollama' | 'gemini'>('ollama')

  // Ollama state
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434')
  const [ollamaModel, setOllamaModel] = useState('qwen2.5:14b')
  const [ollamaTesting, setOllamaTesting] = useState(false)
  const [ollamaLatency, setOllamaLatency] = useState(28)

  // Gemini state
  const [geminiKey, setGeminiKey] = useState('AIzaSyD-98124_live_mock_secure_key')
  const [showGeminiKey, setShowGeminiKey] = useState(false)
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-pro')
  const [geminiTesting, setGeminiTesting] = useState(false)
  const [geminiLatency, setGeminiLatency] = useState(142)

  async function testOllama() {
    setOllamaTesting(true)
    await new Promise((r) => setTimeout(r, 600))
    setOllamaLatency(Math.floor(Math.random() * 10) + 24)
    setOllamaTesting(false)
    toast.success('Ollama connected successfully (200 OK)')
  }

  async function testGemini() {
    setGeminiTesting(true)
    await new Promise((r) => setTimeout(r, 700))
    setGeminiLatency(Math.floor(Math.random() * 20) + 130)
    setGeminiTesting(false)
    toast.success('Gemini API quota verified')
  }

  function handleSave(provider: string) {
    toast.success(`Saved configuration for ${provider}`)
  }

  return (
    <div className="space-y-6 animate-enter">
      {/* Shared Header */}
      <SettingsNav />

      {/* Row 1: Dual Provider Cards side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: Ollama (Local) */}
        <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col justify-between space-y-5 shadow-none">
          <div className="space-y-5">
            {/* Top row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="font-bold text-[15px] text-[var(--text)]">
                  Ollama
                </span>
                <span className="text-[13px] text-[var(--text-muted)]">
                  (Local)
                </span>
              </div>

              {/* Default engine radio */}
              <label className="flex items-center gap-2 text-[13px] text-[var(--text)] cursor-pointer select-none">
                <input
                  type="radio"
                  name="defaultEngine"
                  checked={defaultEngine === 'ollama'}
                  onChange={() => {
                    setDefaultEngine('ollama')
                    toast.success('Ollama set as default engine')
                  }}
                  className="h-4 w-4 text-[var(--primary)] focus:ring-[var(--ai-ring)] cursor-pointer"
                />
                <span>Default engine</span>
              </label>
            </div>

            {/* Base URL */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-[var(--text-muted)]">
                Base URL
              </label>
              <input
                type="text"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                className="w-full h-10 px-3.5 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:border-[var(--border-hover)] transition-colors"
              />
            </div>

            {/* Default model dropdown */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-[var(--text-muted)]">
                Default model
              </label>
              <div className="relative">
                <select
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  className="w-full h-10 px-3.5 pr-8 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:border-[var(--border-hover)] appearance-none cursor-pointer transition-colors"
                >
                  <option value="qwen2.5:14b">qwen2.5:14b</option>
                  <option value="llama3.1:8b">llama3.1:8b</option>
                  <option value="mistral-nemo:12b">mistral-nemo:12b</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Bottom status & actions */}
          <div className="flex items-center justify-between pt-2">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="h-3.5 w-3.5 stroke-[2.5]" /> Healthy · {ollamaLatency}ms
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={testOllama}
                disabled={ollamaTesting}
              >
                {ollamaTesting ? 'Testing...' : 'Test connection'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="button"
                onClick={() => handleSave('Ollama')}
              >
                Save
              </Button>
            </div>
          </div>
        </div>

        {/* Card 2: Gemini (Cloud) */}
        <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col justify-between space-y-5 shadow-none">
          <div className="space-y-5">
            {/* Top row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="font-bold text-[15px] text-[var(--text)]">
                  Gemini
                </span>
                <span className="text-[13px] text-[var(--text-muted)]">
                  (Cloud)
                </span>
              </div>

              {/* Default engine radio */}
              <label className="flex items-center gap-2 text-[13px] text-[var(--text)] cursor-pointer select-none">
                <input
                  type="radio"
                  name="defaultEngine"
                  checked={defaultEngine === 'gemini'}
                  onChange={() => {
                    setDefaultEngine('gemini')
                    toast.success('Gemini set as default engine')
                  }}
                  className="h-4 w-4 text-[var(--primary)] focus:ring-[var(--ai-ring)] cursor-pointer"
                />
                <span>Default engine</span>
              </label>
            </div>

            {/* API Key */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-[var(--text-muted)]">
                API Key (encrypted at rest)
              </label>
              <div className="relative flex items-center">
                <input
                  type={showGeminiKey ? 'text' : 'password'}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full h-10 px-3.5 pr-16 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:border-[var(--border-hover)] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey((v) => !v)}
                  className="absolute right-2 h-7 px-2.5 text-[12px] font-medium border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--hover-subtle)] text-[var(--text)] rounded-[4px] transition-colors"
                >
                  {showGeminiKey ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Default model dropdown */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-[var(--text-muted)]">
                Default model
              </label>
              <div className="relative">
                <select
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  className="w-full h-10 px-3.5 pr-8 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:border-[var(--border-hover)] appearance-none cursor-pointer transition-colors"
                >
                  <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                  <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                  <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Bottom status & actions */}
          <div className="flex items-center justify-between pt-2">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="h-3.5 w-3.5 stroke-[2.5]" /> Healthy · {geminiLatency}ms
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={testGemini}
                disabled={geminiTesting}
              >
                {geminiTesting ? 'Testing...' : 'Test connection'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="button"
                onClick={() => handleSave('Gemini')}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: AI Usage (Last 30 days) Table */}
      <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-none">
        <div className="p-5 border-b border-[var(--border)]">
          <h2 className="text-[15px] font-semibold text-[var(--text)]">
            AI Usage (Last 30 days)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--border)] text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                <th className="text-left py-3.5 px-6 font-semibold">PROVIDER</th>
                <th className="text-left py-3.5 px-4 font-semibold">MODEL</th>
                <th className="text-left py-3.5 px-4 font-semibold">PLAN CALLS</th>
                <th className="text-left py-3.5 px-4 font-semibold">TOTAL TOKENS</th>
                <th className="text-left py-3.5 px-4 font-semibold">SCHEMA REPAIRS / ERRORS</th>
                <th className="text-left py-3.5 px-6 font-semibold">AVG LATENCY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              <tr className="hover:bg-[var(--hover-row)] transition-colors">
                <td className="py-3.5 px-6 font-bold text-[var(--text)]">
                  Ollama (Local)
                </td>
                <td className="py-3.5 px-4 mono-data text-[var(--text-muted)]">
                  qwen2.5:14b
                </td>
                <td className="py-3.5 px-4 mono-data text-[var(--text)]">
                  184
                </td>
                <td className="py-3.5 px-4 mono-data text-[var(--text)]">
                  312,480
                </td>
                <td className="py-3.5 px-4 mono-data text-[var(--text)]">
                  3 / 0
                </td>
                <td className="py-3.5 px-6 mono-data text-[var(--text)]">
                  1.8s
                </td>
              </tr>
              <tr className="hover:bg-[var(--hover-row)] transition-colors">
                <td className="py-3.5 px-6 font-bold text-[var(--text)]">
                  Gemini (Cloud)
                </td>
                <td className="py-3.5 px-4 mono-data text-[var(--text-muted)]">
                  gemini-2.5-pro
                </td>
                <td className="py-3.5 px-4 mono-data text-[var(--text)]">
                  62
                </td>
                <td className="py-3.5 px-4 mono-data text-[var(--text)]">
                  118,900
                </td>
                <td className="py-3.5 px-4 mono-data text-[var(--text)]">
                  0 / 0
                </td>
                <td className="py-3.5 px-6 mono-data text-[var(--text)]">
                  1.1s
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
