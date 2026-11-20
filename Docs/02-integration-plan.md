# AI Website Testing Agent — Integration Plan (Next.js + Node.js)

How the Next.js frontend, Node.js backend, queue workers, database and AI engines fit together, which tools to use, and why.

---

## 1. Architecture at a Glance

```
┌──────────────────────┐        REST + WebSocket        ┌────────────────────────┐
│  Next.js dashboard   │ ─────────────────────────────► │  Node.js API (Express) │
│  (apps/web)          │ ◄───────────────────────────── │  (apps/api)            │
└──────────────────────┘                                └───────┬────────┬───────┘
                                                                │        │
                                                     Prisma     │        │ BullMQ (enqueue)
                                                                ▼        ▼
                                                        ┌───────────┐  ┌───────────┐
                                                        │ PostgreSQL│  │   Redis   │
                                                        └───────────┘  └─────┬─────┘
                                                                ▲            │ jobs
                                                                │            ▼
                                                        ┌───────┴──────────────────┐
                                                        │ Worker (apps/worker)     │
                                                        │ plan jobs · runs · reports│
                                                        └───┬──────────┬───────────┘
                                                            │          │
                                                  ┌─────────▼──┐  ┌────▼────────┐  ┌──────────────┐
                                                  │ Ollama     │  │ Gemini API  │  │ Target site  │
                                                  │ (local)    │  │ (cloud)     │  │ (checks)     │
                                                  └────────────┘  └─────────────┘  └──────────────┘
```

**Principle:** the API never waits on a model or a target website. It saves state, enqueues a job, and returns a job id. Workers do slow work and publish progress through Redis; the API relays it to the browser over WebSocket.

## 2. Tech Stack and Why

| Layer | Choice | Why |
|---|---|---|
| Frontend | **Next.js (App Router), React, TypeScript** | File-based routing, layouts for the admin shell, great DX |
| Styling | **Tailwind CSS + shadcn/ui (Radix)** | Token-driven, accessible primitives, minimal look |
| Server state | **TanStack Query** | Caching, polling, optimistic updates |
| UI state | **Zustand** | Tiny global store (sidebar, filters) |
| Forms | **React Hook Form + Zod** | Same schemas as the backend |
| Charts / tables | **Recharts / TanStack Table** | Dashboard trends, data grids |
| Backend | **Node.js 20+, Express, TypeScript** | Matches existing team stack; huge ecosystem |
| Validation | **Zod** | One schema for requests, responses and AI JSON output |
| ORM | **Prisma** | Typed queries, migrations |
| Database | **PostgreSQL** | Relational integrity; JSONB for AI payloads |
| Queue | **BullMQ on Redis** | Reliable jobs, retries, concurrency limits |
| Real time | **Socket.IO** | Rooms per run, reconnect handling |
| AI | **Ollama REST + Gemini API** behind a provider adapter | Local privacy or cloud strength per task |
| Auth | **JWT access + refresh (httpOnly cookie)**, argon2 | Stateless API, safe browser storage |
| Execution | **HTTP validator now, Playwright later** | Ship fast, upgrade without schema change |
| Infra | **Docker Compose**, GitHub Actions | One-command setup, simple CI |
| Tooling | **pnpm workspaces + Turborepo**, ESLint, Prettier, Vitest, Playwright | Fast monorepo builds and tests |

> Alternative backend: FastAPI (Python) works equally well; this plan uses Node because the team already works in Express/Socket.IO/Redis.

## 3. Monorepo Layout

```
ai-test-agent/
├─ apps/
│  ├─ web/            # Next.js dashboard
│  ├─ api/            # Express REST + Socket.IO gateway
│  └─ worker/         # BullMQ workers (plan, run, report)
├─ packages/
│  ├─ shared/         # Zod schemas, TS types, enums, error codes
│  ├─ db/             # Prisma schema, client, migrations, seed
│  ├─ ai/             # LLMProvider interface, Ollama + Gemini adapters, prompts
│  ├─ executor/       # Executor interface, HTTP validator, checks
│  └─ config/         # eslint, tsconfig, tailwind presets
├─ docker/            # compose files, Dockerfiles
├─ .github/workflows/
├─ turbo.json  pnpm-workspace.yaml  .env.example
```

Why a monorepo: `packages/shared` gives the frontend and backend the **same Zod schemas and types**, so a contract change breaks the build instead of production.

## 4. Integration Contracts

### 4.1 REST
- Base path `/api/v1`, JSON only.
- Success: `{ "data": ..., "meta": { "page", "pageSize", "total" } }`.
- Error: `{ "error": { "code": "PLAN_LOCKED", "message": "...", "details": {} } }` with stable codes from `packages/shared`.
- Long operations return `202 { "data": { "jobId": "..." } }`.
- `Idempotency-Key` header on run creation.
- Typed client: generate OpenAPI from Zod (`zod-to-openapi`) and a client for `apps/web`, or import shared Zod types directly.

### 4.2 Auth flow
1. `POST /auth/login` → returns **access token (15 min)** in the body; sets **refresh token** as httpOnly, Secure, SameSite=Lax cookie.
2. Web keeps the access token **in memory** (Zustand), sends `Authorization: Bearer`.
3. On `401`, the API client calls `POST /auth/refresh` once, retries the request, otherwise redirects to `/login`.
4. Next.js `middleware.ts` checks a lightweight session cookie flag for route protection; real authorization is enforced by the API.
5. Role guard middleware on the API: `requireRole('admin','qa_lead')`.

### 4.3 Real time (Socket.IO)
- Client connects with the access token; joins room `run:{runId}`.
- Events: `run.started`, `step.started`, `step.finished`, `case.finished`, `run.finished`, `run.error`, plus `job.progress` for plan generation.
- Worker publishes events to Redis pub/sub (`events:run:{id}`); API subscribes and emits to the room (so API instances scale horizontally with the Redis adapter).
- Fallback: if the socket drops, the run page polls `GET /runs/:id/steps`.

### 4.4 Job flow (plan generation example)
```
Web  POST /tasks/:id/plans/generate ─► API validates, creates ai_generation(queued),
                                        enqueues "generate_plan" ─► returns 202 {jobId}
Worker picks job ─► builds context ─► provider.generatePlan() ─► Zod validate/repair
        ─► writes test_plan + cases + steps ─► publishes job.progress/done
Web  receives event (or polls GET /jobs/:id) ─► refetches plan ─► opens review screen
```

### 4.5 Run flow
`POST /plans/:id/runs` → run `queued` → worker `execute_run` → per step: run check, write `step_log`, emit event → run finishes → enqueue `build_report` → notification.

## 5. Frontend ↔ Backend Mapping

| Screen | API calls |
|---|---|
| Login | `POST /auth/login`, `GET /auth/me` |
| Dashboard | `GET /dashboard/summary`, `/dashboard/trends`, `GET /runs?limit=10`, `GET /plans?status=in_review` |
| Websites | `GET/POST/PATCH /websites`, archive/restore |
| Configuration | `GET/PUT /websites/:id/config`, CRUD `/roles`, `/modules`, `/rules`, `PUT /credentials/:roleId` |
| Tasks | `GET/POST/PATCH /tasks`, clone, archive |
| Plan review | `POST /tasks/:id/plans/generate`, `GET /plans/:id`, case/step CRUD, `approve`, `reject`, `regenerate` |
| Run view | `POST /plans/:id/runs`, `GET /runs/:id/timeline`, socket `run:{id}` |
| Reports | `GET /reports`, `/reports/:id/export`, `POST /reports/compare`, `POST /reports/:id/share` |
| Settings | `/providers/*`, `/users`, `/settings`, `/audit` |

## 6. AI Integration Plan

- One `LLMProvider` interface in `packages/ai`: `generatePlan(ctx)`, `health()`, `listModels()`.
- **Ollama adapter:** `POST {OLLAMA_BASE_URL}/api/chat` with `format` = JSON schema, `stream:false`, low temperature.
- **Gemini adapter:** Gemini `generateContent` with `responseMimeType: "application/json"` and a response schema.
- Same Zod schema validates both outputs; repair loop (max 2) feeds errors back to the model.
- Provider chosen per task; the UI never silently switches engines. A "retry with other engine" button is offered on failure.
- Secrets (credentials, tokens) are **never** placed in prompts.
- Every call stored in `ai_generations` (model, tokens, latency, prompt snapshot).

## 7. Environments and Configuration

| Variable | Purpose |
|---|---|
| `DATABASE_URL`, `REDIS_URL` | Connections |
| `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_KEY` | Tokens, AES-256-GCM credential encryption |
| `WEB_ORIGIN` | CORS allow-list |
| `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL` | Frontend endpoints |
| `OLLAMA_BASE_URL`, `OLLAMA_DEFAULT_MODEL` | Local engine |
| `GEMINI_API_KEY`, `GEMINI_DEFAULT_MODEL` | Cloud engine |
| `RUN_TIMEOUT_MS`, `STEP_TIMEOUT_MS` | Execution limits |
| `RETENTION_DAYS` | Raw payload retention |

Environments: **local** (Compose), **staging** (auto-deploy from `main`), **production** (manual approval).

### docker-compose (services)
`web` :3000 · `api` :4000 · `worker` · `postgres` :5432 · `redis` :6379 · optional `ollama` :11434.

## 8. Step-by-Step Integration Order

1. **Repo + tooling:** pnpm/Turbo, shared TS config, lint, CI skeleton.
2. **Database:** Prisma schema, first migration, seed (admin user, demo website).
3. **API skeleton:** Express app, error handler, request IDs, Zod validation middleware, `/health`.
4. **Auth end to end:** login/refresh/me in API; login page, API client with refresh, protected layout in web.
5. **Websites + config CRUD** (API) and pages (web). Verify contract with shared Zod types.
6. **Queue + worker skeleton:** BullMQ, a sample job, Socket.IO event relay; show job progress in UI.
7. **AI adapters** with a CLI script to test both engines against the golden task.
8. **Plan generation + review UI**, approve/lock.
9. **Executor + run engine**, live run page.
10. **Reports, compare, exports, re-run.**
11. **Hardening:** rate limits, audit log, retention job, security review, E2E tests.

## 9. Testing and CI

| Level | Tools |
|---|---|
| Unit | Vitest (services, checks, validators, encryption) |
| Integration | Vitest + Testcontainers (Postgres, Redis) |
| Contract | OpenAPI diff in CI; recorded Ollama/Gemini responses |
| E2E | Playwright against a seeded demo site |
| AI golden tests | Fixed tasks run on both engines; malformed-output and prompt-injection suites |

CI pipeline: install → lint → typecheck → unit → integration → build images → deploy staging → E2E → manual approval → production.

## 10. Security Integration Points

- Argon2 password hashing; lockout after repeated failures.
- AES-256-GCM credential encryption with `key_version`; decrypt only inside the worker.
- Redact `Authorization`, cookies, passwords in logs and step summaries.
- CORS limited to `WEB_ORIGIN`; HTTPS + HSTS; Helmet; rate limits (login, plan generation).
- Outbound request allow-list: only the registered host; block private IP ranges unless a website is marked internal (SSRF protection).
- Production websites run read-only by default with confirmation.
- Append-only `audit_logs`; DB triggers block updates to logs.

## 11. Observability

Structured JSON logs (pino) with request IDs; metrics for request latency, queue depth, run duration, AI latency/error rate per provider; alerts on failed jobs, queue backlog, provider health failures; nightly DB backup with tested restore.
