import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'admin' | 'qa_lead' | 'qa_engineer'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}

export const MOCK_USERS: Record<UserRole, AuthUser> = {
  admin: {
    id: 'm1',
    name: 'Alex Chen',
    email: 'admin@testingagent.ai',
    role: 'admin',
  },
  qa_lead: {
    id: 'm2',
    name: 'Riya Sharma',
    email: 'riya@company.com',
    role: 'qa_lead',
  },
  qa_engineer: {
    id: 'm3',
    name: 'Karan Verma',
    email: 'karan@company.com',
    role: 'qa_engineer',
  },
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  setAuth: (user: AuthUser, token: string) => void
  clearAuth: () => void
  switchRole: (role: UserRole) => void
  switchUser: (user: AuthUser) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null, // Base URL shows Login Screen on fresh session
      accessToken: null,
      setAuth: (user, accessToken) => set({ user, accessToken }),
      clearAuth: () => set({ user: null, accessToken: null }),
      switchRole: (role: UserRole) => {
        const nextUser = MOCK_USERS[role]
        if (nextUser) {
          set({ user: nextUser, accessToken: `mock-token-${role}` })
        }
      },
      switchUser: (user: AuthUser) => set({ user, accessToken: `mock-token-${user.role}` }),
    }),
    {
      name: 'testing-agent-auth',
      partialize: (s) => ({ user: s.user }),
    }
  )
)
