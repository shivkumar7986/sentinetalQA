'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, Sparkles, Settings, ArrowRight } from 'lucide-react'
import { useUIStore } from '@/stores/ui.store'
import { cn } from '@/lib/utils'

interface CommandItem {
  id: string
  title: string
  route: string
  category: 'quick' | 'website' | 'task' | 'run' | 'nav'
  icon?: React.ReactNode
}

const DEFAULT_COMMANDS: CommandItem[] = [
  {
    id: 'add-website',
    title: '+ Add website',
    route: '/websites/new',
    category: 'quick',
  },
  {
    id: 'create-task',
    title: '✦ Create AI testing task',
    route: '/tasks/new',
    category: 'quick',
  },
  {
    id: 'inspect-live-run',
    title: 'Inspect live run-942',
    route: '/runs/r1',
    category: 'quick',
    icon: <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse mr-1" />,
  },
  {
    id: 'ai-providers',
    title: '⚙ AI Providers (Ollama / Gemini)',
    route: '/settings/providers',
    category: 'quick',
  },
  // Additional searchable index items
  {
    id: 'web-1',
    title: 'TruckHub Logistics (Staging)',
    route: '/websites/web-1',
    category: 'website',
  },
  {
    id: 'web-2',
    title: 'TruckHub Production',
    route: '/websites/web-2',
    category: 'website',
  },
  {
    id: 'web-3',
    title: 'Admin RBAC Portal (QA)',
    route: '/websites/web-3',
    category: 'website',
  },
  {
    id: 'task-1',
    title: 'Task: Verify login and open the Tracking page',
    route: '/tasks/task-1',
    category: 'task',
  },
  {
    id: 'task-2',
    title: 'Task: Validate shipment filtering by status',
    route: '/tasks/task-2',
    category: 'task',
  },
  {
    id: 'nav-reports',
    title: 'Reports & Regression Comparisons',
    route: '/reports',
    category: 'nav',
  },
  {
    id: 'nav-audit',
    title: 'Audit Trail & Compliance Log',
    route: '/settings/audit',
    category: 'nav',
  },
]

export function CommandMenu() {
  const router = useRouter()
  const { commandMenuOpen, setCommandMenuOpen, openFormDrawer } = useUIStore()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Global keyboard shortcut listener for ⌘K / Ctrl+K and Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandMenuOpen(!commandMenuOpen)
      } else if (e.key === 'Escape' && commandMenuOpen) {
        e.preventDefault()
        setCommandMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [commandMenuOpen, setCommandMenuOpen])

  // Focus input when opened
  useEffect(() => {
    if (commandMenuOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [commandMenuOpen])

  if (!commandMenuOpen) return null

  const filtered = query.trim()
    ? DEFAULT_COMMANDS.filter((cmd) =>
        cmd.title.toLowerCase().includes(query.toLowerCase()) ||
        cmd.route.toLowerCase().includes(query.toLowerCase())
      )
    : DEFAULT_COMMANDS.slice(0, 4) // Show the 4 default items from screenshot when empty

  function handleSelect(item: CommandItem) {
    setCommandMenuOpen(false)
    if (item.id === 'add-website') {
      openFormDrawer('add-website')
    } else if (item.id === 'create-task') {
      openFormDrawer('create-task')
    } else {
      router.push(item.route)
    }
  }

  function handleInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex])
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 animate-enter">
      {/* Blurred & dimmed backdrop matching screenshot */}
      <div
        className="fixed inset-0 bg-slate-950/35 dark:bg-black/60 backdrop-blur-md transition-all duration-200"
        style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        onClick={() => setCommandMenuOpen(false)}
      />

      {/* Floating Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command Menu"
        className="relative w-full max-w-[560px] bg-[var(--surface)] border border-[var(--border)] rounded-[14px] overflow-hidden z-10 select-none shadow-[0_16px_50px_rgba(15,23,42,0.16)] dark:shadow-[0_16px_50px_rgba(0,0,0,0.45)]"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 h-12 gap-3">
          <Search className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Jump to website, task, or run..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleInputKeyDown}
            className="flex-1 bg-transparent text-[14px] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none"
          />
          <kbd
            onClick={() => setCommandMenuOpen(false)}
            className="px-1.5 py-0.5 text-[10px] font-mono font-medium text-[var(--text-muted)] bg-[var(--surface-elevated)] border border-[var(--border)] rounded cursor-pointer hover:text-[var(--text)]"
          >
            ESC
          </kbd>
        </div>

        <div className="h-px w-full bg-[var(--border)]" />

        {/* Results List */}
        <div className="p-1.5 max-h-[320px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-[12px] text-[var(--text-muted)]">
              No matching destinations found for &quot;{query}&quot;.
            </div>
          ) : (
            <div className="space-y-0.5">
              {filtered.map((item, idx) => {
                const isSelected = selectedIndex === idx
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      'flex items-center justify-between px-3.5 py-2.5 rounded-[8px] cursor-pointer text-[13px] transition-colors',
                      isSelected
                        ? 'bg-[var(--surface-elevated)] text-[var(--text)] font-medium'
                        : 'text-[var(--text)] hover:bg-[var(--surface-elevated)]'
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {item.icon}
                      <span className="truncate">{item.title}</span>
                    </div>

                    <span className="mono-data text-[12px] text-[var(--text-muted)] shrink-0 ml-4">
                      {item.route}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

