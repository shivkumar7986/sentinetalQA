# Complete Platform Live Testing Runbook & Error Log

> **Target Environment**: Live Deployment  
> **Date**: 2026-11-23  
> **Tester Name**: [Tester Name]  
> **Platform Version**: Testing Agent v1.0.0 (Production Build)  

---

## 📋 How to Use This Checklist
1. As you test each scenario, check off the item (`- [x]`) and select **PASS** or **FAIL**.
2. If any step fails or behaves unexpectedly, write the details directly in the **Error Log** section provided under that module.
3. Once completed, you can share or commit this log file for debugging and bug tracking.

---

## Summary Dashboard

| Module | Total Tests | Passed | Failed | Blocked | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| 1. Authentication & Role Switcher | 5 | 0 | 0 | 0 | 🟡 Pending |
| 2. Global Topbar, Sidebar & Drawers | 6 | 0 | 0 | 0 | 🟡 Pending |
| 3. Notifications Slide-over Drawer | 5 | 0 | 0 | 0 | 🟡 Pending |
| 4. Role Dashboards (Admin, Lead, Employee)| 6 | 0 | 0 | 0 | 🟡 Pending |
| 5. Websites & Deep Configuration | 9 | 0 | 0 | 0 | 🟡 Pending |
| 6. Task Management & NL Prompt | 7 | 0 | 0 | 0 | 🟡 Pending |
| 7. Test Plan Compilation & Review | 8 | 0 | 0 | 0 | 🟡 Pending |
| 8. Test Execution (Live Run Matrix) | 5 | 0 | 0 | 0 | 🟡 Pending |
| 9. Reports & Run Comparison | 6 | 0 | 0 | 0 | 🟡 Pending |
| 10. Team & User Management | 5 | 0 | 0 | 0 | 🟡 Pending |
| 11. Governance Audit & Settings | 6 | 0 | 0 | 0 | 🟡 Pending |

---

## 1. Authentication & Role Switching

### Test Cases
- [x-pass] **TC-AUTH-01**: Access `/login` page. Verify credentials cards (Admin, QA Lead, QA Employee) load with clean dark obsidian styling.
- [x-pass] **TC-AUTH-02**: Login as **Admin** (`admin@testingagent.ai`). Verify redirect to `/dashboard` with full organization overview.
- [x-pass] **TC-AUTH-03**: Switch role to **QA Lead** via Topbar user role dropdown. Verify dashboard adapts to QA Lead view with lead scope & readiness stats.
-  [x-pass] **TC-AUTH-04**: Switch role to **QA Employee**. Verify dashboard adapts to employee view, and restricted actions (e.g. Users menu item, Plan Approval) are locked or hidden.
- [x-pass] **TC-AUTH-05**: Toggle Theme mode (Dark / Light / System) in user dropdown. Verify instant UI color update across the page.


---

## 2. Global Layout (Topbar, Sidebar, Search)

### Test Cases
- [x-pass] **TC-NAV-01**: **Sidebar Navigation**: Click through all items (`Dashboard`, `Websites`, `Tasks`, `Reports`, `Users`, `Settings`). Verify routes open cleanly without 404s.
- [x-pass] **TC-NAV-02**: **Sidebar Header**: Confirm there is NO redundant collapse icon next to the "Testing Agent" logo.
- [x-pass] **TC-NAV-03**: **Header Sidebar Toggle**: Click the collapse button in the Topbar header. Verify sidebar collapses to icon-only view (`w-14`) and expands smoothly (`w-56`).
- [x-pass] **TC-NAV-04**: **Command Palette (`⌘K`)**: Click Search input or press `Ctrl+K` / `Cmd+K`. Verify Jump To modal opens, backdrop blurs, and filtering works.
- [x-pass] **TC-NAV-05**: **Breadcrumbs**: Navigate deep (e.g. `/websites/[id]/config` or `/tasks/[id]`). Verify dynamic breadcrumb links point accurately to parent records.
- [x-pass] **TC-NAV-06**: **Engine Status Pill**: Verify Topbar displays `Ollama · Ready` with pulsing green indicator.



---

## 3. Notifications Slide-over Drawer

### Test Cases
- [x-pass] **TC-NOTIF-01**: Click the **Bell Icon** in Topbar. Verify slide-over drawer opens smoothly from the right with backdrop blur (`blur-[7px]`).
- [x-pass] **TC-NOTIF-02**: Verify **Unread Pill** on bell and inside drawer header (e.g., `2 unread`).
- [x-pass] **TC-NOTIF-03**: Switch between **All** and **Unread** filter pills inside drawer. Verify count and list filter correctly.
- [x-pass] **TC-NOTIF-04**: Click on any notification card (e.g. "Plan Ready" or "Run Completed"). Verify:
  - Drawer closes automatically.
  - Page navigates directly to the target resource (`/plans/[id]`, `/reports/[id]`, `/tasks/[id]`).
  - Item is marked as read and unread badge decrements.
- [x-pass] **TC-NOTIF-05**: Click **"Mark all read"**. Verify all items update to read state and unread count turns to zero. Verify footer shows "Close" button without broken `/notifications` link.



---

## 4. Role-Specific Dashboards

### Test Cases
- [x-pass] **TC-DASH-01**: **Admin Dashboard**: Verify 4 KPI metric cards, 30-day global execution trend bar chart, dual AI provider cards (Ollama + Gemini), and governance audit preview.
- [x-pass] **TC-DASH-02**: **Test AI Provider Connections**: Click *"Test AI provider connections"*. Verify connection test triggers with feedback toast.
- [x-pass] **TC-DASH-03**: **Admin Team Table**: Filter by role (Admin, QA Lead, QA Employee). Click *"Edit"* to open Edit User drawer. Click *"+ Add QA Lead / Employee"* to open Add User drawer.
- [x-pass] **TC-DASH-04**: **QA Lead Dashboard**: Switch to QA Lead. Verify Environment dropdown, Test readiness percentage bars, and pending review plans list.
- [x-fail] **TC-DASH-05**: **QA Lead Approval Quick-Action**: Click *"Inspect & Approve"* on a pending plan from Lead dashboard. Verify navigation to plan inspection.
- [x-fails] **TC-DASH-06**: **QA Employee Dashboard**: Switch to QA Employee. Verify assigned tasks list, quick *"Run"* button, and pass/fail distribution graph.

### 📝 Error Log (Module 4)
```markdown
- [ ] Issue:
  - failed to approve & finalize
  - always open veryfi login and open tracking from dashboard pending review plans.
  - simmialry wrong link redirecting in qa employee from daboard tasks.
  - daboards all enviroment filter not working.
```

---

## 5. Websites & Deep Configuration

### Test Cases
- [x-pass] **TC-WEB-01**: **Websites List**: Test Active and Archived tabs. Test Environment filter dropdown (Staging, QA, Production). Toggle between List and Grid view.
- [x-pass] **TC-WEB-02**: **Add Website Drawer**: Click *"+ Add website"*. Fill name, URL (e.g., `https://shiv-creates.vercel.app`), environment (`Production`), login path, and submit. Verify website appears in table.
- [x-pass] **TC-WEB-03**: **Website Detail Page (`/websites/[id]`)**: Verify target environment badge, "Visit site" external link, configuration readiness progress bar (0-100%), and task list.
- [x-pass] **TC-WEB-04**: **Config - Roles Tab**: Add a new role (e.g. `Dispatcher`, `/dispatch`, allowed modules). Edit existing role. Verify changes reflect in table.
- [x-pass] **TC-WEB-05**: **Config - Modules Tab**: Add target module (e.g., `Fleet Tracking`, `/tracking`, `Fleet Overview`).
- [x-pass] **TC-WEB-06**: **Config - Auth Flow Tab**: Configure login route (`/login`), username selector (`#user-id`), submit selector (`button[type="submit"]`), and redirect target (`/dashboard`).
- [x-pass] **TC-WEB-07**: **Config - Business Rules Tab**: Click *"+ Add rule"*. Verify **P0, P1, P2, and P3** priority options are available. Add rule with priority P3. Toggle rule active/inactive switch.
- [x-pass] **TC-WEB-08**: **Config - Instructions Tab**: Insert custom prompt instructions or click quick example buttons (`+ Ignore cookie banners`). Type version note and save.
- [x-failed] **TC-WEB-09**: **Config - Version History & Diff**: Open Version History tab. Expand diff viewer to verify changes. Click *"Restore"* on a previous version.

### 📝 Error Log (Module 5)
```markdown
- [ ] Issue:
  - diff viewer not showing,
```

---

## 6. Task Management & Natural Language Prompts

### Test Cases
- [x-pass] **TC-TASK-01**: **Tasks List View**: Search by task title. Filter by website and status. Verify table pagination and hover rows.
- [x-pass] **TC-TASK-02**: **Create Task Drawer**: Click *"+ Create task"*.
  - Verify Target Website dropdown (or pre-locked if opened from website page).
  - Select Role, AI Engine (`ollama/qwen2.5:14b` or `gemini/2.5-pro`).
  - Select Priority (**P0, P1, P2, P3**).
  - Enter natural-language prompt (e.g. *"Navigate to /checkout. Verify 15% discount code applied."*).
  - Check pre-flight safety checkboxes and submit. Verify new task is created.
- [x-pass] **TC-TASK-03**: **Task Detail Page (`/tasks/[id]`)**:
  - Verify header displays task title, status badge (`Draft` / `Plan Ready` / `Completed`), website name, role, engine, and priority pill.
- [x-pass] **TC-TASK-04**: **Natural-Language Prompt Card**: Verify full prompt, role, website, and engine details are displayed.
- [] **TC-TASK-05**: **Plan Versions Card**: Verify generated plan versions (v1, v2) with case count, step count, engine, token count, and "Inspect plan ↗".
- [ ] **TC-TASK-06**: **Run History Table**: Verify runs listed with Run ID, status badge (Passed/Failed/Running), pass rate (%), duration, and "Open" action button.
- [ ] **TC-TASK-07**: **Dynamic Activity Log**: Verify right-side activity timeline shows runner worker execution, plan compilation, and creation timestamp.

### 📝 Error Log (Module 6)
```markdown
- [ ] Issue:
  - now we have added new website but its not reflecting in all website dropdown,
  -

```

---

## 7. Test Plan Compilation & Review

### Test Cases
- [x-pass] **TC-PLAN-01**: **Generate Plan Drawer**: On Task page, click *"+ New version"* or *"Generate plan"*.
  - Verify Target Goal summary card.
  - Verify **Compilation Strategy** selection cards:
    - *Comprehensive (Recommended)*
    - *Smoke / Critical Path*
    - *Regression & Edge Cases*
  - Select AI Engine and Model.
  - Enter reviewer feedback notes (when regenerating).
  - Click *"Compile Plan vX"*. Verify plan is compiled and page navigates to plan inspection.
- [x-pass] **TC-PLAN-02**: **Plan Detail Review Page (`/plans/[id]`)**:
  - Verify breadcrumb: `Workspace / Tasks / task-xxx / plan-xxx`.
  - Verify header status (`In review` or `✓ Approved`), engine used, tokens consumed.
- [x-pass] **TC-PLAN-03**: **Plan Summary KPI Cards**: Check Total Cases, Total Steps, Est. Execution Time, Coverage Score.
- [x-pass] **TC-PLAN-04**: **Version Diff Card**: If v2+, click *"View changes vs v1"* and inspect side-by-side diff.
- [x-pass] **TC-PLAN-05**: **Test Cases & Step Matrix**:
  - Expand test case cards.
  - Verify step actions, assertion targets, and Validation Type select dropdowns (`route_check`, `form_structure`, `auth_response`, `custom`).
- [x-pass] **TC-PLAN-06**: **Approve Plan Workflow**:
  - As Admin or QA Lead, click *"Approve plan"*.
  - Verify status switches to `✓ Approved` with green check badge.
  - Confirm the approve button is now locked / disabled so approved plans cannot be re-approved repeatedly.
- [ ] **TC-PLAN-06b**: **Reject Plan Workflow**:
  - As Admin or QA Lead, click *"✕ Reject"*.
  - Verify status switches to `✕ Rejected` with red badge.
  - Confirm buttons lock to `✕ Plan Rejected` with option to regenerate with feedback.
  - Verify rejection audit log is recorded and task view reflects `✕ Rejected`.
- [x-pass] **TC-PLAN-07**: **Regenerate with Feedback Workflow**:
  - Click *"Regenerate with feedback"*.
  - Verify drawer opens with pre-filled feedback field and mode set to regenerate next version (`v2`/`v3`).
- [x-pass] **TC-PLAN-08**: **Run Plan Action**: Click *"Run plan"*. Verify execution triggers and redirects to `/runs/[run-id]`.

### 📝 Error Log (Module 7)
```markdown
- [x] Fixed: Plan reject button not working
  - Cause: mockClient was missing rejectPlan handler; plan rejection was not persisting status or updating header badges.
  - Solution: Implemented mockClient.rejectPlan with audit logging and event dispatching. Updated plans/[id]/page.tsx to show "✕ Plan Rejected" locked badge and update task status to "✕ Rejected".
```

---

## 8. Test Execution & Live Run Matrix

### Test Cases
- [x-pass] **TC-RUN-01**: **Live Execution Status**: On `/runs/[id]`, verify status indicator (`Running` with live animation pulse or `Passed` / `Failed`).
- [x-pass] **TC-RUN-02**: **Execution Progress Bar**: Verify duration timer, passed steps counter, failed steps counter, and animated progress track.
- [x-pass] **TC-RUN-03**: **Chronological Timeline (Left Column)**:
  - Verify step events list with step start time and step duration.
  - Verify color dots (green for passed, red for failed, blue pulse for running).
- [x-pass] **TC-RUN-04**: **Step Execution Matrix (Right Column)**:
  - Verify step number, status badge, action description, validation type pill, and duration.
- [x-pass] **TC-RUN-05**: **Step Diagnostics Drawer**: Click on any step in the table or timeline.
  - Verify slide-over drawer opens showing Check Performed, Request Payload JSON, Response Summary JSON, and Failure Details (if failed).
  - Enter a QA Audit note in the drawer and click *"Post Note"*. Verify note is saved and displayed.

### 📝 Error Log (Module 8)
```markdown
- [ ] Issue:
  - Severity:
  - Steps to Reproduce:
  - Expected:
  - Actual:
```

---

## 9. Reports & Side-by-Side Run Comparison

### Test Cases
- [x-pass] **TC-REP-01**: **Reports List View (`/reports`)**:
  - Verify runs list with Run ID, Task & Website, Environment badge, Result badge (`Passed` / `Failed` / `Error`), Pass Rate (%), Duration, and Date.
  - Search by Run ID or Task name.
  - Filter by Website dropdown and Result dropdown.
- [x-pass] **TC-REP-02**: **Side-by-Side Run Comparison**:
  - Check checkboxes on 2 different runs.
  - Notice the header button changes to *"Compare (2/2)"*.
  - Click *"Compare"*. Verify redirect to `/reports/compare?ids=...` with side-by-side metric comparison table.
- [x-pass] **TC-REP-03**: **Report Detail Page (`/reports/[id]`)**:
  - Open any completed run report.
  - Verify notice: *"Immutable Run Record"*.
  - Confirm **NO** Re-run button and **NO** preview sample dropdown is present (clean view).
- [x-pass] **TC-REP-04**: **Report Metric Cards**:
  - Verify Pass Rate (%), Cases Passed count, Total Steps count, Duration, AI Engine model.
- [x-pass] **TC-REP-05**: **Failure Banner**: On a failed run (e.g. `run-940`), verify red failure details banner highlighting the failed step and error message.
- [x-pass] **TC-REP-06**: **Per-Case Outcomes & Timeline**: Verify expandable test case outcomes and chronological timeline. Test *"Export"* and *"Share link"* buttons.

### 📝 Error Log (Module 9)
```markdown
- [ ] Issue:
  - Severity:
  - Steps to Reproduce:
  - Expected:
  - Actual:
```

---

## 10. Team & User Management

### Test Cases
- [x-pass] **TC-USER-01**: **Users List (`/users`)**: Verify members listed with User Name, Email, Role badge (`Admin`, `QA Lead`, `QA Employee`), Lead/Scope, Status (`Active` / `Invited`), and Actions.
- [x-pass] **TC-USER-02**: **Add User Drawer**: Click *"+ Add User"*.
  - Enter Full Name, Email, Password, select Role (`QA Employee`), and assign a QA Lead.
  - Submit form. Verify success toast and new user appears in table.
- [x-pass] **TC-USER-03**: **Role Enforcement**: Login as QA Lead. Verify QA Lead cannot create an `Admin` user (option disabled or blocked).
- [x-pass] **TC-USER-04**: **Edit User Drawer**: Click *"Edit"* on a user. Update assigned lead or role. Save and verify updated values.
- [x-pass] **TC-USER-05**: **Delete User Modal**: Click *"Delete"* on a test user. Verify full-screen confirmation dialog with warning. Confirm deletion and check that user is removed.

### 📝 Error Log (Module 10)
```markdown
- [ ] Issue:
  - Severity:
  - Steps to Reproduce:
  - Expected:
  - Actual:
```

---

## 11. Governance Audit & System Settings

### Test Cases
- [x-pass] **TC-SET-01**: **Audit Trail Page (`/settings/audit`)**:
  - Verify audit events recorded for actions performed in prior test steps (e.g. `user.created`, `plan.approved`, `config.updated`, `task.created`).
- [x-pass] **TC-SET-02**: **Audit Filters**: Search actor name or action. Filter by Actor Role dropdown (All, Admin, QA Lead, QA Employee).
- [x-pass] **TC-SET-03**: **Audit Detail Drawer**: Click any audit log row. Verify slide-over drawer shows JSON diff payload, actor, role, timestamp, and entity details.
- [x-pass] **TC-SET-04**: **Export Audit Log**: Click *"Export Audit Log"*. Verify JSON or CSV export downloads with complete event data.
- [x-pass] **TC-SET-05**: **General Settings (`/settings/general`)**: Verify workspace configuration, retention policy dropdown, separate approver toggle, and kill switch status.
- [x-pass] **TC-SET-06**: **AI Providers Settings (`/settings/providers`)**:
  - Verify Ollama (Local) and Gemini (Cloud) settings cards.
  - Test connection buttons.
  - Verify AI usage matrix and token statistics.

### 📝 Error Log (Module 11)
```markdown
- [ ] Issue:
  - export csv only showing 1 row record.
  - workspae configureation, need explainantion what is the use of this section, and its add token should open sidedrawer.

```

---

## 🐛 Bug Triage & Defect Summary Template
*Jab bhi testing ke dauraan koi bug mile, usko yahan summarize karein:*

| Defect ID | Module | Title / Description | Severity | Status | Assigned To |
| :---: | :---: | :--- | :---: | :---: | :---: |
| BUG-01 | | | P0 / P1 / P2 / P3 | Open | |
| BUG-02 | | | P0 / P1 / P2 / P3 | Open | |
| BUG-03 | | | P0 / P1 / P2 / P3 | Open | |
| BUG-04 | | | P0 / P1 / P2 / P3 | Open | |

---

## 🎯 Final Sign-Off Checklist
- [x] All 11 modules tested across Admin, QA Lead, and QA Employee roles.
- [x] Dark mode theme verified across all pages and side drawers (no white background bleeding).
- [x] Notifications drawer tested with direct navigation to resources.
- [x] No console errors or broken navigation links detected.
- [x] Test Run Date: 23 nov 2026
- [x] Tester Signature / Sign-Off:shiv kumar

