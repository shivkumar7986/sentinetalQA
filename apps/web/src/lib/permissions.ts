import { useAuthStore, type UserRole } from '@/stores/auth.store'

export type Permission =
  | 'website.manage'
  | 'config.edit'
  | 'credentials.manage'
  | 'task.create'
  | 'plan.approve'
  | 'run.trigger'
  | 'report.view'
  | 'audit.view'
  | 'users.view'
  | 'users.manage'
  | 'providers.manage'

const PERMISSIONS: Record<Permission, UserRole[]> = {
  'website.manage':     ['admin', 'qa_lead'],
  'config.edit':        ['admin', 'qa_lead'], // Immutable for QA Employee (cannot edit/add/archive)
  'credentials.manage': ['admin'],
  'task.create':        ['admin', 'qa_lead', 'qa_engineer'],
  'plan.approve':       ['admin', 'qa_lead'], // QA Employee cannot approve plans
  'run.trigger':        ['admin', 'qa_lead', 'qa_engineer'],
  'report.view':        ['admin', 'qa_lead', 'qa_engineer'],
  'audit.view':         ['admin', 'qa_lead'],
  'users.view':         ['admin', 'qa_lead'], // Visible to Admin and QA Lead
  'users.manage':       ['admin', 'qa_lead'],
  'providers.manage':   ['admin'], // Admin only
}

export interface RoleMeta {
  role: UserRole
  label: string
  desc: string
  badgeBg: string
  badgeText: string
  border: string
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleMeta> = {
  admin: {
    role: 'admin',
    label: 'Admin',
    desc: 'Full workspace access: manage team, AI providers, audit logs & settings',
    badgeBg: 'bg-purple-100 dark:bg-purple-950/60',
    badgeText: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
  },
  qa_lead: {
    role: 'qa_lead',
    label: 'QA Lead',
    desc: 'Manage websites, create tasks, approve plans & invite QA employees',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-950/60',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800',
  },
  qa_engineer: {
    role: 'qa_engineer',
    label: 'QA Employee',
    desc: 'Create tasks, write test cases & trigger runs (cannot approve plans)',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
}

export function can(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false
  return (PERMISSIONS[permission] ?? []).includes(role)
}

/**
 * Determines which roles a given user is allowed to invite / create.
 * - Admin can create: Admin, QA Lead, QA Employee
 * - QA Lead can ONLY create: QA Employee
 * - QA Employee cannot create any user
 */
export function canAddRole(currentUserRole: UserRole | undefined, targetRole: UserRole): boolean {
  if (currentUserRole === 'admin') return true
  if (currentUserRole === 'qa_lead') {
    return targetRole === 'qa_engineer'
  }
  return false
}

/**
 * Determines whether the current user has permission to edit or disable another user.
 * - Admin can manage anyone (except cannot disable themselves)
 * - QA Lead can only edit or disable QA Employees (cannot edit Admins or other QA Leads)
 * - QA Employee has no management rights
 */
export function canManageUser(currentUserRole: UserRole | undefined, targetUserRole: UserRole): boolean {
  if (currentUserRole === 'admin') return true
  if (currentUserRole === 'qa_lead') {
    return targetUserRole === 'qa_engineer'
  }
  return false
}

export function usePermissions() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role

  return {
    user,
    role,
    meta: role ? ROLE_DEFINITIONS[role] : ROLE_DEFINITIONS.qa_engineer,
    can: (permission: Permission) => can(role, permission),
    canAddRole: (targetRole: UserRole) => canAddRole(role, targetRole),
    canManageUser: (targetRole: UserRole) => canManageUser(role, targetRole),
    isAdmin: role === 'admin',
    isLead: role === 'qa_lead',
    isEmployee: role === 'qa_engineer',
  }
}
