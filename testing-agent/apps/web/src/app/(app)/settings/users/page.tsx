'use client'

import React, { useState } from 'react'
import { Plus, Check, Clock } from 'lucide-react'
import { SettingsNav } from '@/components/layout/SettingsNav'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Member {
  id: string
  name: string
  email: string
  role: 'Admin' | 'QA Lead' | 'QA Engineer' | 'Viewer'
  status: 'active' | 'invited' | 'disabled'
  lastLogin: string
}

const INITIAL_MEMBERS: Member[] = [
  {
    id: 'm1',
    name: 'Aarav Mehta',
    email: 'aarav@company.com',
    role: 'Admin',
    status: 'active',
    lastLogin: '2m ago',
  },
  {
    id: 'm2',
    name: 'Riya Sharma',
    email: 'riya@company.com',
    role: 'QA Lead',
    status: 'active',
    lastLogin: '42m ago',
  },
  {
    id: 'm3',
    name: 'Karan Verma',
    email: 'karan@company.com',
    role: 'QA Engineer',
    status: 'active',
    lastLogin: '3h ago',
  },
  {
    id: 'm4',
    name: 'Neha Kapoor',
    email: 'neha@company.com',
    role: 'Viewer',
    status: 'invited',
    lastLogin: '—',
  },
]

export default function UsersSettingsPage() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS)

  function handleInvite() {
    const email = prompt('Enter team member email address:')
    if (!email) return
    const name = email.split('@')[0].replace('.', ' ')
    const newMember: Member = {
      id: `m-${Date.now()}`,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email,
      role: 'QA Engineer',
      status: 'invited',
      lastLogin: '—',
    }
    setMembers((prev) => [...prev, newMember])
    toast.success(`Invitation sent to ${email}`)
  }

  function handleRoleChange(id: string, newRole: Member['role']) {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, role: newRole } : m))
    )
    toast.success(`Updated role to ${newRole}`)
  }

  function handleToggleDisable(member: Member) {
    if (member.status === 'disabled') {
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, status: 'active' } : m))
      )
      toast.success(`Enabled account for ${member.name}`)
    } else {
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, status: 'disabled' } : m))
      )
      toast.success(`Disabled access for ${member.name}`)
    }
  }

  return (
    <div className="space-y-6 animate-enter">
      {/* Shared Header with + Invite user button */}
      <SettingsNav
        action={
          <Button
            variant="primary"
            size="md"
            type="button"
            onClick={handleInvite}
            className="gap-1.5 font-medium bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg px-4 py-2 text-[13px] shadow-none h-10"
          >
            <Plus className="h-4 w-4" /> Invite user
          </Button>
        }
      />

      {/* Users Table Card matching reference screenshot */}
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
              {members.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-gray-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                >
                  {/* Member Name */}
                  <td className="py-3.5 px-6 font-bold text-gray-900 dark:text-white">
                    {member.name}
                  </td>

                  {/* Email */}
                  <td className="py-3.5 px-4 mono-data text-[12px] text-gray-500 dark:text-neutral-400">
                    {member.email}
                  </td>

                  {/* Platform Role Dropdown */}
                  <td className="py-3.5 px-4">
                    <select
                      value={member.role}
                      onChange={(e) =>
                        handleRoleChange(member.id, e.target.value as Member['role'])
                      }
                      className="h-8 px-2.5 text-[12px] font-medium rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-800 dark:text-neutral-200 focus:outline-none focus:border-[#4F46E5] cursor-pointer"
                    >
                      <option value="Admin">Admin</option>
                      <option value="QA Lead">QA Lead</option>
                      <option value="QA Engineer">QA Engineer</option>
                      <option value="Viewer">Viewer</option>
                    </select>
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
                      onClick={() => handleToggleDisable(member)}
                      className="h-8 px-3 text-[12px] font-medium border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 rounded-[6px] transition-colors"
                    >
                      {member.status === 'disabled' ? 'Enable' : 'Disable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
