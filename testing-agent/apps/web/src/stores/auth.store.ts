import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'admin' | 'qa_lead' | 'qa_engineer' | 'viewer'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  setAuth: (user: AuthUser, token: string) => void
  clearAuth: () => void
}

const DEFAULT_USER: AuthUser = {
  id: 'u-lead',
  name: 'Aarav Mehta',
  email: 'aarav@sentinel.qa',
  role: 'qa_lead',
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: DEFAULT_USER,
      accessToken: 'mock-jwt-token',
      setAuth: (user, accessToken) => set({ user, accessToken }),
      clearAuth: () => set({ user: null, accessToken: null }),
    }),
    {
      name: 'sentinel-auth',
      partialize: (s) => ({ user: s.user }),
    }
  )
)
