import type { UserRole } from '@/stores/auth.store'

export interface AuditItem {
  id: string
  timestamp: string
  actor: string
  actorRole: UserRole
  action: string
  entity: string
  diffPreview?: string
}

export const INITIAL_AUDIT_LOGS: AuditItem[] = [
  // Admin activities
  {
    id: 'aud-admin-1',
    timestamp: '2026-11-20 16:55:10',
    actor: 'Alex Chen',
    actorRole: 'admin',
    action: 'provider.updated',
    entity: 'ollama/qwen2.5',
    diffPreview: 'model: "qwen2.5:7b" → "qwen2.5:14b"\nlatency: 28ms\nendpoint: "http://localhost:11434"',
  },
  {
    id: 'aud-admin-2',
    timestamp: '2026-11-20 15:30:22',
    actor: 'Alex Chen',
    actorRole: 'admin',
    action: 'user.role_promoted',
    entity: 'Riya Sharma',
    diffPreview: 'role: "qa_engineer" → "qa_lead"\npermissions: [website.edit, plan.approve, user.invite_employee]',
  },
  {
    id: 'aud-admin-3',
    timestamp: '2026-11-20 14:12:05',
    actor: 'Alex Chen',
    actorRole: 'admin',
    action: 'guardrail.kill_switch',
    entity: 'Staging Environment',
    diffPreview: 'killSwitchStatus: "armed" → "idle"\nreason: "Pre-deployment health validation complete"',
  },
  {
    id: 'aud-admin-4',
    timestamp: '2026-11-20 11:45:00',
    actor: 'Alex Chen',
    actorRole: 'admin',
    action: 'user.invited',
    entity: 'Neha Kapoor',
    diffPreview: 'email: "neha@testingagent.ai"\nrole: "qa_engineer"\nassignedLead: "Riya Sharma"',
  },
  {
    id: 'aud-admin-5',
    timestamp: '2026-11-19 18:20:41',
    actor: 'Alex Chen',
    actorRole: 'admin',
    action: 'security.credentials_rotated',
    entity: 'Billing Admin / Staging',
    diffPreview: 'authFlow: "form"\ncredentialsVault: "AWS_SECRETS_STORE (sealed)"\nstatus: "active"',
  },

  // QA Lead activities
  {
    id: 'aud-lead-1',
    timestamp: '2026-11-20 16:40:12',
    actor: 'Riya Sharma',
    actorRole: 'qa_lead',
    action: 'plan.approved',
    entity: 'plan-108 (v2)',
    diffPreview: 'status: "in_review" → "approved"\napprovedBy: "Riya Sharma"\nsummary: "Verified login and tracking route assertions"',
  },
  {
    id: 'aud-lead-2',
    timestamp: '2026-11-20 15:10:04',
    actor: 'Riya Sharma',
    actorRole: 'qa_lead',
    action: 'user.added',
    entity: 'Karan Verma',
    diffPreview: 'name: "Karan Verma"\nemail: "karan@company.com"\nrole: "qa_engineer"\nassignedLead: "Riya Sharma"',
  },
  {
    id: 'aud-lead-3',
    timestamp: '2026-11-20 13:25:40',
    actor: 'Vikram Patel',
    actorRole: 'qa_lead',
    action: 'website.rules_updated',
    entity: 'Logistics Portal (v4)',
    diffPreview: 'rulesAdded: ["assert: dispatcher role redirects to /tracking", "assert: invalid token 401 response"]\nscope: "staging"',
  },
  {
    id: 'aud-lead-4',
    timestamp: '2026-11-20 12:15:33',
    actor: 'Vikram Patel',
    actorRole: 'qa_lead',
    action: 'user.invited',
    entity: 'Dev Joshi',
    diffPreview: 'email: "dev@company.com"\nrole: "qa_engineer"\nassignedLead: "Vikram Patel"',
  },
  {
    id: 'aud-lead-5',
    timestamp: '2026-11-20 10:02:18',
    actor: 'Riya Sharma',
    actorRole: 'qa_lead',
    action: 'plan.revision_requested',
    entity: 'plan-104 (v1)',
    diffPreview: 'status: "in_review" → "needs_revision"\nfeedbackNote: "Add invalid signature 401 assertion step before final approval"',
  },
  {
    id: 'aud-lead-6',
    timestamp: '2026-11-19 14:15:19',
    actor: 'Aarav Mehta',
    actorRole: 'qa_lead',
    action: 'website.configured',
    entity: 'Customer Checkout',
    diffPreview: 'baseUrl: "https://checkout.staging.internal"\nenvironment: "production"\nauthFlow: "bearer_token"',
  },

  // QA Employee activities
  {
    id: 'aud-emp-1',
    timestamp: '2026-11-20 16:22:45',
    actor: 'Karan Verma',
    actorRole: 'qa_engineer',
    action: 'task.created',
    entity: 'Invoice export CSV rules',
    diffPreview: 'taskTitle: "Invoice export CSV rules"\nwebsite: "Billing Admin"\nenvironment: "qa"\npriority: "P1"',
  },
  {
    id: 'aud-emp-2',
    timestamp: '2026-11-20 16:05:12',
    actor: 'Karan Verma',
    actorRole: 'qa_engineer',
    action: 'run.executed',
    entity: 'run-301 (Invoice export CSV)',
    diffPreview: 'status: "passed"\ndurationMs: 8100\nengine: "gemini-2.5-pro"\npassedCases: 4/4',
  },
  {
    id: 'aud-emp-3',
    timestamp: '2026-11-20 14:50:30',
    actor: 'Elena Rostova',
    actorRole: 'qa_engineer',
    action: 'task.created',
    entity: 'Verify Dispatcher route filters',
    diffPreview: 'title: "Verify Dispatcher route filters"\nstatus: "submitted_for_approval"\ntargetLead: "Riya Sharma"',
  },
  {
    id: 'aud-emp-4',
    timestamp: '2026-11-20 13:40:02',
    actor: 'Karan Verma',
    actorRole: 'qa_engineer',
    action: 'run.triaged',
    entity: 'run-204 (Dispatcher role redirect)',
    diffPreview: 'qaNoteAdded: "Failure caused by transient SSO token timeout on route /tracking. Rerunning with v2 plan."\nauthor: "Karan Verma"',
  },
  {
    id: 'aud-emp-5',
    timestamp: '2026-11-20 11:20:15',
    actor: 'Elena Rostova',
    actorRole: 'qa_engineer',
    action: 'plan.draft_saved',
    entity: 'SSO callback token expiry check',
    diffPreview: 'casesCount: 4\nstepsCount: 7\nengine: "gemini-2.5-pro"\nsubmittedTo: "Riya Sharma"',
  },
  {
    id: 'aud-emp-6',
    timestamp: '2026-11-19 16:30:00',
    actor: 'Meera Nair',
    actorRole: 'qa_engineer',
    action: 'run.executed',
    entity: 'run-209 (Guest coupon boundary)',
    diffPreview: 'status: "passed"\nenvironment: "production"\ndurationMs: 6800\nengine: "gemini-2.5-flash"',
  },
]

