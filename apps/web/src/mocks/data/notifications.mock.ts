export interface NotificationItem {
  id: string
  title: string
  message: string
  type: 'plan_ready' | 'run_passed' | 'run_failed' | 'task_created' | 'plan_approved' | 'website_added'
  href: string
  createdAt: string
  read: boolean
  targetLabel?: string
}

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Test Plan Ready for Review',
    message: 'AI Compiler compiled 3 test cases for "Verify Real-Time Dispatch Fleet Allocation".',
    type: 'plan_ready',
    href: '/plans/plan-1795410551445',
    targetLabel: 'Plan v1',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Run run-1795410744467 Completed',
    message: 'Execution finished with 100% pass rate on Logistics Portal (STAGING).',
    type: 'run_passed',
    href: '/reports/run-1795410744467',
    targetLabel: 'Run #104',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 'notif-3',
    title: 'Plan v2 Approved by QA Lead',
    message: 'Riya Sharma approved plan for "Verify Real-Time Dispatch Fleet Allocation".',
    type: 'plan_approved',
    href: '/plans/plan-1795410551445',
    targetLabel: 'Approved',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'notif-4',
    title: 'New Task Registered',
    message: 'Verify Multi-Currency Cart Checkout with Discount Code added to Customer Checkout.',
    type: 'task_created',
    href: '/tasks/task-1795412797727',
    targetLabel: 'Task',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'notif-5',
    title: 'Run #940 Regression Failed',
    message: 'Step 3 failed: Role redirect to Dispatcher Dashboard timeout after 19.3s.',
    type: 'run_failed',
    href: '/reports/run-940',
    targetLabel: 'Failed',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'notif-6',
    title: 'New Website Configured',
    message: 'shiv-creates registered with Production environment and 5 business rules.',
    type: 'website_added',
    href: '/websites/w-1/config',
    targetLabel: 'Website',
    createdAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    read: true,
  },
]
