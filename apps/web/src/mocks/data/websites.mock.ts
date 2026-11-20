export interface Website {
  id: string
  name: string
  baseUrl: string
  loginUrl: string
  environment: 'dev' | 'staging' | 'qa' | 'production'
  groupKey?: string
  status: 'active' | 'archived'
  taskCount: number
  lastRunStatus?: 'passed' | 'failed' | 'error' | 'running'
  lastRunAt?: string
  updatedAtLabel?: string
  createdAt: string
  updatedAt: string
}

export const INITIAL_WEBSITES: Website[] = [
  {
    id: 'web-1',
    name: 'Logistics Portal',
    baseUrl: 'https://staging.logistics.internal',
    loginUrl: 'https://staging.logistics.internal/login',
    environment: 'staging',
    groupKey: 'logistics',
    status: 'active',
    taskCount: 14,
    lastRunStatus: 'passed',
    updatedAtLabel: '2h ago',
    lastRunAt: new Date(Date.now() - 7200000).toISOString(),
    createdAt: '2026-10-15T09:00:00Z',
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'web-2',
    name: 'Billing Admin',
    baseUrl: 'https://qa-billing.company.com',
    loginUrl: 'https://qa-billing.company.com/auth/login',
    environment: 'qa',
    groupKey: 'billing',
    status: 'active',
    taskCount: 9,
    lastRunStatus: 'failed',
    updatedAtLabel: '5h ago',
    lastRunAt: new Date(Date.now() - 18000000).toISOString(),
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: new Date(Date.now() - 18000000).toISOString(),
  },
  {
    id: 'web-3',
    name: 'Customer Checkout',
    baseUrl: 'https://app.company.com',
    loginUrl: 'https://app.company.com/checkout/login',
    environment: 'production',
    groupKey: 'storefront',
    status: 'active',
    taskCount: 6,
    lastRunStatus: 'passed',
    updatedAtLabel: '1d ago',
    lastRunAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: '2026-11-01T08:30:00Z',
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
]
