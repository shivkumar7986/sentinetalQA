export type ValidationType =
  | 'route_check'
  | 'form_structure'
  | 'auth_response'
  | 'redirect'
  | 'navigation'
  | 'heading'
  | 'content_rule'
  | 'custom'

export interface TestStep {
  id: string
  position: number
  action: string
  validationType: ValidationType
  target?: {
    url?: string
    selector?: string
  }
  expected?: Record<string, any>
}

export interface TestCase {
  id: string
  position: number
  title: string
  objective?: string
  expectedOutcome: string
  isOptional: boolean
  steps: TestStep[]
}

export interface TestPlan {
  id: string
  taskId: string
  version: number
  status: 'draft' | 'in_review' | 'approved' | 'rejected' | 'superseded'
  generatedBy: 'ai' | 'user'
  summary: string
  feedbackNote?: string
  approvedById?: string
  approvedAt?: string
  createdAt: string
  engine: 'ollama' | 'gemini'
  model: string
  tokensUsed?: number
  cases: TestCase[]
}

export const INITIAL_PLANS: Record<string, TestPlan> = {
  'plan-1': {
    id: 'plan-1',
    taskId: 'task-1',
    version: 1,
    status: 'approved',
    generatedBy: 'ai',
    engine: 'ollama',
    model: 'qwen2.5:14b',
    tokensUsed: 1420,
    approvedById: '2',
    approvedAt: '2026-11-18T15:00:00Z',
    createdAt: '2026-11-18T14:35:00Z',
    summary: 'Plan contains 5 atomic test cases covering login route verification, credential input validation, session redirect, dashboard access, and tracking map loading with expected headings.',
    cases: [
      {
        id: 'case-1',
        position: 1,
        title: 'Verify Login Route and Form Structure',
        objective: 'Ensure the login endpoint is accessible with valid input controls',
        expectedOutcome: 'Login page renders with HTTP 200, containing email, password, and submit button.',
        isOptional: false,
        steps: [
          {
            id: 'step-1-1',
            position: 1,
            action: 'Send GET request to login URL',
            validationType: 'route_check',
            target: { url: 'https://staging.truckhub.internal/login' },
            expected: { status: 200, noRedirectLoop: true },
          },
          {
            id: 'step-1-2',
            position: 2,
            action: 'Verify email, password inputs and submit button presence',
            validationType: 'form_structure',
            target: { selector: 'form' },
            expected: { fields: ['email', 'password'], submitSelector: 'button[type="submit"]' },
          },
        ],
      },
      {
        id: 'case-2',
        position: 2,
        title: 'Submit Dispatcher Credentials & Issue Session',
        objective: 'Authenticate with Dispatcher role credentials',
        expectedOutcome: 'Server validates credentials and issues an active session cookie.',
        isOptional: false,
        steps: [
          {
            id: 'step-2-1',
            position: 1,
            action: 'Enter Dispatcher username into email input',
            validationType: 'custom',
            target: { selector: 'input[name="email"]' },
            expected: { fieldValid: true },
          },
          {
            id: 'step-2-2',
            position: 2,
            action: 'Enter Dispatcher password into password input',
            validationType: 'custom',
            target: { selector: 'input[name="password"]' },
            expected: { fieldValid: true },
          },
          {
            id: 'step-2-3',
            position: 3,
            action: 'Submit login form and receive session cookie',
            validationType: 'auth_response',
            target: { selector: 'button[type="submit"]' },
            expected: { status: 200, sessionIssued: true },
          },
        ],
      },
      {
        id: 'case-3',
        position: 3,
        title: 'Verify Post-Login Role Redirect to Dashboard',
        objective: 'Confirm user lands on the designated role landing page',
        expectedOutcome: 'Browser redirects to /dashboard with session active.',
        isOptional: false,
        steps: [
          {
            id: 'step-3-1',
            position: 1,
            action: 'Verify browser redirects to Dispatcher landing route',
            validationType: 'redirect',
            target: { url: '/dashboard' },
            expected: { expectedPath: '/dashboard' },
          },
          {
            id: 'step-3-2',
            position: 2,
            action: 'Verify Operations Overview heading on dashboard',
            validationType: 'heading',
            target: { selector: 'h1' },
            expected: { containsText: 'Operations Overview' },
          },
        ],
      },
      {
        id: 'case-4',
        position: 4,
        title: 'Navigate to Real-Time Tracking Page',
        objective: 'Ensure navigation from dashboard to tracking route functions',
        expectedOutcome: 'Tracking page route loads with HTTP 200.',
        isOptional: false,
        steps: [
          {
            id: 'step-4-1',
            position: 1,
            action: 'Click Live Tracking link in sidebar',
            validationType: 'navigation',
            target: { url: '/tracking' },
            expected: { status: 200, destination: '/tracking' },
          },
        ],
      },
      {
        id: 'case-5',
        position: 5,
        title: 'Validate Tracking Map and Business Rules',
        objective: 'Ensure map container loads and maintenance vehicles are filtered',
        expectedOutcome: 'Live map renders with search control, and no maintenance vehicles are displayed.',
        isOptional: false,
        steps: [
          {
            id: 'step-5-1',
            position: 1,
            action: 'Check for #map-container element',
            validationType: 'heading',
            target: { selector: '#map-container' },
            expected: { present: true },
          },
          {
            id: 'step-5-2',
            position: 2,
            action: 'Verify vehicle maintenance rule filter on active fleet layer',
            validationType: 'content_rule',
            expected: { excludesStatus: 'Maintenance' },
          },
        ],
      },
    ],
  },
  'plan-3': {
    id: 'plan-3',
    taskId: 'tsk-201',
    version: 2,
    status: 'in_review',
    generatedBy: 'ai',
    engine: 'ollama',
    model: 'ollama/qwen2.5:14b',
    tokensUsed: 1420,
    createdAt: '2026-11-19T10:30:00Z',
    summary: 'Plan Review · Verify login and open Tracking',
    cases: [
      {
        id: 'case-1',
        position: 1,
        title: 'Login route and form accessible',
        objective: 'Confirm /login loads 200 and exposes email/password inputs',
        expectedOutcome: 'Login form rendered without redirect loop',
        isOptional: false,
        steps: [
          {
            id: 'step-1-1',
            position: 1,
            action: 'Open login page',
            validationType: 'route_check',
            target: { url: '/login' },
            expected: { text: 'HTTP 200' },
          },
          {
            id: 'step-1-2',
            position: 2,
            action: 'Verify form fields',
            validationType: 'form_structure',
            target: { selector: 'form#login' },
            expected: { text: 'email, password, submit' },
          },
        ],
      },
      {
        id: 'case-2',
        position: 2,
        title: 'Credentials validated and session issued',
        objective: 'Submit Dispatcher credentials via auth endpoint',
        expectedOutcome: 'Session cookie sid issued',
        isOptional: false,
        steps: [
          {
            id: 'step-2-1',
            position: 1,
            action: 'Submit Dispatcher credentials',
            validationType: 'auth_response',
            target: { url: '/api/auth/login' },
            expected: { text: 'Session cookie sid issued' },
          },
          {
            id: 'step-2-2',
            position: 2,
            action: 'Validate session cookie',
            validationType: 'auth_response',
            target: { selector: 'cookie.sid' },
            expected: { text: 'HTTP 200' },
          },
        ],
      },
      {
        id: 'case-3',
        position: 3,
        title: 'Dispatcher role redirected to Dashboard',
        objective: 'Verify post-login role landing path',
        expectedOutcome: 'URL resolves to /dashboard',
        isOptional: false,
        steps: [
          {
            id: 'step-3-1',
            position: 1,
            action: 'Verify post-login redirect',
            validationType: 'redirect',
            target: { url: '/dashboard' },
            expected: { text: '/dashboard' },
          },
        ],
      },
      {
        id: 'case-4',
        position: 4,
        title: 'Dashboard to Tracking navigation works',
        objective: 'Navigate via sidebar link to /tracking',
        expectedOutcome: 'Tracking page loads cleanly',
        isOptional: false,
        steps: [
          {
            id: 'step-4-1',
            position: 1,
            action: 'Navigate via sidebar link',
            validationType: 'navigation',
            target: { url: '/tracking' },
            expected: { text: 'Tracking page loads cleanly' },
          },
        ],
      },
      {
        id: 'case-5',
        position: 5,
        title: 'Tracking heading & business rule met',
        objective: 'Assert heading text and unauthenticated protection rule',
        expectedOutcome: "Heading matches 'Live Shipment Tracking'",
        isOptional: true,
        steps: [
          {
            id: 'step-5-1',
            position: 1,
            action: 'Assert heading text',
            validationType: 'heading',
            target: { selector: 'h1' },
            expected: { text: 'Live Shipment Tracking' },
          },
        ],
      },
    ],
  },
}

