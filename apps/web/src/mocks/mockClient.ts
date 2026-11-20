import { INITIAL_WEBSITES, type Website } from './data/websites.mock'
import { INITIAL_CONFIGS, type FullWebsiteConfig } from './data/configs.mock'
import { INITIAL_TASKS, type Task } from './data/tasks.mock'
import { INITIAL_PLANS, type TestPlan, type TestCase, type TestStep } from './data/plans.mock'
import { INITIAL_RUNS, type Run, type StepLog } from './data/runs.mock'

const STORAGE_KEYS = {
  websites: 'testing_agent_mock_websites',
  configs: 'testing_agent_mock_configs',
  tasks: 'testing_agent_mock_tasks',
  plans: 'testing_agent_mock_plans',
  runs: 'testing_agent_mock_runs',
}

function loadState<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw =
      localStorage.getItem(key) ||
      localStorage.getItem(key.replace('testing_agent', 'sentinel'))
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveState<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {}
}

export const mockClient = {
  // Websites
  getWebsites: async (): Promise<Website[]> => {
    return loadState(STORAGE_KEYS.websites, INITIAL_WEBSITES)
  },

  getWebsiteById: async (id: string): Promise<Website | null> => {
    const all = await mockClient.getWebsites()
    return all.find((w) => w.id === id) || null
  },

  createWebsite: async (data: Omit<Website, 'id' | 'createdAt' | 'updatedAt' | 'taskCount'>): Promise<Website> => {
    const all = await mockClient.getWebsites()
    const newSite: Website = {
      ...data,
      id: `web-${Date.now()}`,
      taskCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const updated = [newSite, ...all]
    saveState(STORAGE_KEYS.websites, updated)
    return newSite
  },

  updateWebsite: async (id: string, updates: Partial<Website>): Promise<Website> => {
    const all = await mockClient.getWebsites()
    const idx = all.findIndex((w) => w.id === id)
    if (idx === -1) throw new Error('Website not found')
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() }
    saveState(STORAGE_KEYS.websites, all)
    return all[idx]
  },

  archiveWebsite: async (id: string): Promise<Website> => {
    return mockClient.updateWebsite(id, { status: 'archived' })
  },

  restoreWebsite: async (id: string): Promise<Website> => {
    return mockClient.updateWebsite(id, { status: 'active' })
  },

  // Configs
  getConfigByWebsiteId: async (websiteId: string): Promise<FullWebsiteConfig> => {
    const allConfigs = loadState(STORAGE_KEYS.configs, INITIAL_CONFIGS)
    return (
      allConfigs[websiteId] || {
        websiteId,
        version: 1,
        roles: [],
        modules: [],
        authFlow: {
          method: 'form',
          usernameSelector: 'input[name="username"]',
          passwordSelector: 'input[name="password"]',
          submitSelector: 'button[type="submit"]',
          successIndicatorSelector: 'body',
          redirectTarget: '/dashboard',
        },
        businessRules: [],
        customInstructions: '',
        credentials: [],
        versions: [{ version: 1, createdAt: new Date().toISOString(), author: 'System', summary: 'Initial blank config' }],
      }
    )
  },

  updateConfig: async (websiteId: string, updates: Partial<FullWebsiteConfig>, customSummary?: string): Promise<FullWebsiteConfig> => {
    const allConfigs = loadState(STORAGE_KEYS.configs, INITIAL_CONFIGS)
    const current = allConfigs[websiteId] || await mockClient.getConfigByWebsiteId(websiteId)
    const newVersion = current.version + 1
    const summaryText = customSummary || 'Updated configuration'
    const updated: FullWebsiteConfig = {
      ...current,
      ...updates,
      version: newVersion,
      versions: [
        {
          version: newVersion,
          title: summaryText,
          category: 'General',
          createdAt: new Date().toISOString(),
          author: 'Admin',
          summary: summaryText,
        },
        ...current.versions,
      ],
    }
    allConfigs[websiteId] = updated
    saveState(STORAGE_KEYS.configs, allConfigs)
    return updated
  },

  // Tasks
  getTasks: async (filters?: { websiteId?: string }): Promise<Task[]> => {
    const all = loadState(STORAGE_KEYS.tasks, INITIAL_TASKS)
    if (filters?.websiteId) {
      return all.filter((t: Task) => t.websiteId === filters.websiteId)
    }
    return all
  },

  getTaskById: async (id: string): Promise<Task | null> => {
    const all = await mockClient.getTasks()
    return all.find((t) => t.id === id) || null
  },

  createTask: async (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: Task['status'] }): Promise<Task> => {
    const all = await mockClient.getTasks()
    const newTask: Task = {
      ...data,
      id: `task-${Date.now()}`,
      status: data.status || 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const updated = [newTask, ...all]
    saveState(STORAGE_KEYS.tasks, updated)
    return newTask
  },

  // Plans
  getPlans: async (): Promise<TestPlan[]> => {
    const all = loadState<Record<string, TestPlan>>(STORAGE_KEYS.plans, INITIAL_PLANS)
    return Object.values(all)
  },

  getPlanById: async (planId: string): Promise<TestPlan | null> => {
    const all = loadState(STORAGE_KEYS.plans, INITIAL_PLANS)
    return all[planId] || null
  },

  generatePlan: async (taskId: string, feedback?: string): Promise<TestPlan> => {
    const task = await mockClient.getTaskById(taskId)
    if (!task) throw new Error('Task not found')

    const planId = `plan-${Date.now()}`
    const newPlan: TestPlan = {
      id: planId,
      taskId,
      version: 1,
      status: 'in_review',
      generatedBy: 'ai',
      engine: task.providerKind === 'gemini' ? 'gemini' : 'ollama',
      model: task.model || 'ollama/qwen2.5:14b',
      tokensUsed: 1250,
      createdAt: new Date().toISOString(),
      summary: `AI generated 4 atomic test cases for testing goal: "${task.title}". Includes authentication, navigation, and rule assertions.`,
      cases: [
        {
          id: `case-${Date.now()}-1`,
          position: 1,
          title: 'Verify endpoint connectivity and status',
          objective: 'Ensure target route returns HTTP 200 without loop',
          expectedOutcome: 'Target page loads with 200 OK.',
          isOptional: false,
          steps: [
            {
              id: `step-${Date.now()}-1`,
              position: 1,
              action: 'Open target application page',
              validationType: 'route_check',
              expected: { status: 200 },
            },
          ],
        },
        {
          id: `case-${Date.now()}-2`,
          position: 2,
          title: 'Validate UI controls and form inputs',
          objective: 'Ensure all required fields exist and accept input',
          expectedOutcome: 'Form controls are interactable.',
          isOptional: false,
          steps: [
            {
              id: `step-${Date.now()}-2`,
              position: 1,
              action: 'Check for essential input elements',
              validationType: 'form_structure',
              expected: { formPresent: true },
            },
          ],
        },
        {
          id: `case-${Date.now()}-3`,
          position: 3,
          title: 'Execute authentication / action sequence',
          objective: 'Simulate workflow according to configured rules',
          expectedOutcome: 'Action completes and issues valid state response.',
          isOptional: false,
          steps: [
            {
              id: `step-${Date.now()}-3`,
              position: 1,
              action: 'Execute action payload',
              validationType: 'custom',
              expected: { success: true },
            },
          ],
        },
      ],
    }

    const allPlans = loadState(STORAGE_KEYS.plans, INITIAL_PLANS)
    allPlans[planId] = newPlan
    saveState(STORAGE_KEYS.plans, allPlans)

    // Update task
    await mockClient.updateTask(taskId, { status: 'plan_generated', currentPlanId: planId })

    return newPlan
  },

  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const all = await mockClient.getTasks()
    const idx = all.findIndex((t) => t.id === id)
    if (idx === -1) throw new Error('Task not found')
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() }
    saveState(STORAGE_KEYS.tasks, all)
    return all[idx]
  },

  approvePlan: async (planId: string): Promise<TestPlan> => {
    const allPlans = loadState(STORAGE_KEYS.plans, INITIAL_PLANS)
    const plan = allPlans[planId]
    if (!plan) throw new Error('Plan not found')
    plan.status = 'approved'
    plan.approvedAt = new Date().toISOString()
    plan.approvedById = 'user-current'
    allPlans[planId] = plan
    saveState(STORAGE_KEYS.plans, allPlans)

    // Update task status
    await mockClient.updateTask(plan.taskId, { status: 'approved' })
    return plan
  },

  updatePlanCases: async (planId: string, cases: TestCase[]): Promise<TestPlan> => {
    const allPlans = loadState(STORAGE_KEYS.plans, INITIAL_PLANS)
    const plan = allPlans[planId]
    if (!plan) throw new Error('Plan not found')
    if (plan.status === 'approved') {
      // Lock rule: approved plan cannot be edited directly; creates vN+1
      const newPlanId = `plan-${Date.now()}`
      const newVersion: TestPlan = {
        ...plan,
        id: newPlanId,
        version: plan.version + 1,
        status: 'in_review',
        approvedAt: undefined,
        approvedById: undefined,
        createdAt: new Date().toISOString(),
        cases,
      }
      allPlans[newPlanId] = newVersion
      saveState(STORAGE_KEYS.plans, allPlans)
      await mockClient.updateTask(plan.taskId, { currentPlanId: newPlanId, status: 'plan_generated' })
      return newVersion
    }
    plan.cases = cases
    allPlans[planId] = plan
    saveState(STORAGE_KEYS.plans, allPlans)
    return plan
  },

  // Runs
  getRuns: async (): Promise<Run[]> => {
    const runsMap = loadState(STORAGE_KEYS.runs, INITIAL_RUNS)
    const unique = Array.from(new Map(Object.values(runsMap).map((r: any) => [r.id, r])).values())
    return (unique as Run[]).sort(
      (a: Run, b: Run) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    )
  },

  getRunById: async (id: string): Promise<Run | null> => {
    const runsMap = loadState(STORAGE_KEYS.runs, INITIAL_RUNS)
    return runsMap[id] || null
  },

  triggerRun: async (planId: string): Promise<Run> => {
    const plan = await mockClient.getPlanById(planId)
    if (!plan) throw new Error('Plan not found')
    const task = await mockClient.getTaskById(plan.taskId)
    if (!task) throw new Error('Task not found')

    const runId = `run-${Date.now()}`
    const newRun: Run = {
      id: runId,
      planId,
      taskId: task.id,
      taskTitle: task.title,
      websiteName: task.websiteName,
      environment: 'staging',
      runNumber: Math.floor(Math.random() * 900) + 100,
      trigger: 'manual',
      status: 'running',
      executor: 'http',
      startedAt: new Date().toISOString(),
      durationMs: 0,
      passRate: 0,
      triggeredByName: 'Current User',
      totalCases: plan.cases.length,
      passedCases: 0,
      failedCases: 0,
      stepLogs: [],
    }

    const runsMap = loadState(STORAGE_KEYS.runs, INITIAL_RUNS)
    runsMap[runId] = newRun
    saveState(STORAGE_KEYS.runs, runsMap)

    await mockClient.updateTask(task.id, { status: 'running' })
    return newRun
  },

  addQaNoteToStepLog: async (runId: string, logId: string, noteText: string, author: string): Promise<Run> => {
    const runsMap = loadState(STORAGE_KEYS.runs, INITIAL_RUNS)
    const run = runsMap[runId]
    if (!run) throw new Error('Run not found')
    const log = run.stepLogs.find((l: StepLog) => l.id === logId)
    if (!log) throw new Error('Step log not found')
    if (!log.qaNotes) log.qaNotes = []
    log.qaNotes.push({
      id: `note-${Date.now()}`,
      author,
      note: noteText,
      createdAt: new Date().toISOString(),
    })
    runsMap[runId] = run
    saveState(STORAGE_KEYS.runs, runsMap)
    return run
  },
}

