'use client'

import React, { useState, useEffect } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { useUIStore } from '@/stores/ui.store'
import { useAuthStore, type UserRole } from '@/stores/auth.store'
import { type Member } from '@/mocks/data/users.mock'
import { mockClient } from '@/mocks/mockClient'
import { canAddRole } from '@/lib/permissions'

interface AddUserDrawerProps {
  open?: boolean
  onClose?: () => void
  onSuccess?: (user: Member) => void
}

export function AddUserDrawer({
  open: propOpen,
  onClose: propOnClose,
  onSuccess,
}: AddUserDrawerProps) {
  const { formDrawer, closeFormDrawer } = useUIStore()
  const { user } = useAuthStore()
  const isOpen = propOpen !== undefined ? propOpen : formDrawer === 'add-user'
  const handleClose = propOnClose || closeFormDrawer

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('password123')
  const [role, setRole] = useState<UserRole>('qa_engineer')
  const [assignedLead, setAssignedLead] = useState('')
  const [status, setStatus] = useState<'active' | 'invited'>('active')
  const [availableLeads, setAvailableLeads] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)

  // Load available QA Leads
  useEffect(() => {
    async function loadLeads() {
      const all = await mockClient.getMembers()
      const leads = all.filter((m) => m.role === 'qa_lead' && m.status !== 'disabled')
      setAvailableLeads(leads)
      if (leads.length > 0 && !assignedLead) {
        setAssignedLead(leads[0].name)
      }
    }
    if (isOpen) {
      loadLeads()
    }
  }, [isOpen])

  // Escape key handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose])

  if (!isOpen) return null

  function resetForm() {
    setFullName('')
    setEmail('')
    setPassword('password123')
    setRole('qa_engineer')
    setAssignedLead(availableLeads.length > 0 ? availableLeads[0].name : '')
    setStatus('active')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim() || !email.trim()) return

    if (!canAddRole(user?.role, role)) {
      toast.error('Permission Denied', {
        description: `You do not have permission to add a user with the ${role} role.`,
      })
      return
    }

    setLoading(true)
    try {
      const newMember = await mockClient.createMember({
        name: fullName.trim(),
        email: email.trim(),
        role,
        status,
        password: password.trim() || 'password123',
        assignedLead: role === 'qa_engineer' ? (assignedLead || availableLeads[0]?.name || 'Alex Chen') : undefined,
      })

      if (onSuccess) onSuccess(newMember)

      toast.success(`${newMember.name} added successfully!`, {
        description: `Role: ${role === 'admin' ? 'Admin' : role === 'qa_lead' ? 'QA Lead' : 'QA Employee'} | Password: ${password.trim() || 'password123'}`,
      })

      resetForm()
      handleClose()
    } catch (err: any) {
      toast.error('Failed to add user', { description: err.message || 'An error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const inputClasses =
    'w-full h-11 px-3.5 text-[14px] rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all'

  const selectClasses =
    'w-full h-11 px-3.5 pr-10 text-[14px] rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text)] appearance-none focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all cursor-pointer'

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-[7px] transition-opacity animate-fade-in"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className="relative z-10 w-full max-w-[500px] h-screen bg-[var(--surface)] border-l border-[var(--border)] shadow-2xl flex flex-col justify-between animate-slide-in-right select-text"
        role="dialog"
        aria-modal="true"
      >
        <form onSubmit={handleSubmit} className="h-full flex flex-col justify-between">
          {/* Header & Fields container */}
          <div className="px-8 pt-8 pb-4 space-y-5 overflow-y-auto flex-1">
            {/* Header */}
            <div className="flex items-start justify-between pb-1">
              <div>
                <h2 className="text-[20px] font-bold text-gray-900 dark:text-white tracking-tight leading-snug">
                  Add QA Lead or QA Employee
                </h2>
                <p className="text-[13px] text-gray-500 dark:text-neutral-400 mt-0.5">
                  Admins can create, edit, or reassign QA Leads and QA Employees.
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

            {/* Field 1: Full name */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                Full name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sneha Kulkarni"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClasses}
                autoFocus
              />
            </div>

            {/* Field 2: Work email */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                Work email
              </label>
              <input
                type="email"
                required
                placeholder="sneha@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses}
              />
            </div>

            {/* Field 3: Temporary / Initial Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <span className="text-[11px] text-gray-400 dark:text-neutral-500">
                  Default: <code className="text-[#6366F1] font-mono">password123</code>
                </span>
              </div>
              <input
                type="text"
                required
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClasses}
              />
              <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                User will use this password and work email to sign in at /login.
              </p>
            </div>

            {/* Field 4: Platform role */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                Platform role
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className={selectClasses}
                >
                  <option value="qa_engineer">
                    QA Employee (Create tasks, edit plans, run tests)
                  </option>
                  {canAddRole(user?.role, 'qa_lead') && (
                    <option value="qa_lead">
                      QA Lead (Approve plans, manage team, configure websites)
                    </option>
                  )}
                  {canAddRole(user?.role, 'admin') && (
                    <option value="admin">
                      Admin (Full system control, governance &amp; settings)
                    </option>
                  )}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Field 4: Assigned QA Lead (ONLY shown when role is QA Employee) */}
            {role === 'qa_engineer' && (
              <div className="space-y-1.5 animate-enter">
                <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                  Assigned QA Lead
                </label>
                <div className="relative">
                  <select
                    value={assignedLead}
                    onChange={(e) => setAssignedLead(e.target.value)}
                    className={selectClasses}
                  >
                    {availableLeads.map((lead) => (
                      <option key={lead.id} value={lead.name}>
                        {lead.name}
                      </option>
                    ))}
                    {availableLeads.length === 0 && (
                      <option value="">No QA Leads available</option>
                    )}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Field 5: Account status */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                Account status
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'invited')}
                  className={selectClasses}
                >
                  <option value="active">Active</option>
                  <option value="invited">Invited</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="px-8 py-6 flex items-center justify-end gap-3 bg-[var(--surface)] shrink-0 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => {
                resetForm()
                handleClose()
              }}
              className="h-10 px-5 rounded-lg border border-[var(--border)] text-[var(--text)] bg-[var(--surface-elevated)] hover:bg-[var(--hover-subtle)] text-[13px] font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-10 px-5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium transition-colors shadow-none disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add user'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
