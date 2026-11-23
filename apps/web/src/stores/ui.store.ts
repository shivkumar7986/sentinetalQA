import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'
export type FormDrawerType =
  | 'add-website'
  | 'create-task'
  | 'add-user'
  | 'edit-user'
  | 'generate-plan'
  | 'notifications'
  | null

export interface FormDrawerData {
  websiteId?: string
  member?: any
  task?: any
  taskId?: string
  nextVersion?: number
  currentVersion?: number
  mode?: 'create' | 'regenerate'
  [key: string]: any
}

interface UIState {
  theme: Theme
  sidebarCollapsed: boolean
  commandMenuOpen: boolean
  formDrawer: FormDrawerType
  formDrawerData: FormDrawerData | null
  deleteUserModal: any | null
  setTheme: (t: Theme) => void
  toggleSidebar: () => void
  setCommandMenuOpen: (open: boolean) => void
  openFormDrawer: (drawer: FormDrawerType, data?: FormDrawerData | null) => void
  closeFormDrawer: () => void
  openDeleteUserModal: (member: any) => void
  closeDeleteUserModal: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'system',
      sidebarCollapsed: false,
      commandMenuOpen: false,
      formDrawer: null,
      formDrawerData: null,
      deleteUserModal: null,
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setCommandMenuOpen: (commandMenuOpen) => set({ commandMenuOpen }),
      openFormDrawer: (formDrawer, formDrawerData = null) => set({ formDrawer, formDrawerData: formDrawerData ?? null }),
      closeFormDrawer: () => set({ formDrawer: null, formDrawerData: null }),
      openDeleteUserModal: (member) => set({ deleteUserModal: member }),
      closeDeleteUserModal: () => set({ deleteUserModal: null }),
    }),
    {
      name: 'testing-agent-ui',
      partialize: (s) => ({ theme: s.theme, sidebarCollapsed: s.sidebarCollapsed }),
    }
  )
)
