# SentinelQA — UI Guidelines (`ui_guidelines.md`)

> Single source of truth for designing and implementing the **AI Website Testing Agent** admin dashboard in Next.js (App Router).  
> **Aesthetic:** Modern, minimalistic, Linear-inspired UI supporting both **Light Mode** and **Dark Mode** — matte surfaces, `1px` hairline borders instead of drop shadows, generous whitespace, strict monochrome chrome, semantic-only status colors, and fast tactile micro-animations.

---

## 1. Core Design Philosophy

1. **Matte Surfaces & Hairline `1px` Borders (Zero Drop Shadows)**
   - Never rely on blurred drop shadows for card depth. Establish hierarchy through subtle surface contrast (`--bg` vs `--surface` vs `--surface-elevated`) and `1px` borders (`--border`).
   - Interactive cards sharpen border contrast (`--border` → `--border-hover`) and step softly to `--surface-elevated` on hover.
2. **Strict Monochrome Chrome**
   - Navigation, frames, headers, inputs, and secondary buttons stay completely monochrome.
   - Color is permitted **only** for:
     - **Semantic statuses** (`Passed`, `Failed`, `Error`, `Running`, `In review`)
     - **Environment tags** (`Dev`, `Staging`, `QA`, `Production`)
     - **Subtle AI focus & primary active states** (`--primary` / `--ai-ring`)
3. **Human + Technical Typography**
   - `Inter` for human language (headings, descriptions, navigation, buttons).
   - `JetBrains Mono` (`tabular-nums`) for every technical metric, identifier, route, timestamp, and AI model parameter.
4. **Dual-Theme Parity (Light + Dark + System)**
   - Both Light Mode (`#FAFAFB` / `#FFFFFF`) and Dark Mode (`#0B0D14` / `#12151F`) are first-class citizens.
   - Never hardcode theme-specific hex values or `white/[...]` / `black/[...]` utilities inside components. Always reference CSS variables.
5. **Fast, Tactile, Quiet Motion**
   - Micro-animations stay within **120ms–250ms**. Use motion strictly to confirm interaction, soften entrances, and reflect live AI / runner execution.

---

## 2. Color System & CSS Tokens (Light & Dark)

### Surface, Border & Text Tokens

| Token                | Light Mode (`:root`) | Dark Mode (`.dark`) | Usage                                              |
| -------------------- | -------------------- | ------------------- | -------------------------------------------------- |
| `--bg`               | `#FAFAFB`            | `#0B0D14`           | Page canvas, input fields, table header strips     |
| `--surface`          | `#FFFFFF`            | `#12151F`           | Cards, sidebar, modals, secondary buttons          |
| `--surface-elevated` | `#F4F5F8`            | `#171B26`           | Interactive hover surfaces, active segments, chips |
| `--border`           | `#E7E8EC`            | `#232838`           | Default `1px` hairline borders & table dividers    |
| `--border-hover`     | `#CFD2DC`            | `#323950`           | Hover/active borders on cards, controls, modals    |
| `--text`             | `#0F1222`            | `#E8EAF2`           | Primary headings, body copy, table values          |
| `--text-muted`       | `#6B7080`            | `#8B90A3`           | Subtitles, metadata, column headers, inactive nav  |

### Theme-Safe Utility Surface Tokens

| Token            | Light Mode                  | Dark Mode                    | Usage                                              |
| ---------------- | --------------------------- | ---------------------------- | -------------------------------------------------- |
| `--topbar-bg`    | `rgba(250, 250, 251, 0.85)` | `rgba(11, 13, 20, 0.85)`     | Sticky topbar with `backdrop-filter: blur(10px)`   |
| `--overlay-bg`   | `rgba(15, 18, 34, 0.35)`    | `rgba(0, 0, 0, 0.62)`        | Backdrop behind modals, sheets, `⌘K` palette       |
| `--hover-row`    | `rgba(15, 18, 34, 0.025)`   | `rgba(255, 255, 255, 0.025)` | Table row & expandable header hover tint           |
| `--hover-subtle` | `rgba(15, 18, 34, 0.04)`    | `rgba(255, 255, 255, 0.04)`  | Ghost icon hover, nav item hover, neutral badge bg |
| `--track-bg`     | `#ECEEF2`                   | `rgba(255, 255, 255, 0.06)`  | Progress bar & status breakdown tracks             |

### AI Accent & Focus Tokens

| Token             | Light Mode                | Dark Mode                   | Usage                                             |
| ----------------- | ------------------------- | --------------------------- | ------------------------------------------------- |
| `--primary`       | `#4F46E5`                 | `#818CF8`                   | Primary CTA fill, active nav indicator, AI dot    |
| `--primary-hover` | `#4338CA`                 | `#6366F1`                   | Primary CTA hover                                 |
| `--primary-tint`  | `#EEF0FF`                 | `rgba(129, 140, 248, 0.12)` | Active sidebar link bg, AI security notice banner |
| `--primary-text`  | `#FFFFFF`                 | `#0B0D14`                   | Text inside solid `--primary` buttons (WCAG AA)   |
| `--ai-ring`       | `rgba(79, 70, 229, 0.25)` | `rgba(129, 140, 248, 0.30)` | `2px` focus ring on inputs & AI controls          |

### Semantic Status Tokens

| Status / Role | Light Text / Tint                 | Dark Text / Tint                       | Applied To                                              |
| ------------- | --------------------------------- | -------------------------------------- | ------------------------------------------------------- |
| **Success**   | `#16A34A` / `#E8F7EE`             | `#22C55E` / `rgba(34, 197, 94, 0.12)`  | `Passed`, `Completed`, `Approved`, positive deltas      |
| **Danger**    | `#DC2626` / `#FDECEC`             | `#EF4444` / `rgba(239, 68, 68, 0.12)`  | `Failed`, `Rejected`, `Production` badge, cancel/delete |
| **Warning**   | `#D97706` / `#FDF3E1`             | `#F59E0B` / `rgba(245, 158, 11, 0.12)` | `Error`, `In review`, HTTP-on-Production alert          |
| **Info**      | `#0284C7` / `#E6F4FB`             | `#38BDF8` / `rgba(56, 189, 248, 0.12)` | `Running`, `Live` pill, `Staging` badge                 |
| **Neutral**   | `--text-muted` / `--hover-subtle` | `--text-muted` / `--hover-subtle`      | `Queued`, `Pending`, `Skipped`, `Draft`, `Dev` badge    |

---

## 3. Theme Switching Architecture

1. **Supported Modes:** `light` · `dark` · `system` (default `system`).
2. **Persistence:** Managed via Zustand (`stores/ui.store.ts`) persisted under `sentinel-ui` in `localStorage`.
3. **Zero-Flash SSR Hydration:**
   - `<html suppressHydrationWarning>` prevents Next.js hydration warnings.
   - An inline pre-paint `<script>` in `app/layout.tsx` reads `localStorage` and applies `.dark` to `<html>` before first paint.
   - `<ThemeSync />` listens for OS `prefers-color-scheme` changes when mode is `system`.
4. **UI Control:** `<ThemeSwitch />` (3-way segmented icon toggle: Sun / Moon / Monitor) lives in the **Sidebar Footer** next to the signed-in user summary.

---

## 4. Typography & Numeric Discipline

- **UI Sans:** `Inter` (`font-feature-settings: "cv02", "cv03", "cv04", "cv11"`).
- **Technical Monospace:** `JetBrains Mono` (`font-variant-numeric: tabular-nums`).

| Role                        | Size   | Weight    | Font             | Notes                              |
| --------------------------- | ------ | --------- | ---------------- | ---------------------------------- |
| KPI Metric Value            | `24px` | `600`     | `JetBrains Mono` | `-0.02em` tracking, `tabular-nums` |
| Page Heading (`h1`)         | `20px` | `600`     | `Inter`          | `-0.02em` tracking                 |
| Card / Section Title (`h2`) | `14px` | `500`     | `Inter`          | —                                  |
| Body / Inputs               | `14px` | `400`     | `Inter`          | `1.5` line-height                  |
| Buttons / Table Cells / Nav | `13px` | `400–500` | `Inter`          | Table rows `44px` min-height       |
| Badges / Captions / Deltas  | `12px` | `500`     | `Inter` / `Mono` | Badges `22px` fixed height         |
| Table Headers / Env Tags    | `11px` | `500`     | `Inter` / `Mono` | Uppercase, `+0.05em` tracking      |

**Always use `.mono-data` (`tabular-nums`) for:** IDs (`run-942`, `plan-108`), URLs & routes (`/tracking`), durations (`214ms`, `12.4s`), timestamps (`15:39:01.120`), AI model strings (`ollama/qwen2.5:14b`), token counts, and pass rates (`91.6%`).

---

## 5. Layout, Spacing & Radii

- **Spacing Scale:** `4px` base grid (`4, 8, 12, 16, 20, 24, 32, 48`).
- **Content Max Width:** `1280px` centered, `24px` gutters (`16px` mobile).
- **Radii:**
  - `6px` — Inputs, buttons, selects, nav links, env tags, code boxes
  - `10px` — Cards, tables, toast notifications
  - `14px` — Modals, drawers, `⌘K` Command Menu
  - `999px` — Status badges, live indicators, avatars

### App Shell Geometry

- **Sidebar:** `240px` expanded / `64px` collapsed (icon-only). Responsive sheet below `1024px`.
  - Active item: `--primary-tint` fill + `2px` left vertical bar in `--primary`.
  - Footer: User avatar/role + `<ThemeSwitch />`.
- **Topbar:** `56px` sticky header (`--topbar-bg` + `backdrop-filter: blur(10px)`).
  - Left: Breadcrumbs (`Workspace / Section`).
  - Right: `⌘K` Command Menu trigger, AI provider status pill (`Ollama · Ready`), Notifications bell with unread dot.

---

## 6. Micro-Animations & Motion Language

| Interaction                 | Animation                            | Timing                                      | Implementation                                                      |
| --------------------------- | ------------------------------------ | ------------------------------------------- | ------------------------------------------------------------------- |
| **Card / Section Entrance** | Upward fade (`4px–5px`)              | `180–190ms` `cubic-bezier(0.16, 1, 0.3, 1)` | `.animate-enter` with `35–40ms` `--stagger`                         |
| **Tactile Button Press**    | Subtle inward scale (`scale(0.985)`) | `120ms ease-out`                            | `.tactile:active`                                                   |
| **Hover / Focus Border**    | Border & tint shift                  | `150ms ease-out`                            | `--border` → `--border-hover`; `--ai-ring` on focus                 |
| **Live AI / Runner Pulse**  | Quiet ambient scale & opacity        | `2000ms ease-in-out infinite`               | `.animate-ai-pulse` strictly on brand AI dot & `Running` status dot |
| **Sidebar Collapse**        | Width transition                     | `200ms ease-out`                            | `transition-[width]`                                                |

**Mandatory Reduced Motion:** Wrap animations so `@media (prefers-reduced-motion: reduce)` turns off keyframes, transitions, and press transforms globally.

---

## 7. Component Rules

- **Buttons:** `36px` default (`32px` compact, `40px` auth). Max **one** primary CTA (`--primary` + `--primary-text`) per view header. Loading replaces icon with `14px` spinner and sets `opacity: 0.5`.
- **Inputs & Selects:** `36px` height, `--bg` fill, `1px` `--border`, focus state switches border to `--primary` with `2px` `--ai-ring`. Inline error text `12px` `--danger`.
- **Cards:** `--surface` fill, `1px` `--border`, `10px` radius, `20px` padding, zero shadow.
- **Tables:** `44px` rows, `--bg` header strip, `1px` `--border` row dividers, no zebra striping, `--hover-row` hover tint, row actions in kebab menu or trailing link. Collapse/scroll cleanly below `640px`.
- **`StatusBadge`:** `22px` pill. **Never use color alone** — always render semantic icon (or pulsing dot for `Running`) + explicit text label.
- **`EnvBadge`:** `22px` height, `6px` radius, uppercase monospace (`DEV` neutral, `STAGING` info, `QA` primary tint, `PRODUCTION` danger tint).
- **`EngineSwitch`:** Segmented radio control (`Ollama Local` / `Gemini Cloud`) showing live provider health dot; offline providers are disabled.
- **`StepEditor` & `PlanLock`:** Inline editable case/step table during `Draft`/`In review`. Once `Approved`, displays a `--success-tint` lock banner and becomes strictly read-only (`Create new version` creates `vN+1`).
- **Toasts:** Bottom-right, `10px` radius, `1px` `--border-hover`, no shadow. Auto-dismiss `4s`; errors persist until dismissed.

---

## 8. Data States, Real-Time & Accessibility

1. **Mandatory Four Data States (`<StateView />`)**
   Every async data view must implement:
   - **Skeleton:** Pulsing hairline rows/cards matching real dimensions (never full-screen spinners).
   - **Empty:** Centered icon + plain message + primary CTA.
   - **Error:** Clear error summary + `"Retry"` button.
   - **Populated:** Rendered view.
2. **URL-Synchronized State:** Filters, tabs, sorting, and pagination must persist in `searchParams` so links are shareable and reload-safe.
3. **Real-Time Run Updates (`useRunSocket`):** Joins `run:{id}` room, merges `run:step` & `run:status` events into TanStack Query cache, shows `"Live"` badge while `running`, and falls back to `3s` polling when disconnected.
4. **Security & Trust UI Rules:**
   - Credentials are masked (`••••••••`) everywhere and accompanied by `"Never sent to AI"` notices on Website Config and Task Creation.
   - Selecting `Production` with `http://` triggers an inline `--warning` HTTPS notice.
   - Unauthorized actions are hidden in UI via `can(role, permission)` and enforced server-side.
5. **Accessibility Checklist (Lighthouse ≥ 95):**
   - [ ] WCAG AA contrast (`≥ 4.5:1`) verified in **both** Light and Dark themes.
   - [ ] Visible `2px` `--ai-ring` focus indicator on all interactive elements.
   - [ ] Keyboard shortcuts: `⌘K` / `Ctrl+K` toggles Command Menu, `Esc` closes modals/drawers.
   - [ ] Semantic ARIA roles (`radiogroup`, `tablist`, `tabpanel`, `breadcrumb`, `aria-label` on icon buttons).
   - [ ] `StatusBadge` always pairs icon + label.
   - [ ] `prefers-reduced-motion` respected globally.
