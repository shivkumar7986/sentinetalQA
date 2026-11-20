import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'
export type FormDrawerType = 'add-website' | 'create-task' | null

interface UIState {
  theme: Theme
  sidebarCollapsed: boolean
  commandMenuOpen: boolean
  formDrawer: FormDrawerType
  setTheme: (t: Theme) => void
  toggleSidebar: () => void
  setCommandMenuOpen: (open: boolean) => void
  openFormDrawer: (drawer: FormDrawerType) => void
  closeFormDrawer: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'system',
      sidebarCollapsed: false,
      commandMenuOpen: false,
      formDrawer: null,
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setCommandMenuOpen: (commandMenuOpen) => set({ commandMenuOpen }),
      openFormDrawer: (formDrawer) => set({ formDrawer }),
      closeFormDrawer: () => set({ formDrawer: null }),
    }),
    {
      name: 'testing-agent-ui',
      partialize: (s) => ({ theme: s.theme, sidebarCollapsed: s.sidebarCollapsed }),
    }
  )
)
