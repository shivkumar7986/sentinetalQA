import type { UserRole } from '@/stores/auth.store'

export interface Member {
  id: string
  name: string
  email: string
  role: UserRole
  status: 'active' | 'invited' | 'disabled'
  lastLogin: string
}

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'm1',
    name: 'Alex Chen',
    email: 'admin@testingagent.ai',
    role: 'admin',
    status: 'active',
    lastLogin: 'Just now',
  },
  {
    id: 'm2',
    name: 'Aarav Mehta',
    email: 'lead@testingagent.ai',
    role: 'qa_lead',
    status: 'active',
    lastLogin: '14m ago',
  },
  {
    id: 'm3',
    name: 'Elena Rostova',
    email: 'employee@testingagent.ai',
    role: 'qa_engineer',
    status: 'active',
    lastLogin: '1h ago',
  },
  {
    id: 'm4',
    name: 'Karan Verma',
    email: 'karan@testingagent.ai',
    role: 'qa_engineer',
    status: 'active',
    lastLogin: '3h ago',
  },
  {
    id: 'm5',
    name: 'Neha Kapoor',
    email: 'neha@testingagent.ai',
    role: 'qa_engineer',
    status: 'invited',
    lastLogin: '—',
  },
]

