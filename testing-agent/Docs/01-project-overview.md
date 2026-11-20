# AI Website Testing Agent — Project Overview

> Intelligent website test planning, rule validation and audit reporting, powered by a dual-engine AI layer (Ollama local / Gemini cloud).

---

## 1. Purpose

QA teams write test cases by hand, keep business rules in scattered documents, and lose track of what was checked on which environment. Every release repeats the same manual work.

**The AI Website Testing Agent** turns a plain-English testing goal into a reviewed, structured test plan, records every validation step with timing and diagnostics, and keeps each run as an immutable history record.

Example: the user types *"Verify login and open the Tracking page"*. The AI returns five atomic test cases with steps and expected results. A QA Lead approves the plan, the system validates and logs each step, and a report is stored and shown on the dashboard.

## 2. Goals and Non-Goals

### Goals
- Cut test-plan authoring from hours to minutes using natural language.
- Keep a human in the loop: nothing runs until a plan is approved.
- Support a local engine (private, free per call) and a cloud engine (stronger reasoning) behind one interface.
- Persist every run forever so regressions can be compared across dates and environments.
- Export task-level and date-level reports for audits.

### Non-goals (prototype)
- Replacing full E2E frameworks (Playwright / Cypress suites).
- Load, performance or penetration testing.
- Mobile-app testing.
- Autonomously fixing the target website.

## 3. Key Terms

| Term | Meaning |
|---|---|
| Website | A registered target app: name, base URL, login URL, environment. |
| Configuration | Roles, modules, auth flow, business rules, instructions, credentials of a website. Versioned. |
| Task | A natural-language testing goal for one website. |
| Test plan | AI-generated set of test cases for a task. Versioned, approvable, lockable. |
| Test case | One atomic verification with ordered steps and an expected outcome. |
| Run | One execution of an approved plan. Immutable once finished. |
| Step log | Recorded result of one step in one run: status, timing, payload summaries, errors. |
| Report | Compiled summary of a run with outcomes and a chronological timeline. |
| AI provider | Ollama (local) or Gemini (cloud). |

## 4. Users and Roles

| Action | Admin | QA Lead | QA Engineer | Viewer |
|---|:-:|:-:|:-:|:-:|
| Manage users and AI provider settings | ✅ | | | |
| Add / edit / archive websites | ✅ | ✅ | | |
| Edit website configuration and rules | ✅ | ✅ | ✅ | |
| Manage credentials (masked) | ✅ | ✅ | | |
| Create tasks, generate and edit plans | ✅ | ✅ | ✅ | |
| Approve / reject plans | ✅ | ✅ | | |
| Trigger runs and re-runs | ✅ | ✅ | ✅ | |
| View runs, logs, reports; export | ✅ | ✅ | ✅ | ✅ |
| View audit log | ✅ | ✅ | | |

Platform roles are separate from **website user roles** (e.g. "Customer", "Dispatcher") that describe the application under test.

## 5. Modules and Features

### 5.1 Dashboard
- Summary cards: websites, active tasks, runs in last 7 days, overall pass rate.
- Recent runs table: status, website, task, engine, duration, date.
- 30-day pass/fail trend and a "needs approval" queue.
- Quick actions: Add website, Create task, Re-run last task.
- Filters by website, environment, date range (remembered per user).

### 5.2 Website Management
- Register: Name, Base URL, Login URL, Environment (Dev / Staging / QA / Production).
- Validation: URL format, HTTPS warning for production, duplicate detection per environment.
- List/grid with search, environment filter, last-run status, task count.
- Edit, archive, restore. Archived sites keep history but accept no new tasks.
- Optional grouping of environments of the same product.

### 5.3 Website Configuration
All of this is injected into the AI prompt, so quality here sets plan quality.
- **User roles:** name, description, landing page, allowed modules.
- **Modules:** name, route, expected heading, key elements, navigation path.
- **Auth flow:** method (form / SSO / token), field names, success indicator, redirect, failure message.
- **Business rules:** text rules with priority and optional module link.
- **Custom instructions:** appended to the AI system prompt (e.g. "Ignore cookie banners").
- **Credentials:** per role, encrypted at rest, masked in UI, never sent to the AI.
- **Versioning:** each task stores the config version it used.

### 5.4 Task Management
- Create: website, role, AI engine, natural-language goal; optional priority, tags, target module.
- List with status: Draft → Plan generated → Approved → Running → Completed / Failed.
- Clone, edit, archive. Tasks are independent of each other.

### 5.5 Dual-Engine AI Test Planning
- Engine chosen per task: Ollama (local model) or Gemini (cloud model).
- Context package: task, login URL, role, module map, navigation rules, business rules, custom instructions.
- Strict JSON output: cases → steps → validation type + expected result.
- Schema validation with up to 2 repair retries; clear error + "try other engine".
- Regenerate with feedback ("also test wrong password") → new plan version.
- Token usage, latency and model recorded per generation.

### 5.6 Review and Approve
- Cases as expandable cards with a steps table.
- Edit text, reorder, add/delete, change expected results, mark optional.
- Version diff.
- **Approve & Finalize** locks the version; later edits create version N+1.
- Rejection requires a reason, reused as regeneration feedback.

### 5.7 Execution, Validation and Timeline
- Run from an approved plan, manually or via re-run.
- Per step: start/end time, duration (ms), status (Passed / Failed / Skipped / Error), check performed, request/response summary, error, QA note.
- Live timeline over WebSocket.
- Failed step → dependent steps skipped; independent cases continue.
- QA notes can be added after the run without altering the record.

### 5.8 Reports and History
- Task report: counts, pass rate, duration, per-case outcome, chronological timeline.
- Date-wise history per website or task.
- Compare two runs side by side.
- Export PDF / CSV / JSON; expiring read-only share link.
- Re-run creates a new run; old runs are never edited or deleted.

### 5.9 Settings
- AI providers: Ollama URL + default model, Gemini key + default model, connection test, default engine.
- Workspace: timeouts, retries, retention, "separate approver" switch.
- Users and roles, API tokens, profile.

### 5.10 Audit Log and Notifications
- Append-only log of who did what, when, on which record.
- In-app notifications: plan ready, approval requested, run finished, run failed.

## 6. End-to-End Workflow (9 steps)

| # | Stage | Actor | What happens |
|---|---|---|---|
| 1 | Dashboard | User | See websites, tasks, history. |
| 2 | Add website | QA Lead / Admin | Name, base URL, login URL, environment. |
| 3 | Configure website | QA Engineer+ | Roles, modules, auth, rules, instructions, credentials. |
| 4 | Create task | QA Engineer+ | Natural-language goal, role, engine. |
| 5 | Generate plan | System | Context → AI → validated JSON → plan v1. |
| 6 | Review & approve | Engineer edits, Lead approves | Edit, regenerate, approve and lock. |
| 7 | Run & log | System | Execute steps, record timing, status, payloads, errors. |
| 8 | Generate report | System | Counts, pass rate, per-case outcomes, timeline. |
| 9 | Re-run & history | User | New run on the same plan; compare; export. |

```
Dashboard → Add website → Configure → Create task → Generate plan
                                                        │   ▲
                                          reject/regenerate │
                                                        ▼   │
                                              Review & approve ──approved──► Run & log
                                                                                │
                                              Re-run (new run) ◄── History ◄── Report
```

### State machines
| Entity | States |
|---|---|
| Task | Draft → Plan generated → Approved → Running → Completed / Failed; Archived from any |
| Plan | Draft → In review → Approved (locked) / Rejected; Superseded by newer approved version |
| Run | Queued → Running → Passed / Failed / Error / Cancelled |
| Step | Pending → Passed / Failed / Error / Skipped |

### Worked example — "Verify login and open the Tracking page"
1. **Intent parsing** with stored login URL, module map, navigation rules.
2. **Five test cases:** login route and form accessible; credentials validated and session issued; role redirected to Dashboard; Dashboard → Tracking navigation works; Tracking heading and data requirements met.
3. **Review**, edit any assertion, **Approve & Finalize**.
4. **Run:** every step logged with timestamp, duration, status.
5. **Archive:** report saved to history and shown on dashboard.

| # | Test step | Recorded details |
|---|---|---|
| 01 | Open login page | Timestamp, duration (ms), route and endpoint check |
| 02 | Enter username | Timestamp, duration, input schema and field rule check |
| 03 | Enter password | Timestamp, duration, credential policy check |
| 04 | Submit login form | Timestamp, duration, auth payload and response check |
| 05 | Open dashboard | Timestamp, duration, role redirect and access rule check |
| 06 | Open Tracking page | Timestamp, duration, module navigation and state check |
| 07 | Verify page heading | Timestamp, duration, expected output and assertion log |

## 7. Validation Types

| Type | Check |
|---|---|
| route_check | URL responds with expected status, no redirect loop |
| form_structure | Required fields, input types, submit control exist |
| auth_response | Credentials produce a session cookie/token and expected status |
| redirect | Final URL matches the role's landing path |
| navigation | Link/route from page A to B exists and loads |
| heading | Expected heading or key text present |
| content_rule | A business rule holds for returned content/payload |
| custom | Reserved for user assertions |

## 8. Failure Categories

| Category | Meaning |
|---|---|
| assertion_failed | Check ran; actual differs from expected |
| target_unreachable | DNS, TLS, timeout, connection error |
| auth_failed | Login rejected / no session |
| plan_invalid | Step cannot be executed as written |
| engine_error | Internal runner fault (run becomes `error`, not `failed`) |

## 9. Roadmap (9 phases)

| Phase | Milestone | Acceptance |
|---|---|---|
| 1 | Next.js dashboard setup | All routes render in the shell, responsive |
| 2 | Node backend setup | Login works; sample job runs in worker |
| 3 | Database structure | Migrations apply cleanly; log tables immutable |
| 4 | Website registration | Add/edit/archive; duplicates blocked |
| 5 | Credentials & instructions | Credentials never returned by API; config edits versioned |
| 6 | Ollama / Gemini integration | Both engines return a valid plan for the golden task |
| 7 | AI test-case generation + review UI | Approved plan locks; edits create new version |
| 8 | Execution timeline & logging | Walkthrough task yields 7 timed step logs live |
| 9 | Reports & history | Re-run adds new run; exports match on-screen report |

Milestone gates: **after 3** skeleton runs end to end; **after 6** both engines return valid JSON; **after 9** full flow passes on a demo site.

### Future scope
Playwright executor with screenshots and traces; scheduled/CI runs; reusable test library; Slack/email/webhook notifications; SSO and MFA flows; multi-tenant workspaces; flaky-step detection.

## 10. Risks and Open Questions

| Risk | Mitigation |
|---|---|
| AI produces wrong/unrunnable steps | Schema validation, host restriction, mandatory approval |
| Local model quality varies | Golden-task benchmarks, model shown on every plan, cloud fallback |
| HTTP-only validation misses JS-rendered pages | Executor type recorded per run; add Playwright later |
| Stored credentials leak | Encryption, redaction, worker-only decryption, audit trail |
| Runs affect production data | Production read-only default + confirmation |
| Gemini sends data off-network | Per-website engine restriction, clear UI flag |

**Open questions**
- [ ] Real browser execution from day one, or HTTP validation first?
- [ ] Multi-tenant now or later?
- [ ] Which Ollama models and hardware are available?
- [ ] Screenshots/video evidence required in reports?
- [ ] Scheduled runs needed?
