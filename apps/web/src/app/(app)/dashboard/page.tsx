'use client'

import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { mockClient } from '@/mocks/mockClient'
import type { Website } from '@/mocks/data/websites.mock'
import type { Task } from '@/mocks/data/tasks.mock'
import type { Run } from '@/mocks/data/runs.mock'
import type { TestPlan } from '@/mocks/data/plans.mock'
import { StateView } from '@/components/data/StateView'
import { AdminDashboard } from '@/components/dashboard/AdminDashboard'
import { QALeadDashboard } from '@/components/dashboard/QALeadDashboard'
import { QAEmployeeDashboard } from '@/components/dashboard/QAEmployeeDashboard'
import { toast } from 'sonner'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const role = user?.role || 'admin'

  const [websites, setWebsites] = useState<Website[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [runs, setRuns] = useState<Run[]>([])
  const [plans, setPlans] = useState<TestPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      setLoading(true)
      const [fetchedWebsites, fetchedTasks, fetchedRuns, fetchedPlans] = await Promise.all([
        mockClient.getWebsites(),
        mockClient.getTasks(),
        mockClient.getRuns(),
        mockClient.getPlans(),
      ])
      setWebsites(fetchedWebsites)
      setTasks(fetchedTasks)
      setRuns(fetchedRuns)
      setPlans(fetchedPlans)
    } catch {
      toast.error('Failed to load dashboard metrics')
    } finally {
      setLoading(false)
    }
  }

  if (loading && websites.length === 0) {
    return (
      <StateView isLoading={true} skeletonCount={4}>
        <div />
      </StateView>
    )
  }

  // Role-specific Dashboards matching RBAC Designs
  if (role === 'qa_lead') {
    return (
      <QALeadDashboard
        websites={websites}
        tasks={tasks}
        runs={runs}
        plans={plans}
        loading={loading}
        onReload={loadDashboardData}
      />
    )
  }

  if (role === 'qa_engineer') {
    return (
      <QAEmployeeDashboard
        websites={websites}
        tasks={tasks}
        runs={runs}
        plans={plans}
        loading={loading}
        onReload={loadDashboardData}
      />
    )
  }

  // Default: Admin Dashboard
  return (
    <AdminDashboard
      websites={websites}
      tasks={tasks}
      runs={runs}
      plans={plans}
      loading={loading}
      onReload={loadDashboardData}
    />
  )
}
