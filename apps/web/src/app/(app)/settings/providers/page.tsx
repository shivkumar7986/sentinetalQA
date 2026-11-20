'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { SettingsNav } from '@/components/layout/SettingsNav'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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
        <div className="rounded-[8px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex flex-col justify-between space-y-5 shadow-none">
          <div className="space-y-5">
            {/* Top row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="font-bold text-[15px] text-gray-900 dark:text-white">
                  Ollama
                </span>
                <span className="text-[13px] text-gray-500 dark:text-neutral-400">
                  (Local)
                </span>
              </div>

              {/* Default engine radio */}
              <label className="flex items-center gap-2 text-[13px] text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                <input
                  type="radio"
                  name="defaultEngine"
                  checked={defaultEngine === 'ollama'}
                  onChange={() => {
                    setDefaultEngine('ollama')
                    toast.success('Ollama set as default engine')
                  }}
                  className="h-4 w-4 text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"
                />
                <span>Default engine</span>
              </label>
            </div>

            {/* Base URL */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                Base URL
              </label>
              <input
                type="text"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                className="w-full h-10 px-3.5 text-[13px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#4F46E5] transition-colors"
              />
            </div>

            {/* Default model dropdown */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                Default model
              </label>
              <div className="relative">
                <select
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  className="w-full h-10 px-3.5 pr-8 text-[13px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#4F46E5] appearance-none cursor-pointer transition-colors"
                >
                  <option value="qwen2.5:14b">qwen2.5:14b</option>
                  <option value="llama3.1:8b">llama3.1:8b</option>
                  <option value="mistral-nemo:12b">mistral-nemo:12b</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Bottom status & actions */}
          <div className="flex items-center justify-between pt-2">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="h-3.5 w-3.5 stroke-[2.5]" /> Healthy · {ollamaLatency}ms
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={testOllama}
                disabled={ollamaTesting}
                className="h-8 px-3 text-[12px] font-medium border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 rounded-[6px] transition-colors"
              >
                {ollamaTesting ? 'Testing...' : 'Test connection'}
              </button>
              <button
                type="button"
                onClick={() => handleSave('Ollama')}
                className="h-8 px-3.5 text-[12px] font-medium bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-[6px] transition-colors shadow-none"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Gemini (Cloud) */}
        <div className="rounded-[8px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex flex-col justify-between space-y-5 shadow-none">
          <div className="space-y-5">
            {/* Top row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="font-bold text-[15px] text-gray-900 dark:text-white">
                  Gemini
                </span>
                <span className="text-[13px] text-gray-500 dark:text-neutral-400">
                  (Cloud)
                </span>
              </div>

              {/* Default engine radio */}
              <label className="flex items-center gap-2 text-[13px] text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                <input
                  type="radio"
                  name="defaultEngine"
                  checked={defaultEngine === 'gemini'}
                  onChange={() => {
                    setDefaultEngine('gemini')
                    toast.success('Gemini set as default engine')
                  }}
                  className="h-4 w-4 text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"
                />
                <span>Default engine</span>
              </label>
            </div>

            {/* API Key */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                API Key (encrypted at rest)
              </label>
              <div className="relative flex items-center">
                <input
                  type={showGeminiKey ? 'text' : 'password'}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full h-10 px-3.5 pr-16 text-[13px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#4F46E5] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey((v) => !v)}
                  className="absolute right-2 h-7 px-2.5 text-[12px] font-medium border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 rounded-[4px] transition-colors"
                >
                  {showGeminiKey ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Default model dropdown */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                Default model
              </label>
              <div className="relative">
                <select
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  className="w-full h-10 px-3.5 pr-8 text-[13px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#4F46E5] appearance-none cursor-pointer transition-colors"
                >
                  <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                  <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                  <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Bottom status & actions */}
          <div className="flex items-center justify-between pt-2">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="h-3.5 w-3.5 stroke-[2.5]" /> Healthy · {geminiLatency}ms
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={testGemini}
                disabled={geminiTesting}
                className="h-8 px-3 text-[12px] font-medium border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 rounded-[6px] transition-colors"
              >
                {geminiTesting ? 'Testing...' : 'Test connection'}
              </button>
              <button
                type="button"
                onClick={() => handleSave('Gemini')}
                className="h-8 px-3.5 text-[12px] font-medium bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-[6px] transition-colors shadow-none"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: AI Usage (Last 30 days) Table */}
      <div className="rounded-[8px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-none">
        <div className="p-5 border-b border-gray-100 dark:border-neutral-800">
          <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">
            AI Usage (Last 30 days)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-neutral-800 text-[11px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                <th className="text-left py-3.5 px-6 font-semibold">PROVIDER</th>
                <th className="text-left py-3.5 px-4 font-semibold">MODEL</th>
                <th className="text-left py-3.5 px-4 font-semibold">PLAN CALLS</th>
                <th className="text-left py-3.5 px-4 font-semibold">TOTAL TOKENS</th>
                <th className="text-left py-3.5 px-4 font-semibold">SCHEMA REPAIRS / ERRORS</th>
                <th className="text-left py-3.5 px-6 font-semibold">AVG LATENCY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/80">
              <tr className="hover:bg-gray-50/70 dark:hover:bg-neutral-800/40 transition-colors">
                <td className="py-3.5 px-6 font-bold text-gray-900 dark:text-white">
                  Ollama (Local)
                </td>
                <td className="py-3.5 px-4 mono-data text-gray-600 dark:text-gray-300">
                  qwen2.5:14b
                </td>
                <td className="py-3.5 px-4 mono-data text-gray-900 dark:text-white">
                  184
                </td>
                <td className="py-3.5 px-4 mono-data text-gray-900 dark:text-white">
                  312,480
                </td>
                <td className="py-3.5 px-4 mono-data text-gray-900 dark:text-white">
                  3 / 0
                </td>
                <td className="py-3.5 px-6 mono-data text-gray-900 dark:text-white">
                  1.8s
                </td>
              </tr>
              <tr className="hover:bg-gray-50/70 dark:hover:bg-neutral-800/40 transition-colors">
                <td className="py-3.5 px-6 font-bold text-gray-900 dark:text-white">
                  Gemini (Cloud)
                </td>
                <td className="py-3.5 px-4 mono-data text-gray-600 dark:text-gray-300">
                  gemini-2.5-pro
                </td>
                <td className="py-3.5 px-4 mono-data text-gray-900 dark:text-white">
                  62
                </td>
                <td className="py-3.5 px-4 mono-data text-gray-900 dark:text-white">
                  118,900
                </td>
                <td className="py-3.5 px-4 mono-data text-gray-900 dark:text-white">
                  0 / 0
                </td>
                <td className="py-3.5 px-6 mono-data text-gray-900 dark:text-white">
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
