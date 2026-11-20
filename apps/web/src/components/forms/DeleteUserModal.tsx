'use client'

import React, { useState, useEffect } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useUIStore } from '@/stores/ui.store'
import { type Member } from '@/mocks/data/users.mock'
import { mockClient } from '@/mocks/mockClient'

interface DeleteUserModalProps {
  open?: boolean
  member?: Member | null
  loading?: boolean
  onClose?: () => void
  onSuccess?: () => void
}

export function DeleteUserModal({
  open: propOpen,
  member: propMember,
  loading: propLoading,
  onClose: propOnClose,
  onSuccess: propOnSuccess,
}: DeleteUserModalProps) {
  const { deleteUserModal, closeDeleteUserModal } = useUIStore()

  const isOpen = propOpen !== undefined ? propOpen : Boolean(deleteUserModal)
  const member = propMember !== undefined ? propMember : (deleteUserModal as Member | null)
  const handleClose = propOnClose || closeDeleteUserModal

  const [loading, setLoading] = useState(false)

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

  const isDeleting = propLoading !== undefined ? propLoading : loading

  async function handleConfirmDelete() {
    if (!member) return
    setLoading(true)
    try {
      await mockClient.deleteMember(member.id)
      toast.success(`${member.name} has been deleted.`)
      if (propOnSuccess) propOnSuccess()
      handleClose()
    } catch (err: any) {
      toast.error('Failed to delete user', {
        description: err.message || 'An unexpected error occurred.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Blurred Backdrop covering entire screen, including Topbar & Sidebar */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-[7px] transition-opacity animate-fade-in"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Confirmation Modal Dialog */}
      <div
        className="relative z-10 w-full max-w-md bg-white dark:bg-[#12151F] border border-gray-200 dark:border-neutral-800 rounded-xl p-6 shadow-2xl space-y-4 animate-enter select-text"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-user-title"
      >
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 id="delete-user-title" className="text-[16px] font-bold text-gray-900 dark:text-white">
              Delete {member.name}?
            </h3>
            <p className="text-[13px] text-gray-500 dark:text-neutral-400 mt-1 leading-relaxed">
              Are you sure you want to permanently delete this user ({member.email})? They will lose all access to the workspace immediately.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="h-9 px-4 rounded-lg border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-[13px] font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleConfirmDelete}
            className="h-9 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-medium transition-colors shadow-none disabled:opacity-50 flex items-center gap-1.5"
          >
            {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isDeleting ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  )
}

