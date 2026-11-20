# AI Website Testing Agent — Frontend Implementation

Next.js (App Router) + TypeScript admin dashboard. Modern, minimal, token-driven UI.

---

## 1. Stack

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router), React, TypeScript |
| Styling | Tailwind CSS + CSS variable tokens, shadcn/ui (Radix primitives) |
| Server state | TanStack Query |
| UI state | Zustand |
| Forms | React Hook Form + Zod (schemas from `packages/shared`) |
| Tables | TanStack Table |
| Charts | Recharts |
| Icons | Lucide |
| Real time | Socket.IO client wrapped in `useRunSocket` |
| Toasts / dialogs | Sonner / Radix Dialog |
| Tests | Vitest, React Testing Library, Playwright |

## 2. Architecture

```
apps/web/src/
├─ app/
│  ├─ (auth)/login/page.tsx
│  ├─ (app)/layout.tsx                        # AppShell: Sidebar + Topbar
│  ├─ (app)/dashboard/page.tsx
│  ├─ (app)/websites/page.tsx
│  ├─ (app)/websites/new/page.tsx
│  ├─ (app)/websites/[id]/page.tsx            # overview
│  ├─ (app)/websites/[id]/config/page.tsx     # tabs
│  ├─ (app)/tasks/page.tsx
│  ├─ (app)/tasks/new/page.tsx
│  ├─ (app)/tasks/[id]/page.tsx
│  ├─ (app)/plans/[id]/page.tsx               # review & approve
│  ├─ (app)/runs/[id]/page.tsx                # live run
│  ├─ (app)/reports/page.tsx
│  ├─ (app)/reports/[id]/page.tsx
│  ├─ (app)/reports/compare/page.tsx
│  ├─ (app)/notifications/page.tsx
│  ├─ (app)/settings/(general|providers|users|audit)/page.tsx
│  ├─ not-found.tsx  error.tsx  loading.tsx
├─ components/
│  ├─ ui/            # button, input, textarea, select, checkbox, switch, dialog, sheet,
│  │                 # dropdown, tabs, tooltip, badge, card, table, toast, skeleton, avatar
│  ├─ layout/        # AppShell, Sidebar, Topbar, PageHeader, Breadcrumbs, CommandMenu
│  ├─ data/          # DataTable, FilterBar, Pagination, EmptyState, ErrorState, Skeletons
│  ├─ charts/        # TrendChart, PassRateDonut, DurationBars
│  └─ domain/        # StatusBadge, EnvBadge, EngineBadge, EngineSwitch, StepRow, Timeline,
│                    # CaseCard, StepEditor, PlanDiff, ConfigTabs, RunProgress, StatCard
├─ features/         # websites/ tasks/ plans/ runs/ reports/ providers/ auth/ users/
│                    #   each: api.ts, hooks.ts, schemas.ts, components/
├─ lib/              # apiClient.ts, socket.ts, format.ts, cn.ts, permissions.ts
├─ stores/           # ui.store.ts (sidebar, theme), filters.store.ts, auth.store.ts
└─ styles/           # globals.css, tokens.css
```

### Layering rules
1. `components/ui` is presentational only; no fetching.
2. Data hooks live in `features/*/hooks.ts` (TanStack Query) and call `lib/apiClient`.
3. Pages compose features; they hold no business logic.
4. Filters, pagination and sort live in the **URL** (`searchParams`), so views are shareable.
5. Every data view implements **four states**: skeleton, empty, error + retry, populated.
6. Status is always icon + label, never colour alone.

### Data fetching and state
- Query keys: `['websites', filters]`, `['task', id]`, `['plan', id]`, `['run', id, 'steps']`.
- Mutations invalidate only affected keys; plan edits use optimistic updates with rollback.
- Long jobs: show progress card, poll `/jobs/:id` or listen to socket.
- Access token in memory; refresh via httpOnly cookie; 401 → one refresh retry → `/login`.
- Permission helper `can(user, 'plan.approve')` hides actions; API still enforces.

### Real-time hook
```ts
// useRunSocket(runId): joins room run:{id}, merges events into the ['run', id, 'steps'] cache,
// falls back to polling every 3s when disconnected.
```

## 3. Design System (summary)

| Token | Value |
|---|---|
| Font (UI) | **Inter** (variable) — fallback system-ui |
| Font (code/data) | **JetBrains Mono** |
| Scale | 12 / 13 / 14 (base) / 16 / 20 / 24 / 30 |
| Radius | 6 (inputs, buttons) · 10 (cards) · 14 (modals) |
| Spacing | 4-px grid: 4, 8, 12, 16, 24, 32, 48 |
| Shadow | `0 1px 2px rgba(15,23,42,.06)` cards; `0 8px 24px rgba(15,23,42,.12)` overlays |
| Motion | 120–200 ms ease-out; respect `prefers-reduced-motion` |

**Light palette**

| Role | Hex |
|---|---|
| Background | `#FAFAFB` |
| Surface | `#FFFFFF` |
| Border | `#E7E8EC` |
| Text | `#0F1222` |
| Muted text | `#6B7080` |
| Primary | `#4F46E5` (hover `#4338CA`, tint `#EEF0FF`) |
| Success | `#16A34A` (tint `#E8F7EE`) |
| Warning | `#D97706` (tint `#FDF3E1`) |
| Danger | `#DC2626` (tint `#FDECEC`) |
| Info | `#0284C7` (tint `#E6F4FB`) |

**Dark palette:** bg `#0B0D14`, surface `#12151F`, border `#232838`, text `#E8EAF2`, muted `#8B90A3`, primary `#818CF8`.

**Status mapping:** Passed = success · Failed = danger · Skipped = muted · Error = warning · Running = info (animated dot) · Queued = muted outline.
**Environment badges:** Dev = muted, Staging = info, QA = primary, Production = danger-tint.

### Component rules
- **Button:** 36 px height (32 small, 40 large). Primary solid, Secondary outline, Ghost, Danger. Loading spinner replaces icon; disabled 50 % opacity.
- **Input:** 36 px, 1 px border, focus ring 2 px primary at 30 % opacity, inline error text 12 px danger.
- **Card:** white surface, 1 px border, 10 px radius, 20 px padding, no heavy shadow.
- **Table:** 44 px rows, sticky header, hover row tint, zebra off, sortable headers, row actions in a kebab menu.
- **Badge:** 22 px height, 12 px text, tinted background + coloured text + icon.
- **Modal:** 14 px radius, max width 520/720, footer with right-aligned actions.
- **Sidebar:** 240 px (collapsible to 64 px), active item tinted primary with 2 px left indicator.
- **Topbar:** 56 px: breadcrumbs, command search (⌘K), engine indicator, notifications, avatar menu.
- **Toast:** bottom-right, auto-dismiss 4 s; errors persist until closed.

## 4. App Shell

- **Sidebar sections:** Dashboard · Websites · Tasks · Reports · (divider) · Settings. Footer: user + theme switch.
- **Topbar:** breadcrumbs, global search (websites, tasks, runs), notifications bell with unread dot, avatar menu.
- **Content:** max width 1280, 24 px gutters, `PageHeader` (title, description, primary action).
- Responsive: ≥1024 sidebar visible; <1024 sidebar becomes a sheet; tables collapse to cards under 640.

## 5. Page Specifications (Admin)

Each page lists layout, components, actions, API and states.

### 5.1 Login `/login`
- Centered card (400 px) on soft gradient-free background; logo, title, email, password (show/hide), Sign in button.
- Error banner for invalid credentials; lockout message after repeated failures.
- API: `POST /auth/login`. States: idle, submitting, error.

### 5.2 Dashboard `/dashboard`
- **Row 1 – StatCards (4):** Websites, Active tasks, Runs (7 days), Pass rate (with delta vs previous week).
- **Row 2:** Pass/Fail trend (line/area, 30 days, 2/3 width) + Run status donut (1/3).
- **Row 3:** Recent runs table (status, website, task, engine, duration, started) + "Needs approval" list (plan title, author, age, Review button).
- **Quick actions:** Add website, Create task, Re-run last task.
- Filters: website, environment, date range (URL-backed).
- API: `/dashboard/summary`, `/dashboard/trends`, `/runs`, `/plans?status=in_review`.

### 5.3 Websites list `/websites`
- Header: title + **Add website** button; toolbar: search, environment filter, status filter, grid/list toggle.
- List: name + URL, environment badge, last-run status, tasks count, updated, kebab (Open, Edit, Archive).
- Grid: cards with same data. Empty state with CTA. Archived tab.
- API: `GET /websites`.

### 5.4 Add / Edit Website `/websites/new`
- Single card form: Website name, Base URL, Login URL, Environment (segmented control), Group (optional).
- Inline validation (URL format), HTTPS warning for Production, duplicate error.
- Actions: Cancel, Save website. Success → website detail.
- API: `POST /websites`, `PATCH /websites/:id`.

### 5.5 Website detail `/websites/[id]`
- Header: name, environment badge, URL link, actions (Configure, Create task, Archive).
- Tabs: **Overview · Tasks · Runs · Configuration summary**.
- Overview: metric cards (tasks, runs, pass rate, last run), recent runs, config completeness checklist (roles, modules, rules, credentials).
- API: `/websites/:id`, `/tasks?websiteId=`, `/runs?websiteId=`.

### 5.5b Website configuration `/websites/[id]/config`
Tabs, each with its own save and version note:
1. **Roles:** table (name, description, landing path, allowed modules) + add/edit drawer.
2. **Modules:** table (name, route, expected heading) + drawer with key elements and navigation path.
3. **Auth flow:** method select, field names, success indicator, redirect target, failure message.
4. **Business rules:** list with priority chip, module link, active toggle; add rule modal.
5. **Instructions:** textarea for custom AI instructions with character count and examples.
6. **Credentials:** per-role rows, masked values, Replace/Remove; "Never sent to AI" notice.
7. **Versions:** timeline of config versions with diff and restore.
- API: `/websites/:id/config`, `/roles`, `/modules`, `/rules`, `/credentials/:roleId`.

### 5.6 Tasks list `/tasks`
- Toolbar: search, website filter, status filter, owner filter, **Create task**.
- Table: title, website, status badge, engine, owner, last run, updated, kebab (Open, Clone, Archive).
- API: `GET /tasks`.

### 5.7 Create task `/tasks/new`
- Two columns: left form (Website, Role, AI engine segmented control Ollama/Gemini + model select, Task description textarea with example chips, Priority, Tags); right **Context preview** card (modules, rules and instructions that will be sent; credential-free notice).
- Actions: Save draft, **Generate plan** (primary).
- API: `POST /tasks`, `POST /tasks/:id/plans/generate` → progress card.

### 5.8 Task detail `/tasks/[id]`
- Header: title, status, engine, actions (Generate plan, Run, Clone, Archive).
- Sections: Prompt; Plan versions (timeline with status and author); Run history table; Activity.
- API: `/tasks/:id`, `/tasks/:id/plans`, `/runs?taskId=`.

### 5.9 Plan review `/plans/[id]`
- Header: plan version badge, engine/model, tokens, **Regenerate with feedback**, **Reject**, **Approve & Finalize**.
- Left: case list (numbered CaseCards, expandable). Each case: title, objective, expected outcome, optional switch, steps table (action, validation type, target, expected) with inline edit, drag-reorder, add/delete.
- Right panel: Summary, validation-type counts, Version diff, Reviewer notes.
- Locked state after approval: read-only banner + "Create new version".
- API: `/plans/:id`, `/cases`, `/steps`, `approve`, `reject`, `regenerate`.

### 5.10 Run view `/runs/[id]`
- Header: run number, status badge, website, task, engine/executor, duration, **Re-run**, **Cancel**.
- Progress bar with step count; summary chips (Passed, Failed, Skipped).
- **Timeline** (left): chronological step entries with timestamp, duration, status icon.
- **Step table** (right): `#, Test step, Status, Duration, Check, Details` with expandable row (request/response summary, error, QA note field).
- Live updates through socket; "Live" pill while running.
- API: `/runs/:id`, `/runs/:id/steps`, `/runs/:id/timeline`, `POST /step-logs/:id/notes`.

### 5.11 Reports `/reports`
- Toolbar: date range, website, task, status, search; Export menu (CSV).
- Table: run, task, website, environment, result, pass rate, duration, date, Open.
- Toggle: Task-wise / Date-wise grouping. Checkbox rows → **Compare** (2 selected).
- API: `GET /reports`.

### 5.12 Report detail `/reports/[id]`
- Summary cards: pass rate, cases, steps, duration, engine.
- Per-case outcome list; chronological timeline; failure details section.
- Actions: Export PDF/CSV/JSON, Share link (expiry), Re-run.
- API: `/runs/:id/report`, `/reports/:id/export`, `/reports/:id/share`.

### 5.13 Compare runs `/reports/compare?a=&b=`
- Two run headers side by side; step-by-step diff table with changed rows highlighted (Passed→Failed etc.), duration delta column.

### 5.14 Notifications `/notifications`
- Grouped list (Today, Earlier), type icon, text, time, mark read, link to target.

### 5.15 Settings
- **General:** timeouts, retries, retention, "separate approver" switch, danger zone (kill switch).
- **AI providers:** two cards (Ollama, Gemini): base URL / API key (masked), default model select (fetched from provider), Test connection button with latency, default-engine radio, usage table (calls, tokens, errors).
- **Users:** table (name, email, role select, status, last login), Invite user modal.
- **Audit log:** filter by user, action, entity, date; table with before/after expandable diff.
- Admin-only guards on Users and Providers.

### 5.16 System pages
- **404**, **Error boundary** with retry, **Forbidden (403)**, and global **offline banner**.

## 6. Key Component Behaviours

| Component | Behaviour |
|---|---|
| `EngineSwitch` | Segmented Ollama/Gemini; shows provider health dot; disabled if provider off |
| `StatusBadge` | Maps status → icon, label, tint; animated dot for Running |
| `Timeline` | Vertical line, time on the left, duration chip, expandable details |
| `StepEditor` | Inline editable row, validation-type select, JSON editor for target/expected with schema check |
| `PlanDiff` | Two-version diff by case and step: added / removed / changed |
| `DataTable` | Server pagination/sort, column visibility, row selection, sticky header |
| `CommandMenu` | ⌘K: jump to website/task/run, create actions |

## 7. Accessibility and Performance

- WCAG AA contrast; visible focus rings; full keyboard operation; ARIA on tables, dialogs, tabs, toasts.
- Skeletons instead of spinners for lists; images none/SVG only.
- Route-level code splitting; lazy-load charts and diff viewer; React Query prefetch on row hover.
- Lighthouse targets: Performance ≥ 90, Accessibility ≥ 95.

## 8. Build Order

1. Tokens, fonts, `ui/` primitives, AppShell.
2. Auth pages + API client + protected layout.
3. Websites list/add/detail → Configuration tabs.
4. Tasks list/create/detail.
5. Plan review (core screen).
6. Run view with socket.
7. Reports, compare, export.
8. Dashboard (needs real data), Settings, Notifications.
9. Polish: empty/error states, dark mode, a11y pass, E2E tests.
