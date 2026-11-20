'use client'

import React, { useState, useEffect } from 'react'
import { X, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useUIStore } from '@/stores/ui.store'
import { useAuthStore, type UserRole } from '@/stores/auth.store'
import { INITIAL_MEMBERS } from '@/mocks/data/users.mock'
import { canAddRole } from '@/lib/permissions'

const ROLE_OPTIONS = [
  {
    value: 'qa_engineer' as UserRole,
    label: 'QA Employee',
    description: 'Create tasks, edit plans, run tests',
  },
  {
    value: 'qa_lead' as UserRole,
    label: 'QA Lead',
    description: 'Approve plans, manage team, configure websites',
  },
  {
    value: 'admin' as UserRole,
    label: 'Admin',
    description: 'Full system control, governance & settings',
  },
]

const STATUS_OPTIONS = ['Active', 'Invited'] as const

interface AddUserDrawerProps {
  open?: boolean
  onClose?: () => void
  onSuccess?: (user: { name: string; email: string; role: UserRole; lead: string; status: string }) => void
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
  const [role, setRole] = useState<UserRole>('qa_engineer')
  const [assignedLead, setAssignedLead] = useState('')
  const [status, setStatus] = useState<'Active' | 'Invited'>('Active')
  const [loading, setLoading] = useState(false)

  // Dropdown open states
  const [roleOpen, setRoleOpen] = useState(false)
  const [leadOpen, setLeadOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)

  // Get available QA Leads for assignment
  const availableLeads = INITIAL_MEMBERS.filter((m) => m.role === 'qa_lead')

  // Set default lead when drawer opens
  useEffect(() => {
    if (isOpen && availableLeads.length > 0 && !assignedLead) {
      setAssignedLead(availableLeads[0].name)
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

  // Filter role options based on current user's permissions
  const allowedRoles = ROLE_OPTIONS.filter((r) => canAddRole(user?.role, r.value))

  const selectedRoleOption = ROLE_OPTIONS.find((r) => r.value === role)

  function resetForm() {
    setFullName('')
    setEmail('')
    setRole('qa_engineer')
    setAssignedLead(availableLeads.length > 0 ? availableLeads[0].name : '')
    setStatus('Active')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim() || !email.trim()) return

    if (!canAddRole(user?.role, role)) {
      toast.error('Permission Denied', {
        description: `You cannot add a user with the ${selectedRoleOption?.label} role.`,
      })
      return
    }

    setLoading(true)

    // Simulate async
    setTimeout(() => {
      const newUser = {
        name: fullName.trim(),
        email: email.trim(),
        role,
        lead: assignedLead,
        status: status.toLowerCase(),
      }

      if (onSuccess) onSuccess(newUser)

      toast.success(`${newUser.name} added as ${selectedRoleOption?.label}`, {
        description: `Invitation sent to ${newUser.email}`,
      })

      resetForm()
      setLoading(false)
      handleClose()
    }, 400)
  }

  const inputClasses =
    'w-full h-11 px-3.5 text-[14px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all'

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
        className="relative z-10 w-full max-w-[500px] h-screen bg-white dark:bg-[#12151F] border-l border-gray-200 dark:border-neutral-800 shadow-2xl flex flex-col justify-between animate-slide-in-right select-text"
        role="dialog"
        aria-modal="true"
      >
        <form onSubmit={handleSubmit} className="h-full flex flex-col justify-between">
          {/* Header & Fields */}
          <div className="px-8 pt-8 pb-4 space-y-5 overflow-y-auto">
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

            {/* Field 3: Platform role (custom dropdown) */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                Platform role
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setRoleOpen((v) => !v); setLeadOpen(false); setStatusOpen(false); }}
                  className={cn(
                    'w-full h-11 px-3.5 text-[14px] rounded-lg border bg-white dark:bg-neutral-800 text-gray-900 dark:text-white flex items-center justify-between transition-all text-left',
                    roleOpen
                      ? 'border-[#6366F1] ring-2 ring-[#6366F1]/20'
                      : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600',
                  )}
                >
                  <span>
                    {selectedRoleOption?.label}
                    <span className="text-gray-400 dark:text-neutral-500 ml-1">
                      ({selectedRoleOption?.description})
                    </span>
                  </span>
                  <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform shrink-0', roleOpen && 'rotate-180')} />
                </button>

                {roleOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setRoleOpen(false)} />
                    <div
                      className="absolute left-0 right-0 top-full mt-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 py-1 z-30 shadow-lg"
                    >
                      {allowedRoles.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => { setRole(opt.value); setRoleOpen(false); }}
                          className={cn(
                            'w-full text-left px-3.5 py-2.5 text-[13px] flex items-center justify-between transition-colors',
                            role === opt.value
                              ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-semibold'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700',
                          )}
                        >
                          <div>
                            <span className="font-medium">{opt.label}</span>
                            <span className="text-gray-400 dark:text-neutral-500 ml-1 text-[12px]">
                              ({opt.description})
                            </span>
                          </div>
                          {role === opt.value && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Field 4: Assigned QA Lead */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                Assigned QA Lead
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setLeadOpen((v) => !v); setRoleOpen(false); setStatusOpen(false); }}
                  className={cn(
                    'w-full h-11 px-3.5 text-[14px] rounded-lg border bg-white dark:bg-neutral-800 text-gray-900 dark:text-white flex items-center justify-between transition-all text-left',
                    leadOpen
                      ? 'border-[#6366F1] ring-2 ring-[#6366F1]/20'
                      : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600',
                  )}
                >
                  <span>{assignedLead || 'Select a QA Lead'}</span>
                  <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform shrink-0', leadOpen && 'rotate-180')} />
                </button>

                {leadOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setLeadOpen(false)} />
                    <div
                      className="absolute left-0 right-0 top-full mt-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 py-1 z-30 shadow-lg"
                    >
                      {availableLeads.map((lead) => (
                        <button
                          key={lead.id}
                          type="button"
                          onClick={() => { setAssignedLead(lead.name); setLeadOpen(false); }}
                          className={cn(
                            'w-full text-left px-3.5 py-2.5 text-[13px] flex items-center justify-between transition-colors',
                            assignedLead === lead.name
                              ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-semibold'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700',
                          )}
                        >
                          <div>
                            <span className="font-medium">{lead.name}</span>
                            <span className="text-gray-400 dark:text-neutral-500 ml-1.5 text-[12px]">
                              {lead.email}
                            </span>
                          </div>
                          {assignedLead === lead.name && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                        </button>
                      ))}
                      {availableLeads.length === 0 && (
                        <div className="px-3.5 py-3 text-[12px] text-gray-400 dark:text-neutral-500 text-center">
                          No QA Leads available
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Field 5: Account status */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                Account status
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setStatusOpen((v) => !v); setRoleOpen(false); setLeadOpen(false); }}
                  className={cn(
                    'w-full h-11 px-3.5 text-[14px] rounded-lg border bg-white dark:bg-neutral-800 text-gray-900 dark:text-white flex items-center justify-between transition-all text-left',
                    statusOpen
                      ? 'border-[#6366F1] ring-2 ring-[#6366F1]/20'
                      : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600',
                  )}
                >
                  <span>{status}</span>
                  <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform shrink-0', statusOpen && 'rotate-180')} />
                </button>

                {statusOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setStatusOpen(false)} />
                    <div
                      className="absolute left-0 right-0 top-full mt-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 py-1 z-30 shadow-lg"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => { setStatus(opt); setStatusOpen(false); }}
                          className={cn(
                            'w-full text-left px-3.5 py-2.5 text-[13px] flex items-center justify-between transition-colors',
                            status === opt
                              ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-semibold'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700',
                          )}
                        >
                          {opt}
                          {status === opt && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="px-8 py-6 flex items-center justify-end gap-3 bg-white dark:bg-[#12151F] shrink-0">
            <button
              type="button"
              onClick={() => { resetForm(); handleClose(); }}
              className="h-10 px-5 rounded-lg border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-[13px] font-medium transition-colors"
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
