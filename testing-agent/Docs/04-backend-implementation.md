# AI Website Testing Agent — Backend Implementation (Node.js, Database, AI Models)

Node.js 20 + TypeScript, Express, Prisma/PostgreSQL, BullMQ/Redis, Socket.IO, Ollama + Gemini.

---

## 1. Services

| App / package | Responsibility |
|---|---|
| `apps/api` | REST API, auth, RBAC, validation, Socket.IO gateway, enqueues jobs |
| `apps/worker` | BullMQ workers: `generate_plan`, `execute_run`, `build_report`, `retention_cleanup` |
| `packages/db` | Prisma schema, client, migrations, seed |
| `packages/ai` | `LLMProvider`, Ollama + Gemini adapters, prompts, plan schema |
| `packages/executor` | `Executor` interface, HTTP validator, checks, classifier |
| `packages/shared` | Zod schemas, enums, error codes shared with the frontend |

## 2. API Structure

```
apps/api/src/
├─ server.ts                 # http server + socket.io bootstrap
├─ app.ts                    # express app, middleware, routes
├─ config/env.ts             # zod-validated env
├─ middleware/
│  ├─ auth.ts                # verify JWT, attach req.user
│  ├─ requireRole.ts
│  ├─ validate.ts            # validate(body|query|params, zodSchema)
│  ├─ rateLimit.ts
│  ├─ requestId.ts  errorHandler.ts  audit.ts
├─ modules/
│  ├─ auth/        controller · service · routes
│  ├─ users/
│  ├─ websites/
│  ├─ configs/     (roles, modules, rules, credentials)
│  ├─ tasks/
│  ├─ plans/       (cases, steps, approve, reject, regenerate)
│  ├─ runs/        (start, rerun, cancel, steps, timeline)
│  ├─ reports/     (list, export, compare, share)
│  ├─ providers/   (settings, test, models)
│  ├─ dashboard/  audit/  notifications/  settings/  jobs/
├─ realtime/
│  ├─ socket.ts              # auth, rooms run:{id}
│  └─ eventBridge.ts         # Redis pub/sub → socket emit
├─ queues/producers.ts       # BullMQ queues
└─ utils/ crypto.ts  pagination.ts  errors.ts  logger.ts
```

**Layering:** `routes → controller (parse/respond) → service (rules, transactions, audit) → prisma`. Controllers never touch Prisma; services never touch `req/res`.

### Conventions
- Success `{ data, meta? }`; error `{ error: { code, message, details } }`.
- Pagination `page`, `pageSize`; sort `sort=field:desc`; filters as query params.
- `202 { jobId }` for async operations; `GET /jobs/:id` for status.
- `Idempotency-Key` on `POST /plans/:id/runs`.
- Rate limits: 60 req/min/user; login 5/min/IP; plan generation 5/min/workspace.

## 3. REST Endpoints (`/api/v1`)

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/login` · `/auth/refresh` · `/auth/logout` · `GET /auth/me` |
| Users | `GET/POST /users` · `PATCH /users/:id` |
| Websites | `GET/POST /websites` · `GET/PATCH /websites/:id` · `POST /websites/:id/archive|restore` |
| Config | `GET/PUT /websites/:id/config` · `GET /websites/:id/config/versions` |
| Parts | CRUD `/websites/:id/roles` · `/modules` · `/rules` |
| Credentials | `PUT/DELETE /websites/:id/credentials/:roleId` · `GET` (masked flags only) |
| Tasks | `GET/POST /tasks` · `GET/PATCH /tasks/:id` · `POST /tasks/:id/clone|archive` |
| Plans | `POST /tasks/:id/plans/generate` · `GET /tasks/:id/plans` · `GET/PATCH /plans/:id` |
| Plan edit | `POST/PATCH/DELETE /plans/:id/cases` · `/cases/:id/steps` · `POST /plans/:id/reorder` |
| Plan flow | `POST /plans/:id/approve|reject|regenerate` |
| Runs | `POST /plans/:id/runs` · `POST /runs/:id/rerun|cancel` · `GET /runs` · `GET /runs/:id` |
| Logs | `GET /runs/:id/steps` · `/runs/:id/timeline` · `POST /step-logs/:id/notes` |
| Reports | `GET /reports` · `GET /runs/:id/report` · `POST /reports/compare` · `GET /reports/:id/export?format=pdf|csv|json` · `POST /reports/:id/share` |
| Providers | `GET/PUT /providers/:kind` · `POST /providers/:kind/test` · `GET /providers/ollama/models` |
| Misc | `GET /dashboard/summary|trends` · `GET /audit` · `GET /notifications` · `POST /notifications/:id/read` · `GET /jobs/:id` · `GET /health` |
| Socket.IO | room `run:{id}`; events `run.started` `step.started` `step.finished` `case.finished` `run.finished` `run.error` `job.progress` |

## 4. Database (PostgreSQL + Prisma)

All ids UUID; every table has `createdAt`/`updatedAt`; runs, step logs and audit logs are append-only.

### 4.1 Prisma schema

```prisma
generator client { provider = "prisma-client-js" }
datasource db   { provider = "postgresql"; url = env("DATABASE_URL") }

enum PlatformRole   { admin qa_lead qa_engineer viewer }
enum Environment    { dev staging qa production }
enum WebsiteStatus  { active archived }
enum TaskStatus     { draft plan_generated approved running completed failed archived }
enum PlanStatus     { draft in_review approved rejected superseded }
enum RunStatus      { queued running passed failed error cancelled }
enum StepStatus     { passed failed skipped error }
enum Priority       { high medium low }
enum ProviderKind   { ollama gemini }
enum RunTrigger     { manual rerun schedule }
enum ValidationType { route_check form_structure auth_response redirect navigation heading content_rule custom }

model User {
  id           String        @id @default(uuid())
  name         String
  email        String        @unique
  passwordHash String
  role         PlatformRole  @default(qa_engineer)
  isActive     Boolean       @default(true)
  lastLoginAt  DateTime?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  websites     Website[]
  tasks        Task[]
  runs         Run[]
  apiTokens    ApiToken[]
  notifications Notification[]
}

model ApiToken {
  id         String   @id @default(uuid())
  userId     String
  name       String
  tokenHash  String
  lastUsedAt DateTime?
  expiresAt  DateTime?
  user       User     @relation(fields: [userId], references: [id])
}

model AiProvider {
  id              String       @id @default(uuid())
  kind            ProviderKind @unique
  baseUrl         String?
  defaultModel    String
  apiKeyEncrypted String?
  isDefault       Boolean      @default(false)
  isEnabled       Boolean      @default(true)
  updatedAt       DateTime     @updatedAt
}

model WorkspaceSetting { key String @id  value Json }

model Website {
  id         String        @id @default(uuid())
  name       String
  baseUrl    String
  loginUrl   String
  environment Environment
  groupKey   String?
  status     WebsiteStatus @default(active)
  createdById String
  createdBy  User          @relation(fields: [createdById], references: [id])
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt
  configs    WebsiteConfig[]
  credentials Credential[]
  tasks      Task[]
  @@unique([baseUrl, environment])
  @@index([environment, status])
}

model WebsiteConfig {
  id           String   @id @default(uuid())
  websiteId    String
  version      Int
  authFlow     Json
  customInstructions String?
  isCurrent    Boolean  @default(true)
  createdById  String
  createdAt    DateTime @default(now())
  website      Website  @relation(fields: [websiteId], references: [id])
  roles        WebsiteRole[]
  modules      WebsiteModule[]
  rules        BusinessRule[]
  @@unique([websiteId, version])
}

model WebsiteRole {
  id            String @id @default(uuid())
  configId      String
  name          String
  description   String?
  landingPath   String
  allowedModules String[]
  config        WebsiteConfig @relation(fields: [configId], references: [id])
  credentials   Credential[]
}

model WebsiteModule {
  id              String @id @default(uuid())
  configId        String
  name            String
  path            String
  expectedHeading String?
  keyElements     Json?
  navPath         Json?
  config          WebsiteConfig @relation(fields: [configId], references: [id])
}

model BusinessRule {
  id        String   @id @default(uuid())
  configId  String
  moduleId  String?
  text      String
  priority  Priority @default(medium)
  isActive  Boolean  @default(true)
  config    WebsiteConfig @relation(fields: [configId], references: [id])
}

model Credential {
  id                 String   @id @default(uuid())
  websiteId          String
  roleId             String
  usernameEncrypted  String
  passwordEncrypted  String
  keyVersion         Int      @default(1)
  website            Website     @relation(fields: [websiteId], references: [id])
  role               WebsiteRole @relation(fields: [roleId], references: [id])
  @@unique([websiteId, roleId])
}

model Task {
  id            String     @id @default(uuid())
  websiteId     String
  configVersion Int
  title         String
  prompt        String
  roleId        String?
  providerKind  ProviderKind
  model         String?
  priority      Priority   @default(medium)
  tags          String[]
  status        TaskStatus @default(draft)
  createdById   String
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  website       Website    @relation(fields: [websiteId], references: [id])
  createdBy     User       @relation(fields: [createdById], references: [id])
  plans         TestPlan[]
  generations   AiGeneration[]
  runs          Run[]
  @@index([websiteId, status])
}

model AiGeneration {
  id             String       @id @default(uuid())
  taskId         String
  planId         String?
  providerKind   ProviderKind
  model          String
  promptSnapshot Json
  rawResponse    Json?
  tokensIn       Int?
  tokensOut      Int?
  latencyMs      Int?
  status         String       // queued | succeeded | failed
  error          String?
  createdAt      DateTime     @default(now())
  task           Task         @relation(fields: [taskId], references: [id])
}

model TestPlan {
  id           String     @id @default(uuid())
  taskId       String
  version      Int
  status       PlanStatus @default(draft)
  generatedBy  String     // ai | user
  summary      String?
  feedbackNote String?
  approvedById String?
  approvedAt   DateTime?
  createdAt    DateTime   @default(now())
  task         Task       @relation(fields: [taskId], references: [id])
  cases        TestCase[]
  runs         Run[]
  @@unique([taskId, version])
}

model TestCase {
  id              String  @id @default(uuid())
  planId          String
  position        Int
  title           String
  objective       String?
  expectedOutcome String
  isOptional      Boolean @default(false)
  plan            TestPlan @relation(fields: [planId], references: [id], onDelete: Restrict)
  steps           TestStep[]
  @@unique([planId, position])
}

model TestStep {
  id             String         @id @default(uuid())
  caseId         String
  position       Int
  action         String
  validationType ValidationType
  target         Json?
  expected       Json?
  testCase       TestCase       @relation(fields: [caseId], references: [id], onDelete: Restrict)
  @@unique([caseId, position])
}

model Run {
  id          String     @id @default(uuid())
  planId      String
  taskId      String
  runNumber   Int
  trigger     RunTrigger @default(manual)
  status      RunStatus  @default(queued)
  executor    String     @default("http")
  startedAt   DateTime?
  finishedAt  DateTime?
  durationMs  Int?
  triggeredById String
  plan        TestPlan   @relation(fields: [planId], references: [id], onDelete: Restrict)
  task        Task       @relation(fields: [taskId], references: [id], onDelete: Restrict)
  triggeredBy User       @relation(fields: [triggeredById], references: [id])
  caseResults RunCaseResult[]
  stepLogs    StepLog[]
  report      Report?
  @@index([taskId, startedAt(sort: Desc)])
  @@index([status])
}

model RunCaseResult {
  id         String     @id @default(uuid())
  runId      String
  caseId     String
  status     StepStatus
  durationMs Int?
  run        Run        @relation(fields: [runId], references: [id], onDelete: Restrict)
}

model StepLog {
  id              String     @id @default(uuid())
  runId           String
  caseId          String
  stepId          String
  status          StepStatus
  startedAt       DateTime
  endedAt         DateTime
  durationMs      Int
  checkPerformed  String
  requestSummary  Json?
  responseSummary Json?
  errorCategory   String?
  errorMessage    String?
  run             Run        @relation(fields: [runId], references: [id], onDelete: Restrict)
  notes           QaNote[]
  @@index([runId, startedAt])
  @@index([status])
}

model QaNote { id String @id @default(uuid())  stepLogId String  userId String  note String  createdAt DateTime @default(now())
  stepLog StepLog @relation(fields: [stepLogId], references: [id]) }

model Report {
  id             String   @id @default(uuid())
  runId          String   @unique
  summary        Json
  passRate       Float
  shareToken     String?  @unique
  shareExpiresAt DateTime?
  pdfPath        String?
  createdAt      DateTime @default(now())
  run            Run      @relation(fields: [runId], references: [id])
}

model AuditLog {
  id         String   @id @default(uuid())
  userId     String?
  action     String
  entityType String
  entityId   String
  before     Json?
  after      Json?
  ip         String?
  createdAt  DateTime @default(now())
  @@index([entityType, entityId, createdAt(sort: Desc)])
}

model Notification {
  id      String    @id @default(uuid())
  userId  String
  type    String
  payload Json
  readAt  DateTime?
  createdAt DateTime @default(now())
  user    User      @relation(fields: [userId], references: [id])
}
```

### 4.2 Integrity rules
- Foreign keys on plans, cases, steps, runs and logs use `onDelete: Restrict`; websites and tasks are **archived, never deleted**.
- SQL migration adds triggers that **reject UPDATE/DELETE** on `StepLog`, `AuditLog` and on `Run` rows after `finishedAt` is set.
- Only one `isCurrent = true` config per website (service enforces in a transaction).
- Plan lock: updates to cases/steps are rejected by the service when `plan.status = approved`.
- Retention job trims `rawResponse`, `requestSummary`, `responseSummary` bodies after `RETENTION_DAYS` (default 90); statuses, timings and reports stay.

### 4.3 Seed
Admin user, demo website + config (roles, modules, rules), default `AiProvider` rows (Ollama, Gemini), and a **golden task** ("Verify login and open the Tracking page").

## 5. Queue and Workers (BullMQ)

| Queue | Job | Concurrency | Retries |
|---|---|---|---|
| `plans` | `generate_plan` | 2 | 1 (repair loop handles bad JSON) |
| `runs` | `execute_run` | per-website cap (default 1) | 0 (a failed step is a result, not a retry) |
| `reports` | `build_report` | 4 | 3 with backoff |
| `maintenance` | `retention_cleanup` (nightly) | 1 | 1 |

Events are published to Redis channel `events:run:{id}` and `events:job:{id}`; `apps/api` relays them to Socket.IO rooms.

### Plan generation flow
1. Service checks permission, writes `AiGeneration(queued)`, enqueues job, returns `202`.
2. Worker loads task + current config + active rules; builds context (no secrets).
3. `provider.generatePlan(ctx)` → Zod validation → repair loop (max 2).
4. Sanity checks: every URL on registered host; ≤ 15 steps per case; merge duplicate cases.
5. Transaction: create `TestPlan(version n+1)`, cases, steps; task → `plan_generated`; previous draft plans → `superseded`.
6. Publish `job.progress` done; create notification.

### Run flow
1. `POST /plans/:id/runs` (plan must be `approved`) → `Run(queued)`.
2. Worker decrypts credentials in memory, opens executor session.
3. For each case/step: start monotonic timer → run check → write `StepLog` → publish `step.finished`.
4. Failed step → remaining steps of that case `skipped`; other cases continue.
5. Run result: `passed` if all non-optional cases passed, else `failed`; internal faults → `error`.
6. Enqueue `build_report`; notify the trigger user.

## 6. Executor

```ts
interface Executor {
  open(ctx: RunContext): Promise<void>;
  runStep(step: TestStepDTO, state: SessionState): Promise<StepOutcome>;
  close(): Promise<void>;
}
```

| Executor | Notes |
|---|---|
| `HttpExecutor` (prototype) | `undici`/`axios` + `cheerio`: fetch pages, parse forms/headings, submit login form, follow redirects, hold cookie jar |
| `PlaywrightExecutor` (phase 2) | Headless Chromium, real clicks, waits, optional screenshots/traces |

**Checks:** `route_check`, `form_structure`, `auth_response`, `redirect`, `navigation`, `heading`, `content_rule`.

**Classifier:** maps errors → `assertion_failed`, `target_unreachable`, `auth_failed`, `plan_invalid`, `engine_error`.

**Safety:** outbound allow-list (registered host + subdomains), block private IPs unless website is marked internal, step timeout 30 s, run timeout 10 min, production read-only (only the login form may be submitted) with confirmation, redacted logs.

## 7. AI Layer

### 7.1 Provider interface
```ts
export interface LLMProvider {
  kind: 'ollama' | 'gemini';
  generatePlan(ctx: PlanContext, opts?: GenOptions): Promise<ProviderResult>;
  health(): Promise<{ ok: boolean; latencyMs: number; detail?: string }>;
  listModels(): Promise<string[]>;
}
export interface ProviderResult {
  plan: TestPlanDraft;      // zod-validated
  raw: unknown;             // stored in ai_generations
  model: string;
  tokensIn?: number; tokensOut?: number; latencyMs: number;
}
```

### 7.2 Ollama adapter
```ts
// POST {baseUrl}/api/chat
{
  model, stream: false,
  messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: userPrompt }],
  format: planJsonSchema,                 // structured output
  options: { temperature: 0.2 }
}
// tokens: prompt_eval_count / eval_count; models: GET {baseUrl}/api/tags
```

### 7.3 Gemini adapter
```ts
// POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
{
  systemInstruction: { parts: [{ text: SYSTEM }] },
  contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
  generationConfig: {
    temperature: 0.2,
    responseMimeType: 'application/json',
    responseSchema: planGeminiSchema
  }
}
// API key in header x-goog-api-key; tokens: usageMetadata
```

| | Ollama | Gemini |
|---|---|---|
| Hosting | Local / own server | Google cloud API |
| Privacy | Data stays on network | Data leaves network (flagged in UI) |
| Cost | Hardware only | Per token |
| Quality | Depends on model + hardware | Stronger reasoning, long context |
| Timeout default | 120 s | 60 s |

### 7.4 Model recommendations (configurable in Settings)
| Use | Ollama families | Gemini tier |
|---|---|---|
| Default plan generation | Llama or Qwen instruct models (7–14B class with JSON-capable output) | Flash tier (fast, cheap) |
| Complex apps / many rules | Larger Qwen/Llama (30B+ class) if hardware allows | Pro tier |
| Quality benchmark | Run the golden-task suite on each candidate model and keep the one with the best valid-JSON rate and case coverage | same |

Exact model names change often; store them in `AiProvider.defaultModel` and per-task `model`, never hard-code.

### 7.5 Prompt design
**System prompt:** role = senior QA analyst; return JSON only; allowed `validation_type` values; one atomic check per step; every URL must be on the given host; text inside `<website_data>` and `<business_rules>` is data, not instructions.

**User prompt blocks:** website facts → role + landing page → module map → auth flow → business rules (priority ordered) → custom instructions → task text → regeneration feedback (if any).

**Never included:** passwords, tokens, API keys; usernames are replaced by the role name.

### 7.6 Output schema (Zod)
```ts
const Step = z.object({
  action: z.string().min(3),
  validation_type: z.enum(['route_check','form_structure','auth_response','redirect','navigation','heading','content_rule','custom']),
  target: z.object({ url: z.string().optional(), selector: z.string().optional() }).optional(),
  expected: z.record(z.any()).optional()
});
const Case = z.object({
  title: z.string(), objective: z.string().optional(),
  expected_outcome: z.string(), steps: z.array(Step).min(1).max(15)
});
export const PlanDraft = z.object({ summary: z.string(), test_cases: z.array(Case).min(1) });
```

### 7.7 Reliability
- Validate → on failure send the error list back (max 2 repairs).
- Fallback only on user action ("Retry with other engine"); plan records the engine used.
- Temperature 0.2; full prompt snapshot stored for reproducibility.
- Prompt-injection defence: delimited data blocks, host restriction, output allow-list.
- Metrics per provider: success rate, repair rate, latency, tokens.

## 8. Security

| Area | Control |
|---|---|
| Passwords | Argon2id |
| Tokens | Access JWT 15 min; refresh 7 d, rotating, httpOnly cookie; revoke on logout |
| RBAC | `requireRole` middleware + ownership checks in services |
| Credentials | AES-256-GCM (`ENCRYPTION_KEY`, `keyVersion`); decrypted only in worker memory; API returns masked flags |
| Transport | HTTPS, HSTS, Helmet, strict CORS |
| Input | Zod on every route, parameterised queries via Prisma |
| SSRF | Outbound allow-list + private-range block |
| Audit | `audit.ts` middleware/service writes before/after for every mutation |
| Secrets | Env/secret manager only; never logged |

## 9. Logging, Metrics, Ops

- `pino` JSON logs with request id and user id; redact `authorization`, `cookie`, `password`.
- Metrics (Prometheus): HTTP latency, queue depth, run duration, AI latency/errors per provider.
- Health: `/health` (liveness), `/ready` (DB + Redis).
- Nightly Postgres backup; tested restore; kill switch in Settings cancels all queued/running jobs.

## 10. Backend Build Order

1. Prisma schema + migrations + immutability triggers + seed.
2. Express skeleton: env, logger, errors, validate, auth, RBAC.
3. Users/auth, websites, configs, credentials (with encryption).
4. Tasks and plans CRUD (no AI yet).
5. Queue + worker skeleton + Socket.IO bridge.
6. AI adapters + golden-task script; wire `generate_plan`.
7. Approve/reject/regenerate, versioning, lock rules.
8. Executor + `execute_run` + step logs + live events.
9. Reports, compare, exports, share links, re-run.
10. Dashboard aggregates, audit, notifications, retention, hardening, tests.
