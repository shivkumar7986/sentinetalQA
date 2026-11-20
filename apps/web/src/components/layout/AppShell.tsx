'use client'

import React from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { CommandMenu } from './CommandMenu'
import { AddWebsiteDrawer } from '@/components/forms/AddWebsiteDrawer'
import { CreateTaskDrawer } from '@/components/forms/CreateTaskDrawer'
import { AddUserDrawer } from '@/components/forms/AddUserDrawer'
import { useUIStore } from '@/stores/ui.store'
import { cn } from '@/lib/utils'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { commandMenuOpen, formDrawer, closeFormDrawer } = useUIStore()

  const isBlurred = commandMenuOpen || Boolean(formDrawer)

  return (
    <div className="relative flex h-screen bg-[var(--bg)] overflow-hidden">
      {/* Underlying layout: heavily blurred when Command Menu (Jump To) OR any Form Drawer is open */}
      <div
        className={cn(
          'flex flex-1 h-full overflow-hidden transition-all duration-200 ease-out',
          isBlurred && 'filter blur-[7px] pointer-events-none select-none opacity-90'
        )}
      >
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <Topbar />
          <main className="flex-1 overflow-y-auto">
            {/* Fluid full-width layout without huge artificial margins */}
            <div className="w-full px-6 py-5">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Global Command Menu / Jump To Palette */}
      <CommandMenu />

      {/* Global Slide-over Form Drawers (Full 100vh height, top-0 to bottom-0) */}
      <AddWebsiteDrawer />
      <CreateTaskDrawer />
      <AddUserDrawer />
    </div>
  )
}
