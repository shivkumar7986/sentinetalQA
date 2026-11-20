'use client'

import React, { useState, useEffect } from 'react'
import { X, ChevronDown, Trash2, AlertTriangle, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore, type UserRole } from '@/stores/auth.store'
import { useUIStore } from '@/stores/ui.store'
import { type Member } from '@/mocks/data/users.mock'
import { mockClient } from '@/mocks/mockClient'
import { canManageUser } from '@/lib/permissions'

interface EditUserDrawerProps {
  open?: boolean
  member?: Member | null
  onClose?: () => void
  onSuccess?: () => void
}

export function EditUserDrawer({
  open: propOpen,
  member: propMember,
  onClose: propOnClose,
  onSuccess: propOnSuccess,
}: EditUserDrawerProps) {
  const { formDrawer, formDrawerData, closeFormDrawer, openDeleteUserModal } = useUIStore()
  const { user } = useAuthStore()

  const isOpen = propOpen !== undefined ? propOpen : formDrawer === 'edit-user'
  const member = propMember !== undefined ? propMember : (formDrawerData?.member as Member | null)
  const handleClose = propOnClose || closeFormDrawer

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('qa_engineer')
  const [assignedLead, setAssignedLead] = useState('')
  const [status, setStatus] = useState<'active' | 'invited' | 'disabled'>('active')
  const [availableLeads, setAvailableLeads] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)

  // Load available QA Leads
  useEffect(() => {
    async function loadLeads() {
      const all = await mockClient.getMembers()
      const leads = all.filter((m) => m.role === 'qa_lead' && m.status !== 'disabled')
      setAvailableLeads(leads)
    }
    if (isOpen) {
      loadLeads()
    }
  }, [isOpen])

  // Sync state with incoming member prop
  useEffect(() => {
    if (member) {
      setFullName(member.name)
      setEmail(member.email)
      setPassword(member.password || 'password123')
      setRole(member.role)
      setAssignedLead(member.assignedLead || '')
      setStatus(member.status)
    }
  }, [member])

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

  if (!isOpen || !member) return null

  const isSelf = member.id === user?.id
  const canManage = canManageUser(user?.role, member.role)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!member || !fullName.trim() || !email.trim()) return

    if (!canManage) {
      toast.error('Permission Denied', {
        description: `You do not have permission to edit ${member.name}.`,
      })
      return
    }

    setLoading(true)
    try {
      await mockClient.updateMember(member.id, {
        name: fullName.trim(),
        email: email.trim(),
        role,
        status,
        password: password.trim() || 'password123',
        assignedLead: role === 'qa_engineer' ? assignedLead : undefined,
      })

      toast.success(`Updated ${fullName.trim()} successfully!`)
      if (propOnSuccess) propOnSuccess()
      handleClose()
    } catch (err: any) {
      toast.error('Failed to update user', { description: err.message || 'An error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const inputClasses =
    'w-full h-11 px-3.5 text-[14px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all'

  const selectClasses =
    'w-full h-11 px-3.5 pr-10 text-[14px] rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white appearance-none focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all cursor-pointer'

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Blurred Backdrop covering entire screen */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-[7px] transition-opacity animate-fade-in"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer Panel - Full Viewport Height matching AddWebsiteDrawer & CreateTaskDrawer */}
      <div
        className="relative z-10 w-full max-w-[500px] h-screen bg-white dark:bg-[#12151F] border-l border-gray-200 dark:border-neutral-800 shadow-2xl flex flex-col justify-between animate-slide-in-right select-text"
        role="dialog"
        aria-modal="true"
      >
        <form onSubmit={handleSubmit} className="h-full flex flex-col justify-between">
          {/* Header & Fields container (Scrollable) */}
          <div className="px-8 pt-8 pb-4 space-y-5 overflow-y-auto flex-1">
            {/* Header */}
            <div className="flex items-start justify-between pb-1">
              <div>
                <h2 className="text-[20px] font-bold text-gray-900 dark:text-white tracking-tight leading-snug">
                  Edit user
                </h2>
                <p className="text-[13px] text-gray-500 dark:text-neutral-400 mt-0.5">
                  Update role permissions, squad assignment, and account status.
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
            <div className="space-y-1.5 pt-1">
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
                disabled={!canManage}
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
                disabled={!canManage}
              />
            </div>

            {/* Field 3: Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <span className="text-[11px] text-gray-400 dark:text-neutral-500">
                  User login credential
                </span>
              </div>
              <input
                type="text"
                required
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClasses}
                disabled={!canManage}
              />
            </div>

            {/* Field 4: Platform role */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                Platform role
              </label>
              <div className="relative">
                {user?.role === 'admin' ? (
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className={selectClasses}
                  >
                    <option value="qa_engineer">
                      QA Employee (Create tasks, edit plans, run tests)
                    </option>
                    <option value="qa_lead">
                      QA Lead (Approve plans, manage team, configure websites)
                    </option>
                    <option value="admin">
                      Admin (Full system control, governance &amp; settings)
                    </option>
                  </select>
                ) : (
                  <div className="h-11 px-3.5 flex items-center rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-[14px] text-gray-700 dark:text-neutral-300">
                    QA Employee (Locked: QA Leads only manage QA Employees)
                  </div>
                )}
                {user?.role === 'admin' && (
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                )}
              </div>
            </div>

            {/* Field 5: Assigned QA Lead (ONLY shown when role is QA Employee) */}
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
                    disabled={!canManage}
                  >
                    <option value="">Select QA Lead</option>
                    {availableLeads.map((lead) => (
                      <option key={lead.id} value={lead.name}>
                        {lead.name} ({lead.email})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Field 6: Account status */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                Account status
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'invited' | 'disabled')}
                  className={selectClasses}
                  disabled={!canManage}
                >
                  <option value="active">Active</option>
                  <option value="invited">Invited</option>
                  <option value="disabled">Disabled</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

          </div>

          {/* Bottom Actions - Exactly matching AddWebsiteDrawer / CreateTaskDrawer */}
          <div className="px-8 py-6 flex items-center justify-between bg-white dark:bg-[#12151F] shrink-0 border-t border-gray-100 dark:border-neutral-800">
            {/* Delete button (Left) */}
            {canManage && !isSelf ? (
              <button
                type="button"
                onClick={() => {
                  handleClose()
                  openDeleteUserModal(member)
                }}
                className="h-10 px-3.5 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[13px] font-medium flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="h-4 w-4" /> Delete user
              </button>
            ) : (
              <div />
            )}

            {/* Cancel & Save (Right) */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="h-10 px-5 rounded-lg border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-[13px] font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !canManage}
                className="h-10 px-5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium transition-colors shadow-none disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
