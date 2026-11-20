export interface Task {
  id: string
  displayId?: string
  websiteId: string
  websiteName: string
  title: string
  prompt?: string
  instruction?: string
  role?: string
  roleId?: string
  engine?: string
  roleName?: string
  providerKind?: 'ollama' | 'gemini' | 'hybrid'
  model?: string
  engineDisplay?: string
  priority?: 'high' | 'medium' | 'low'
  tags?: string[]
  status: 'draft' | 'in_review' | 'plan_generated' | 'approved' | 'running' | 'completed' | 'failed' | 'archived'
  lastRunId?: string
  updatedAtLabel?: string
  currentPlanId?: string
  createdAt: string
  updatedAt: string
}

export const INITIAL_TASKS: Task[] = [
  {
    id: 'tsk-201',
    displayId: 'tsk-201',
    websiteId: 'web-1',
    websiteName: 'Logistics Portal',
    title: 'Verify login and open the Tracking page',
    prompt: 'Verify that a Dispatcher can log in with valid credentials, is redirected to the Operations Overview dashboard, and can navigate directly to the Tracking page.',
    roleName: 'Dispatcher',
    providerKind: 'ollama',
    model: 'ollama/qwen2.5:14b',
    engineDisplay: 'ollama/qwen2.5:14b',
    status: 'approved',
    lastRunId: 'run-942',
    updatedAtLabel: '12m ago',
    currentPlanId: 'plan-1',
    createdAt: '2026-11-19T10:00:00Z',
    updatedAt: new Date(Date.now() - 720000).toISOString(),
  },
  {
    id: 'tsk-200',
    displayId: 'tsk-200',
    websiteId: 'web-2',
    websiteName: 'Billing Admin',
    title: 'Verify CSV invoice export with tax rules',
    prompt: 'Check that generating CSV invoice reports with multi-state tax rules calculates line totals correctly.',
    roleName: 'Billing Manager',
    providerKind: 'gemini',
    model: 'gemini-2.5-pro',
    engineDisplay: 'gemini-2.5-pro',
    status: 'completed',
    lastRunId: 'run-941',
    updatedAtLabel: '1h ago',
    currentPlanId: 'plan-2',
    createdAt: '2026-11-19T09:00:00Z',
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'tsk-199',
    displayId: 'tsk-199',
    websiteId: 'web-3',
    websiteName: 'Customer Checkout',
    title: 'Validate guest checkout promo code expiry',
    prompt: 'Validate that guest checkout flow rejects expired seasonal promotional coupons with actionable error messages.',
    roleName: 'Customer',
    providerKind: 'ollama',
    model: 'ollama/llama3.1:8b',
    engineDisplay: 'ollama/llama3.1:8b',
    status: 'in_review',
    updatedAtLabel: '3h ago',
    currentPlanId: 'plan-3',
    createdAt: '2026-11-19T07:30:00Z',
    updatedAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: 'tsk-198',
    displayId: 'tsk-198',
    websiteId: 'web-1',
    websiteName: 'Logistics Portal',
    title: 'SSO callback token refresh boundary',
    prompt: 'Simulate expired session during active load editing and check that SSO token renewal occurs without work loss.',
    roleName: 'Dispatcher',
    providerKind: 'gemini',
    model: 'gemini-2.5-flash',
    engineDisplay: 'gemini-2.5-flash',
    status: 'draft',
    updatedAtLabel: '1d ago',
    createdAt: '2026-11-18T12:00:00Z',
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
]
