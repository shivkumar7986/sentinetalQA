import type { UserRole } from '@/stores/auth.store'

export interface Member {
  id: string
  name: string
  email: string
  role: UserRole
  status: 'active' | 'invited' | 'disabled'
  lastLogin: string
  assignedLead?: string
  password?: string
}

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'm1',
    name: 'Alex Chen',
    email: 'admin@testingagent.ai',
    role: 'admin',
    status: 'active',
    lastLogin: 'Just now',
    password: 'admin',
  },
  {
    id: 'm2',
    name: 'Riya Sharma',
    email: 'riya@company.com',
    role: 'qa_lead',
    status: 'active',
    lastLogin: '14m ago',
    assignedLead: 'Alex Chen (Admin)',
    password: 'lead',
  },
  {
    id: 'm3',
    name: 'Vikram Patel',
    email: 'vikram@company.com',
    role: 'qa_lead',
    status: 'active',
    lastLogin: '2h ago',
    assignedLead: 'Alex Chen (Admin)',
    password: 'lead',
  },
  {
    id: 'm4',
    name: 'Karan Verma',
    email: 'karan@company.com',
    role: 'qa_engineer',
    status: 'active',
    lastLogin: '3h ago',
    assignedLead: 'Riya Sharma',
    password: 'employee',
  },
  {
    id: 'm5',
    name: 'Elena Rostova',
    email: 'employee@testingagent.ai',
    role: 'qa_engineer',
    status: 'active',
    lastLogin: '1h ago',
    assignedLead: 'Vikram Patel',
    password: 'employee',
  },
  {
    id: 'm6',
    name: 'Neha Kapoor',
    email: 'neha@testingagent.ai',
    role: 'qa_engineer',
    status: 'invited',
    lastLogin: '—',
    assignedLead: 'Riya Sharma',
    password: 'employee',
  },
]

