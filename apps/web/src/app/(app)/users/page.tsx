'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Check, Clock, ShieldCheck, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePermissions, canManageUser, canAddRole } from '@/lib/permissions'
import { useAuthStore, type UserRole } from '@/stores/auth.store'
import { useUIStore } from '@/stores/ui.store'
import { INITIAL_MEMBERS, type Member } from '@/mocks/data/users.mock'
import { mockClient } from '@/mocks/mockClient'
import { toast } from 'sonner'

export default function UsersPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { isAdmin, isLead, isEmployee, meta } = usePermissions()

  useEffect(() => {
    if (user?.role === 'qa_engineer') {
      toast.error('Access Denied', {
        description: 'QA Employees do not have permission to access the Users module.',
      })
      router.replace('/dashboard')
    }
  }, [user, router])

  const { openFormDrawer } = useUIStore()

  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS)

  useEffect(() => {
    async function loadMembers() {
      const list = await mockClient.getMembers()
      setMembers(list)
    }
    loadMembers()

    const handleUpdate = () => {
      loadMembers()
    }
    window.addEventListener('testing_agent_members_changed', handleUpdate)
    return () => window.removeEventListener('testing_agent_members_changed', handleUpdate)
  }, [])

  // Filter members based on role:
  // Admin: sees ALL users (Admin, QA Lead, QA Employee)
  // QA Lead: sees ONLY QA Lead and QA Employee accounts (Admin hidden)
  // QA Employee: redirected out
  const visibleMembers = members.filter((m) => {
    if (isAdmin) return true
    if (isLead) return m.role === 'qa_lead' || m.role === 'qa_engineer'
    return false
  })

  // When QA Lead opens invite, enforce QA Employee role
  function handleOpenInvite() {
    if (isEmployee) {
      toast.error('Permission Denied', {
        description: 'QA Employees do not have permission to invite users.',
      })
      return
    }
    openFormDrawer('add-user')
  }

  async function handleRoleChange(memberId: string, targetMemberRole: UserRole, newRole: UserRole) {
    if (!canManageUser(user?.role, targetMemberRole)) {
      toast.error('Permission Denied', {
        description: `You do not have permission to change the role of a ${targetMemberRole === 'admin' ? 'Admin' : 'QA Lead'}.`,
      })
      return
    }
    if (!canAddRole(user?.role, newRole)) {
      toast.error('Permission Denied', {
        description: `As a ${meta.label}, you cannot assign the ${newRole === 'admin' ? 'Admin' : 'QA Lead'} role.`,
      })
      return
    }

    try {
      await mockClient.updateMember(memberId, { role: newRole })
      toast.success('Updated role successfully')
    } catch (err: any) {
      toast.error('Failed to update role', { description: err.message })
    }
  }

  async function handleToggleDisable(member: Member) {
    if (member.id === user?.id) {
      toast.error('Action not allowed', {
        description: 'You cannot disable your own active account.',
      })
      return
    }

    if (!canManageUser(user?.role, member.role)) {
      toast.error('Permission Denied', {
        description: `Only an Admin can modify ${member.role === 'admin' ? 'Admin' : 'QA Lead'} accounts.`,
      })
      return
    }

    const newStatus = member.status === 'disabled' ? 'active' : 'disabled'
    try {
      await mockClient.updateMember(member.id, { status: newStatus })
      toast.success(newStatus === 'active' ? `Enabled account for ${member.name}` : `Disabled access for ${member.name}`)
    } catch (err: any) {
      toast.error('Failed to update user status', { description: err.message })
    }
  }

  return (
    <div className="space-y-6 animate-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[24px] font-bold text-gray-900 dark:text-white tracking-tight">
              Users & Team Management
            </h1>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-[4px] border ${meta.badgeBg} ${meta.badgeText} ${meta.border}`}
            >
              Viewing as {meta.label}
            </span>
          </div>
          <p className="text-[13px] text-gray-500 dark:text-neutral-400 mt-1">
            Manage organization members, assign role permissions, and track testing team access.
          </p>
        </div>

        {/* Invite Button (Only visible/active for Admin & QA Lead) */}
        {!isEmployee && (
          <Button
            variant="primary"
            size="md"
            type="button"
            onClick={handleOpenInvite}
            className="gap-1.5 font-medium shrink-0 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg px-4 py-2 text-[13px] shadow-none h-10"
          >
            <Plus className="h-4 w-4" /> Invite user
          </Button>
        )}
      </div>

      {/* Role Notice Banner */}
      {isLead && (
        <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-lg p-3.5 text-[12px] flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-indigo-900 dark:text-indigo-200">
            <UserCheck className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
            <span>
              <strong>QA Lead Permissions:</strong> You can invite and manage <strong>QA Employees</strong> in your testing squad. Only an <strong>Admin</strong> can invite or edit Admin and QA Lead accounts.
            </span>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 rounded-lg p-3.5 text-[12px] flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-purple-900 dark:text-purple-200">
            <ShieldCheck className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400" />
            <span>
              <strong>Admin Permissions:</strong> You have full administrative control to invite and manage all platform roles (Admin, QA Lead, QA Employee).
            </span>
          </div>
        </div>
      )}

      {/* Users Table Card */}
      <div className="rounded-[8px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-neutral-800 text-[11px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                <th className="text-left py-3.5 px-6 font-semibold">MEMBER</th>
                <th className="text-left py-3.5 px-4 font-semibold">EMAIL</th>
                <th className="text-left py-3.5 px-4 font-semibold">PLATFORM ROLE</th>
                <th className="text-left py-3.5 px-4 font-semibold">STATUS</th>
                <th className="text-left py-3.5 px-4 font-semibold">LAST LOGIN</th>
                <th className="text-right py-3.5 px-6 font-semibold">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/80">
              {visibleMembers.map((member) => {
                const canEditThisRow = canManageUser(user?.role, member.role)
                const isSelf = member.id === user?.id

                return (
                  <tr
                    key={member.id}
                    className="hover:bg-gray-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    {/* Member Name */}
                    <td className="py-3.5 px-6 font-bold text-gray-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span>{member.name}</span>
                        {isSelf && (
                          <span className="text-[10px] font-normal text-gray-400 bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                            You
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 mono-data text-[12px] text-gray-500 dark:text-neutral-400">
                      {member.email}
                    </td>

                    {/* Role Dropdown */}
                    <td className="py-3.5 px-4">
                      {canEditThisRow ? (
                        <select
                          value={member.role}
                          onChange={(e) =>
                            handleRoleChange(member.id, member.role, e.target.value as UserRole)
                          }
                          className="h-8 px-2.5 text-[12px] font-medium rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-800 dark:text-neutral-200 focus:outline-none focus:border-[#4F46E5] cursor-pointer"
                        >
                          {isAdmin && <option value="admin">Admin</option>}
                          {isAdmin && <option value="qa_lead">QA Lead</option>}
                          <option value="qa_engineer">QA Employee</option>
                        </select>
                      ) : (
                        <span className="inline-flex items-center text-[12px] font-medium text-gray-700 dark:text-neutral-300 px-2 py-1 rounded bg-gray-100 dark:bg-neutral-800 border border-gray-200/60 dark:border-neutral-700">
                          {member.role === 'admin'
                            ? 'Admin'
                            : member.role === 'qa_lead'
                            ? 'QA Lead'
                            : 'QA Employee'}
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {member.status === 'active' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#DCFCE7] text-[#16A34A] dark:bg-emerald-950/40 dark:text-emerald-400">
                          <Check className="h-3 w-3 stroke-[2.5]" /> Active
                        </span>
                      )}
                      {member.status === 'invited' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#FEF3C7] text-[#D97706] dark:bg-amber-950/40 dark:text-amber-400">
                          <Clock className="h-3 w-3" /> Invited
                        </span>
                      )}
                      {member.status === 'disabled' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400">
                          Disabled
                        </span>
                      )}
                    </td>

                    {/* Last Login */}
                    <td className="py-3.5 px-4 mono-data text-[12px] text-gray-500 dark:text-neutral-400">
                      {member.lastLogin}
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-6 text-right">
                      <button
                        type="button"
                        disabled={!canEditThisRow || isSelf}
                        onClick={() => handleToggleDisable(member)}
                        className={`h-8 px-3 text-[12px] font-medium border rounded-[6px] transition-colors ${
                          !canEditThisRow || isSelf
                            ? 'border-gray-200 dark:border-neutral-800 text-gray-400 dark:text-neutral-600 bg-gray-50 dark:bg-neutral-800/50 cursor-not-allowed opacity-60'
                            : 'border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 cursor-pointer'
                        }`}
                        title={
                          isSelf
                            ? 'Cannot disable self'
                            : !canEditThisRow
                            ? 'Admin permissions required'
                            : undefined
                        }
                      >
                        {member.status === 'disabled' ? 'Enable' : 'Disable'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
