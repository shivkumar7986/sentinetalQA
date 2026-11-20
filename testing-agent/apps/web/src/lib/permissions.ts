import type { UserRole } from '@/stores/auth.store'

const PERMISSIONS: Record<string, UserRole[]> = {
  'website.manage':     ['admin', 'qa_lead'],
  'config.edit':        ['admin', 'qa_lead', 'qa_engineer'],
  'credentials.manage': ['admin', 'qa_lead'],
  'task.create':        ['admin', 'qa_lead', 'qa_engineer'],
  'plan.approve':       ['admin', 'qa_lead'],
  'run.trigger':        ['admin', 'qa_lead', 'qa_engineer'],
  'report.view':        ['admin', 'qa_lead', 'qa_engineer', 'viewer'],
  'audit.view':         ['admin', 'qa_lead'],
  'users.manage':       ['admin'],
  'providers.manage':   ['admin'],
}

export function can(role: UserRole | undefined, permission: string): boolean {
  if (!role) return false
  return (PERMISSIONS[permission] ?? []).includes(role)
}

