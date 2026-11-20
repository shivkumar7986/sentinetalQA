import type { StatusValue } from '@/components/domain/StatusBadge'

export interface StepLog {
  id: string
  runId: string
  caseId: string
  stepId: string
  caseTitle: string
  action: string
  validationType: string
  status: StatusValue
  startedAt: string
  endedAt: string
  durationMs: number
  checkPerformed: string
  requestSummary?: {
    method: string
    url: string
    headers?: Record<string, string>
    body?: any
  }
  responseSummary?: {
    statusCode: number
    headers?: Record<string, string>
    bodyPreview?: string
  }
  errorCategory?: 'assertion_failed' | 'target_unreachable' | 'auth_failed' | 'plan_invalid' | 'engine_error'
  errorMessage?: string
  qaNotes?: Array<{ id: string; author: string; note: string; createdAt: string }>
}

export interface Run {
  id: string
  planId: string
  taskId: string
  taskTitle: string
  websiteName: string
  environment: 'dev' | 'staging' | 'qa' | 'production'
  runNumber: number
  trigger: 'manual' | 'rerun' | 'schedule'
  status: StatusValue
  executor: string
  startedAt: string
  finishedAt?: string
  dateLabel?: string
  durationMs: number
  passRate: number
  triggeredByName: string
  totalCases: number
  passedCases: number
  failedCases: number
  stepLogs: StepLog[]
}

export const INITIAL_RUNS: Record<string, Run> = {
  'run-941': {
    id: 'run-941',
    planId: 'plan-2',
    taskId: 'tsk-200',
    taskTitle: 'Invoice export CSV rules',
    websiteName: 'Billing Admin',
    environment: 'qa',
    runNumber: 941,
    trigger: 'manual',
    status: 'passed',
    executor: 'http',
    startedAt: '2026-11-19T15:25:00Z',
    finishedAt: '2026-11-19T15:25:08Z',
    dateLabel: '2026-11-19 15:25',
    durationMs: 8100,
    passRate: 100,
    triggeredByName: 'Aarav Mehta',
    totalCases: 6,
    passedCases: 6,
    failedCases: 0,
    stepLogs: [],
  },
  'run-940': {
    id: 'run-940',
    planId: 'plan-1',
    taskId: 'tsk-201',
    taskTitle: 'Dispatcher role redirect',
    websiteName: 'Logistics Portal',
    environment: 'staging',
    runNumber: 940,
    trigger: 'manual',
    status: 'failed',
    executor: 'http',
    startedAt: '2026-11-19T14:10:00Z',
    finishedAt: '2026-11-19T14:10:19Z',
    dateLabel: '2026-11-19 14:10',
    durationMs: 19300,
    passRate: 71.4,
    triggeredByName: 'Riya S.',
    totalCases: 7,
    passedCases: 5,
    failedCases: 2,
    stepLogs: [],
  },
  'run-939': {
    id: 'run-939',
    planId: 'plan-3',
    taskId: 'tsk-199',
    taskTitle: 'Guest coupon boundary',
    websiteName: 'Customer Checkout',
    environment: 'production',
    runNumber: 939,
    trigger: 'manual',
    status: 'passed',
    executor: 'http',
    startedAt: '2026-11-19T11:40:00Z',
    finishedAt: '2026-11-19T11:40:07Z',
    dateLabel: '2026-11-19 11:40',
    durationMs: 6800,
    passRate: 100,
    triggeredByName: 'System Automation',
    totalCases: 4,
    passedCases: 4,
    failedCases: 0,
    stepLogs: [],
  },
  'run-937': {
    id: 'run-937',
    planId: 'plan-1',
    taskId: 'tsk-201',
    taskTitle: 'Dispatcher role redirect',
    websiteName: 'Logistics Portal',
    environment: 'staging',
    runNumber: 937,
    trigger: 'manual',
    status: 'passed',
    executor: 'http',
    startedAt: '2026-11-18T18:05:00Z',
    finishedAt: '2026-11-18T18:05:14Z',
    dateLabel: '2026-11-18 18:05',
    durationMs: 14200,
    passRate: 100,
    triggeredByName: 'Alex M.',
    totalCases: 5,
    passedCases: 5,
    failedCases: 0,
    stepLogs: [],
  },
  'run-936': {
    id: 'run-936',
    planId: 'plan-2',
    taskId: 'tsk-200',
    taskTitle: 'TLS timeout check on /health',
    websiteName: 'Billing Admin',
    environment: 'qa',
    runNumber: 936,
    trigger: 'manual',
    status: 'error',
    executor: 'http',
    startedAt: '2026-11-18T09:20:00Z',
    finishedAt: '2026-11-18T09:20:30Z',
    dateLabel: '2026-11-18 09:20',
    durationMs: 30000,
    passRate: 0,
    triggeredByName: 'Audit Cron',
    totalCases: 3,
    passedCases: 0,
    failedCases: 3,
    stepLogs: [],
  },
  // Alias for backward-compat
  'r1': {
    id: 'run-941',
    planId: 'plan-2',
    taskId: 'tsk-200',
    taskTitle: 'Invoice export CSV rules',
    websiteName: 'Billing Admin',
    environment: 'qa',
    runNumber: 941,
    trigger: 'manual',
    status: 'passed',
    executor: 'http',
    startedAt: '2026-11-19T15:25:00Z',
    finishedAt: '2026-11-19T15:25:08Z',
    dateLabel: '2026-11-19 15:25',
    durationMs: 8100,
    passRate: 100,
    triggeredByName: 'Aarav Mehta',
    totalCases: 6,
    passedCases: 6,
    failedCases: 0,
    stepLogs: [],
  },
}
