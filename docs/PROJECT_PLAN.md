# ETPB Legal CRM — Complete Project Plan

**Repository:** [imranshabbir-developer/etpb_legal_crm](https://github.com/imranshabbir-developer/etpb_legal_crm)  
**Apps:** `CMS_FE` (TanStack Start + React) · `CMS_BE` (Express + Sequelize + PostgreSQL + JWT)  
**Plan date:** 2026-08-13  
**Goal:** Turn the current UI + auth-only API into a **full-functional Legal CRM** with real DB data, portable setup on any laptop, and a clear Railway deployment path.

---

## Table of contents

1. [Current state (after full scan)](#1-current-state-after-full-scan)
2. [Target architecture](#2-target-architecture)
3. [Zero-backup DB strategy (other laptops)](#3-zero-backup-db-strategy-other-laptops)
4. [Phase-wise delivery plan](#4-phase-wise-delivery-plan)
5. [Reports module (role-based legal CRM exports)](#5-reports-module-role-based-legal-crm-exports)
6. [Frontend ↔ Backend integration map](#6-frontend--backend-integration-map)
7. [What you must provide](#7-what-you-must-provide)
8. [Railway deployment guide (FE + BE)](#8-railway-deployment-guide-fe--be)
9. [How to verify APIs (step-by-step)](#9-how-to-verify-apis-step-by-step)
10. [How to verify Reports (UI exports)](#10-how-to-verify-reports-ui-exports)
11. [Testing checklist (agent + you)](#11-testing-checklist-agent--you)
12. [Risks, order of work, and definition of done](#12-risks-order-of-work-and-definition-of-done)

---

## 1. Current state (after full scan)

### What already works

| Area | Status |
| --- | --- |
| FE shell UI (dashboard, courts, cases UI, users UI, settings UI) | ✅ Built |
| Role-based UI permissions | ✅ Client-side + API permissions when logged in |
| BE modular structure | ✅ `config` / `models` / `middleware` / `modules` / `routes` |
| Postgres connection | ✅ Local DB `etpb_cms` |
| JWT login + `/me` + `/roles` | ✅ Seeded users/roles/permissions |
| FE login wired to API | ✅ Roles from DB, JWT stored |

### What is still mock / local only

| Module | FE source today | Backend |
| --- | --- | --- |
| Cases CRUD | Wired to `/api/cases` (Postgres) | ✅ Case model + CRUD + seed |
| Courts / categories | Loaded from `/api/courts`; Admin can add courts | ✅ Court model + seed + list/get/create/update |
| Users directory CRUD | Wired to `/api/users` | ✅ Phase 1 done |
| Hearing reminders | Live from case next dates (`/api/reminders` + dashboard) | ✅ Phase 5 |
| Persistent notifications | Per-user inbox with read state (`/api/notifications`) | ✅ Complete Remaining |
| Settings / modules | Wired to `/api/settings/*` (theme local) | ✅ Phase 6 |
| Dashboard charts / aggregates | `/api/dashboard/summary` + live cases | ✅ Phase 4 (summary) |
| Assistant answers | Live case counts when signed in | Depends on case-store / dashboard |

### Existing API surface

```text
GET  /api/health
GET  /api/roles
POST /api/auth/login
GET  /api/auth/me
GET/POST /api/users  PATCH /api/users/:id  PATCH /api/users/:id/status
GET/POST /api/courts  GET/PATCH /api/courts/:id
GET/POST /api/cases  GET/PATCH/DELETE /api/cases/:id  DELETE /api/cases
GET  /api/dashboard/summary
GET  /api/reminders
GET  /api/notifications  PATCH /api/notifications/:id/read  POST /api/notifications/read-all
GET/PATCH /api/settings/profile  POST /api/settings/password
GET/PATCH /api/settings/modules
```

### Seeded demo accounts (already in DB seed)

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | `superadmin@ips.gov.pk` | `SuperAdmin@123` |
| Admin | `admin@ips.gov.pk` | `Admin@123` |
| Staff | `staff@ips.gov.pk` | `Staff@123` |
| Staff | `records@ips.gov.pk` | `Staff@123` |

---

## 2. Target architecture

```text
┌────────────────────┐         JWT + JSON          ┌────────────────────┐
│  CMS_FE (Railway   │  ────────────────────────►  │  CMS_BE (Railway   │
│  or Cloudflare)    │  ◄────────────────────────  │  Node service)     │
│  React / Vite      │                             │  Express + JWT     │
└────────────────────┘                             └─────────┬──────────┘
                                                             │
                                                             ▼
                                                   ┌────────────────────┐
                                                   │  PostgreSQL        │
                                                   │  (Railway plugin   │
                                                   │   or local)        │
                                                   └────────────────────┘
```

### Backend modules to build (modular)

```text
CMS_BE/src/modules/
  auth/          ✅
  roles/         ✅
  users/         ✅
  courts/        ✅
  cases/         ✅
  dashboard/     ✅
  reminders/     ✅ (live from case next-hearing dates)
  notifications/ ✅ (persistent per-user inbox + read state)
  settings/      ✅
```

### Frontend clients to build

```text
CMS_FE/src/lib/api/
  client.ts   ✅
  auth.ts     ✅
  users.ts    ✅
  courts.ts   ✅
  cases.ts    ✅
  dashboard.ts ✅
  reminders.ts ✅
  notifications.ts ✅
  settings.ts ✅
```

`case-store` is API-backed (no localStorage primary store). **Reminders** are derived live from case next-hearing dates (`GET /api/reminders`). **Notifications** are a separate Postgres inbox synced from those reminders, with per-user `readAt`.

---

## 3. Zero-backup DB strategy (other laptops)

**Problem you raised:** you do not want to copy/backup a local Postgres dump when moving to another laptop.

**Solution:** treat the database as **reproducible from code**.

### Principle

1. Schema is created by code (`npm run db:migrate` / Sequelize sync or proper migrations).
2. Reference data (roles, permissions, courts, categories, demo users, sample cases) is created by **idempotent seeds**.
3. New machine only needs: Postgres installed + `.env` + `npm run db:setup`.

No SQL dump required.

### What we will implement (Phase 0–1)

| Artifact | Purpose |
| --- | --- |
| `CMS_BE/src/database/migrate.js` | Ensure tables exist |
| `CMS_BE/src/database/seed.js` | Expand to courts, categories, sample cases |
| `CMS_BE/src/database/seed-data/` | JSON/JS reference data (courts matrix, sample cases) |
| `npm run db:setup` | `migrate && seed` one command |
| Optional `npm run db:reset` | Drop + recreate + seed (dev only) |
| Root `SETUP.md` / this plan | Exact steps for a new laptop |

### New laptop checklist (no DB backup)

```bash
# 1) Install Node 20+ and PostgreSQL
# 2) Create empty DB (once)
createdb etpb_cms   # or via pgAdmin / psql

# 3) Clone + backend
git clone https://github.com/imranshabbir-developer/etpb_legal_crm.git
cd etpb_legal_crm/CMS_BE
cp .env.example .env
# edit POSTGRES_* if needed
npm install
npm run db:setup          # <-- creates schema + ALL seed data
npm run dev

# 4) Frontend
cd ../CMS_FE
cp .env.example .env
npm install
npm run dev
```

After `db:setup`, the other laptop has the **same roles, users, courts, and demo cases** as the source of truth in git.

### Important limits

- Seeds recreate **canonical demo/reference data**.
- Real production data entered by users should live in Railway Postgres (or a shared remote DB), not only on one laptop.
- For team sharing of *production-like* data later: use Railway DB URL in `.env` (shared), not local dumps.

---

## 4. Phase-wise delivery plan

> Each phase ends with: **API implemented → agent-tested → FE integrated → you UAT**.  
> Do not skip phases; later phases depend on earlier tables.

---

### Phase 0 — Project hygiene & portable bootstrap (foundation)

**Objective:** Any developer laptop / CI can stand up the stack without a DB dump.

**Backend**
- Harden `db:setup` (migrate + seed) as the single entry.
- Add `db:reset` (dev only) with safety guard (`NODE_ENV !== production`).
- Expand `.env.example` comments.
- Add `scripts/verify-env.js` (checks Postgres reachable + required vars).
- Keep `nodemon` `legacyWatch` for network drives (already fixed).

**Frontend**
- Ensure `.env.example` documents `VITE_API_URL`.
- Align root README with `CMS_BE` / `CMS_FE` runbook.

**Deliverables**
- `docs/PROJECT_PLAN.md` (this file)
- Updated README setup section
- Working `npm run db:setup` on clean DB

**Exit criteria**
- Fresh Postgres DB + `db:setup` → login works with seeded users.

---

### Phase 1 — Auth & users (complete identity) ✅ IMPLEMENTED

**Objective:** Login/roles already done; finish real user management.

**Status:** Delivered — Users CRUD APIs + FE Users page wired to Postgres. Seed includes **7** demo users.

**Backend APIs**
| Method | Endpoint | Permission |
| --- | --- | --- |
| `GET` | `/api/users` | `users:view` |
| `POST` | `/api/users` | `users:manage-staff` / `users:manage-admin` |
| `PATCH` | `/api/users/:id` | manage perms |
| `PATCH` | `/api/users/:id/status` | manage perms |
| `POST` | `/api/auth/change-password` | authenticated |
| `POST` | `/api/auth/logout` | optional (client clear + future token blacklist) |

**Rules**
- Reuse existing `authorize()` middleware.
- Enforce `canManageRole(actor, target)` server-side (mirror FE `permissions.ts`).
- Never return `passwordHash`.

**Frontend integration**
- Replace `_shell.users.tsx` in-memory list with API client.
- Keep demo prefill on login only (not as source of truth for Users page).

**Agent test**
- CRUD users via API; permission denied for staff; login as new user.

**Exit criteria**
- Users page reflects Postgres; refresh keeps data.

---

### Phase 2 — Courts & categories (reference data in DB) ✅ IMPLEMENTED

**Status:** Delivered — `Court` model + seed (5 internal + 7 external) + `GET /api/courts` (+ `?layer=`) + `GET /api/courts/:id|slug`. FE Internal/External/Dashboard/Add-case load from API with offline fallback.

**Objective:** Stop relying on hardcoded `courts.ts` as source of truth.

**Backend**
- Models: `Court` (slug + JSONB categories; categories kept as enum-like strings on the court)
- Seed from FE court matrix (internal 5 + external 7, category rules)
- APIs:
  - `GET /api/courts`
  - `GET /api/courts/:id` (UUID or slug)
  - `GET /api/courts?layer=internal|external`

**Frontend**
- Load courts from API for Internal/External index, dashboard blocks, category route loaders, Add Case picker.
- Temporary FE fallback if API down (`courts.ts`).

**Agent verified**
- `npm run db:seed` → 12 courts
- `npm run test:courts` → **PASSED**

**Exit criteria**
- Court cards and category links come from DB seed on any new laptop. ✅

---

### Phase 3 — Cases API (core CRM) ✅ IMPLEMENTED

**Status:** Delivered — Case model + seed (~140 demo rows) + full CRUD APIs. FE case store loads/mutates via API (no localStorage primary store).

**Objective:** Full case register persisted in Postgres; FE CRUD talks to API.

**Backend model `Case`**
Map all FE `CaseRecord` fields (`types.ts`) to columns + indexes on:
- `court_slug` / `court_uuid`, `layer`, `case_category`, `case_no`, `next_date_of_hearing`

**APIs**
| Method | Endpoint | Permission |
| --- | --- | --- |
| `GET` | `/api/cases?layer=&courtId=&category=&q=` | `cases:view` |
| `GET` | `/api/cases/:id` | `cases:view` |
| `POST` | `/api/cases` | `cases:create` |
| `PATCH` | `/api/cases/:id` | `cases:edit` |
| `DELETE` | `/api/cases/:id` | `cases:delete` |
| `DELETE` | `/api/cases?courtId=&category=` (bulk clear) | `cases:delete` |

**Seed**
- Port former FE mock register into seed so demos look full on day one.

**Frontend**
- `lib/api/cases.ts` + `case-store.tsx` API-backed
- Removed `mock-cases.ts` / localStorage as primary store

**Agent verified**
- `npm run test:cases` → **PASSED**

**Exit criteria**
- Cases survive browser refresh and work on another laptop after `db:setup`. ✅

---

### Phase 3.5 — Reports & exports (client-first, then API)

**Objective:** Government-style operational reports (PDF / CSV / DOCX) on every register and dashboard where a legal officer would need them — without blocking case API work.

See full matrix in [Section 5](#5-reports-module-role-based-legal-crm-exports).

**This phase (UI-first — in progress / delivered in FE):**
- Dashboard: Consolidated Case Position Report
- Internal / External overview: Layer-wise summary reports
- Case register: Court × Category Cause List / Register export
- Users page (Admin+): User Directory report
- Formats: **PDF** (Govt. of Punjab / ETPB letterhead style), **CSV**, **DOCX**
- Role gating via `cases:view` / `users:view` (later `reports:*` permissions in seed)

**Later (with Phase 3–4 APIs):**
- Server-side PDF generation for large registers
- Scheduled / dated “as on” reports from Postgres
- Audit log of who exported what

**Exit criteria (UI-first)**
- User can generate PDF/CSV/DOCX from dashboard, court pages, case register, and users page without breaking existing CRUD.

---

### Phase 4 — Dashboard analytics API ✅ IMPLEMENTED

**Status:** Delivered — `GET /api/dashboard/summary` returns live Postgres aggregates: layer/category totals, per-court counts (`byCourt`), last-6-month institute series, upcoming hearings, and month-over-month `trends`. Dashboard cards/charts/court blocks use that payload (plus `/api/reminders`, `/api/notifications`, `/api/courts`). No FE mock series or hardcoded trend values.

**Also in this delivery:** Admin/Super Admin can **Add court** on Internal/External pages (`POST /api/courts`, permission `courts:manage`).

**Exit criteria**
- Changing a case updates dashboard after reload. ✅

---

### Phase 5 — Reminders + persistent notifications ✅ IMPLEMENTED

**Status:** Two complementary surfaces:

1. **Reminders** — computed from live case data (`nextDateOfHearing`, pending/RO/direction follow-ups) via `GET /api/reminders`. No read state. Active future events remain visible on login and progress through **In 2 days → Tomorrow → Today → Overdue** until the case is completed or its next date is updated. FE: sidebar, topbar clock dropdown, `/reminders` page, filters, dashboard reminder panel, mobile nav.
2. **Notifications** — per-user Postgres inbox (`Notification` model + `GET/PATCH/POST /api/notifications*`) synced from reminders, with `readAt`, mark-one / mark-all, unread badge, topbar dropdown, `/notifications` page, and register deep links.

---

### Phase 6 — Settings & module flags ✅ IMPLEMENTED

**Status:** Delivered — `GET/PATCH /api/settings/profile`, `POST /api/settings/password`, `GET/PATCH /api/settings/modules`. Super Admin only for modules (`modules:configure` revoked from Admin seed). FE Settings wired; sidebar/dashboard honor module flags.

**Exit criteria**
- Module flags survive refresh; staff cannot change modules. ✅

---

### Phase 7 — Hardening, docs, deploy readiness ✅ IN PROGRESS

**Objective:** Production-ready packaging.

**Status:** Formal migration runner + initial schema migration added. Production no longer relies on `alter: true`. Global API rate limit, PGSSL dialect support, JWT strength checks, bulk-delete/court query validation, Railway config + Dockerfile added for BE and FE. Root `SETUP.md` documents portable laptop bootstrap. Reminders remain derived; persistent notifications inbox is also live (see Phase 5).

- Proper Sequelize migrations (replace `alter: true` for prod) ✅ (`src/database/migrator.js` + `migrations/`)
- `DATABASE_URL` support ✅
- `db:reset` + `verify:env` ✅
- Request validation on mutating/list routes ✅ (cases query/pagination/bulk-delete, courts layer query)
- Central audit logging (optional) — deferred
- API smoke scripts ✅ (auth/users/courts/cases/reminders/notifications/settings)
- Dockerfiles + Railway configs ✅ (`CMS_BE` + `CMS_FE`)
- Portable setup doc ✅ (`SETUP.md`)
- Security pass: CORS lock, strong JWT, rate limits, helmet ✅ (global + login rate limits)

**Exit criteria**
- Staging deploy on Railway works; smoke tests green. (deploy still needs your Railway account)

---

### Phase 8 — Polish & UAT ✅ IN PROGRESS

**Objective:** UX polish, missing report coverage, docs accuracy, and UAT readiness.

**Status:** Core polish implemented — topbar case search, Pending Hearings / Next Date List export,
loading/error/empty banners on dashboard / registers / courts / users, assistant CRM copy + live
counts, and `CMS_FE/README.md` rewritten for IPS/ETPB. Remaining: mobile QA pass with you, and
formal role-matrix UAT.

- Loading/empty/error states on key FE pages ✅ (dashboard, case register, court overviews, users)
- Topbar global case search ✅ (filters loaded cases → opens court register)
- Pending Hearings / Next Date List report ✅ (Dashboard + case register extras)
- Assistant copy fixed (no CRM “leads/deals”); live counts when signed in ✅
- Frontend README replaced (scaffold “Verdant Insights” removed) ✅
- Mobile QA for login centering, tables, dialogs — pending with you
- Role matrix UAT with you — pending
- Performance: pagination on cases (`?page=&limit=`) — **implemented and smoke-tested**

**Exit criteria**
- UAT signed off for Staff / Admin / Super Admin paths; no dead search or missing planned reports.

---

## 5. Reports module (role-based legal CRM exports)

### Legal / ops rationale

As a government legal CRM (ETPB / IPS), officers need **official “as on date” statements** for:
- Board / Chairman briefings
- Counsel briefing packs
- Court-wise cause lists / pending registers
- Compliance on restraining & direction matters
- Audit of who has system access (Admin+)

Exports must look like **Government of Punjab departmental reports**: formal letterhead block, file/reference line, “Confidential / For Official Use”, tabular body, prepared-by / generated-on footer — not marketing charts alone.

### Role × report matrix

| Report | Where in UI | Staff | Admin | Super Admin | Formats |
| --- | --- | --- | --- | --- | --- |
| **Consolidated Case Position** (totals by layer & category) | Dashboard | ✅ | ✅ | ✅ | PDF, CSV, DOCX |
| **Internal Courts Summary** | Internal overview | ✅ | ✅ | ✅ | PDF, CSV, DOCX |
| **External Courts Summary** | External overview | ✅ | ✅ | ✅ | PDF, CSV, DOCX |
| **Court Category Register / Cause List** | Case register page | ✅ | ✅ | ✅ | PDF, CSV, DOCX |
| **Pending Hearings / Next Date List** | Dashboard + register (filter pending) | ✅ | ✅ | ✅ | PDF, CSV, DOCX |
| **User Directory** | Users & Roles | ❌ | ✅ | ✅ | PDF, CSV, DOCX |
| **Executive Board Pack** (all layers + category annex) | Dashboard (Admin+) | ❌ | ✅ | ✅ | PDF, DOCX |
| **Module / access audit** (future) | Settings | ❌ | ❌ | ✅ | PDF, CSV |

**Permission rule (current FE):**  
- Case reports → requires `cases:view`  
- User directory → requires `users:view`  
- Executive pack → Admin / Super Admin only  

**Future BE permissions to seed:** `reports:export`, `reports:executive`, `reports:users`.

### Official PDF layout (Govt. of Punjab / ETPB style)

```text
┌────────────────────────────────────────────────────────────┐
│              GOVERNMENT OF THE PUNJAB                        │
│         EVACUEE TRUST PROPERTY BOARD (ETPB)                  │
│              Legal CRM Management System                     │
│────────────────────────────────────────────────────────────│
│  Report Title: ……………………………     As on: DD-MM-YYYY          │
│  Office / Court: ………………………     File Ref: ETPB/LGL/…        │
│  Generated by: Name (Role)       Classification: Official Use│
│────────────────────────────────────────────────────────────│
│  [ Tabular register / summary statistics ]                   │
│────────────────────────────────────────────────────────────│
│  Prepared through ETPB Legal CRM · Page X of Y · Not valid   │
│  as certified copy unless signed by authorised officer       │
└────────────────────────────────────────────────────────────┘
```

### Delivery status

| Item | Status |
| --- | --- |
| Plan + role matrix | ✅ This section |
| FE export UI (PDF / CSV / DOCX) | ✅ Client-side (uses current case store data) |
| Server-side report jobs | ⬜ After Cases API (Phase 3) |

### Verify reports (quick)

See [Section 10](#10-how-to-verify-reports-ui-exports).

---

## 6. Frontend ↔ Backend integration map

| FE route / feature | Replace this | With API |
| --- | --- | --- |
| `/` Login | already API | keep; optional remove DEMO prefill later |
| `/users` | Postgres directory | `/api/users` |
| `/internal`, `/external` | DB courts | `/api/courts` |
| `/internal/:court/:category` case register | API case-store | `/api/cases?...` |
| `/external/:court/:category` | same | same |
| `/dashboard` | live aggregates + reminders + unread | `/api/dashboard/summary` + `/api/reminders` + `/api/notifications` |
| `/reminders` | live hearing reminders | `/api/reminders` |
| `/notifications` | persistent inbox + read state | `/api/notifications` |
| `/settings` | profile/password/modules | `/api/settings/*` |
| Permission gates `can()` | already uses API permissions | keep; ensure every mutating API checks server-side too |

**Integration rule:** UI may hide buttons, but **server always enforces** permissions.

---

## 7. What you must provide

Provide these when available. Work can start on Phases 0–3 with local defaults; production/Railway items are required before Phase 7 deploy.

### A. Required for local multi-laptop (can use defaults)

| Item | Why | Default if you say nothing |
| --- | --- | --- |
| Postgres installed on each laptop | Runtime DB | You already use local Postgres |
| DB name/user/password | `.env` | `etpb_cms` / `postgres` / `ipsdb` |
| Confirm demo passwords OK for seeds | Shared seed | Current demo passwords |

### B. Required for production / Railway

| Item | Why |
| --- | --- |
| **Railway account** access | Deploy FE + BE + Postgres |
| **Production `JWT_SECRET`** (long random string) | Sign tokens safely |
| **Production CORS origin** (FE public URL) | BE must allow FE domain |
| Preferred **custom domains** (optional) | `api.yourdomain.com`, `crm.yourdomain.com` |
| Confirm **FE host strategy** | Railway static/Node **or** Cloudflare Pages (FE build currently Nitro Cloudflare preset) |

### C. Optional / later

| Item | Why |
| --- | --- |
| SMTP (host, user, pass, from) | Forgot-password emails |
| Official logo / brand assets final | Replace temp-hidden branding |
| Real historical case Excel/CSV | Import instead of demo seed cases |
| Super-admin vs Admin permission differences | Today seed gives both full keys — confirm if SA should be stricter |
| Backup policy for Railway Postgres | Automated backups on paid plans |

### D. Decisions you should confirm (short answers)

1. Should **Staff** create cases? (UI/API currently: no create for staff)
2. Should deleting cases be soft-delete (`deleted_at`) or hard delete?
3. One Railway project with 3 services (FE, BE, Postgres) — OK?
4. Keep Cloudflare FE build, or switch FE to a simpler Node/static deploy on Railway?

---

## 8. Railway deployment guide (FE + BE)

### Short answer

**Yes — you can deploy both frontend and backend on Railway**, plus PostgreSQL as a Railway plugin/service.

Recommended layout (one Railway project):

| Service | What runs | Notes |
| --- | --- | --- |
| `etpb-db` | PostgreSQL plugin | Provides `DATABASE_URL` |
| `etpb-api` | `CMS_BE` | Node, start `npm start`, run migrate/seed on release |
| `etpb-web` | `CMS_FE` | Build + serve (see options below) |

### Why FE needs an extra decision

`CMS_FE` Vite config currently builds with **Nitro preset `cloudflare-module`**. That is optimized for **Cloudflare**, not Railway’s Node containers by default.

**Options:**

| Option | FE host | BE host | Recommendation |
| --- | --- | --- | --- |
| **A (simplest on Railway)** | Change FE build to Node/static (Nitro `node-server` or Vite SPA static) and deploy on Railway | Railway | Best if you want everything in Railway |
| **B (hybrid)** | FE on Cloudflare Pages/Workers | BE + Postgres on Railway | Fits current Cloudflare preset |
| **C** | Keep FE on Railway via Docker that runs `vite preview` / Node server | Railway | Works, slightly heavier |

This plan assumes **Option A or B**; Phase 7 will implement the chosen one.

### Railway — Backend steps (outline)

1. Create Railway project → Add **PostgreSQL**.
2. Add service from GitHub repo, root directory `CMS_BE`.
3. Set env vars:
   - Either parse `DATABASE_URL` **or** map Railway PG vars into `POSTGRES_*`
   - `JWT_SECRET`, `CORS_ORIGIN=https://<your-fe-domain>`, `NODE_ENV=production`, `PORT` (Railway injects)
4. Build: `npm install`
5. Start: `npm start`
6. Release command: `npm run db:setup` (or migrate-only in prod + controlled seed)
7. Public networking → generate API domain, e.g. `https://etpb-api.up.railway.app`

### Railway — Frontend steps (outline)

1. Add second service, root `CMS_FE`.
2. Env: `VITE_API_URL=https://etpb-api.up.railway.app/api` (must be available at **build** time for Vite).
3. Build/start commands depend on Option A/B.
4. Set BE `CORS_ORIGIN` to the FE public URL.

### Local vs Railway DB

- Local laptop: local Postgres + `db:setup` seed (no dump).
- Production: Railway Postgres; run migrations on deploy; seed **once** (or seed only reference data, not fake cases, in prod).

---

## 9. How to verify APIs (step-by-step)

### Prerequisites

1. Postgres running.
2. Backend:

```bash
cd CMS_BE
npm install
npm run db:setup
npm run dev
```

3. API base: `http://127.0.0.1:4000/api`

### Tool options

- **Browser** (GET only)
- **curl / PowerShell**
- **Postman / Insomnia** (import collection once we add it in Phase 7)
- Built-in: `npm run test:auth` (exists today)

---

### Test 1 — Health

**PowerShell**

```powershell
Invoke-RestMethod http://127.0.0.1:4000/api/health
```

**Expect:** `success: true`, service healthy.

---

### Test 2 — Roles (login dropdown source)

```powershell
Invoke-RestMethod http://127.0.0.1:4000/api/roles
```

**Expect:** array including `super-admin`, `admin`, `staff` with permission keys.

---

### Test 3 — Login

```powershell
$body = @{ email = "admin@ips.gov.pk"; password = "Admin@123"; role = "admin" } | ConvertTo-Json
$login = Invoke-RestMethod -Method Post -Uri http://127.0.0.1:4000/api/auth/login -ContentType "application/json" -Body $body
$login.data.token
$login.data.user
```

**Expect:** `token` string + user `role: admin` + `permissions` array.

**Negative tests**
- Wrong password → `401`
- `role: "staff"` with admin account → `403` role mismatch

---

### Test 4 — Current user (`/me`)

```powershell
$headers = @{ Authorization = "Bearer $($login.data.token)" }
Invoke-RestMethod http://127.0.0.1:4000/api/auth/me -Headers $headers
```

**Expect:** same email/role; invalid token → `401`.

---

### Test 5 — Automated smoke (already in repo)

```bash
cd CMS_BE
npm run test:auth
```

**Expect:** health, roles, login, me, bad password, role mismatch all printed OK.

---

### Test 6 — Frontend login UAT (after BE running)

1. `cd CMS_FE && npm run dev`
2. Open http://localhost:3000
3. Select **Admin** (prefills) → Login
4. Confirm dashboard opens
5. Hard refresh — session should restore via `/me`
6. Logout → must return to login
7. Staff login → Users menu hidden; cannot add/delete cases (UI)

---

### Test 7 — Courts API + UI (Phase 2) ✅

**Automated**

```powershell
cd CMS_BE
npm run db:seed   # ensures 12 courts exist
npm run test:courts
```

**Expect:** `Phase 2 courts smoke test PASSED` (12 total, 5 internal, 7 external, slug lookup OK, missing → 404).

**Manual API**

```powershell
Invoke-RestMethod "http://127.0.0.1:4000/api/courts"
Invoke-RestMethod "http://127.0.0.1:4000/api/courts?layer=internal"
Invoke-RestMethod "http://127.0.0.1:4000/api/courts/federal-secretary"
```

**Frontend UAT**

1. Ensure BE (`:4000`) and FE (`:3000`) are running.
2. Login as Admin → **Internal Courts**.
3. Page description should say **“Courts loaded from database.”** (not “offline court list”).
4. Confirm 5 court cards; open **Federal Secretary → Decided Cases** (register loads).
5. Open **External Courts** → 7 cards; open **Supreme Court** → only Restraining + Direction categories.
6. Optional: stop BE briefly and refresh Internal — should show fallback + warning banner.

---

### Test 8 — Cases + Dashboard (Phase 3–4) ✅

**Automated**

```powershell
cd CMS_BE
npm run db:seed
npm run test:cases
```

**Expect:** `Phase 3 cases + dashboard + court-create smoke test PASSED`

**Frontend UAT**

1. Logout and login again as Admin (refreshes `courts:manage` permission).
2. Dashboard header should say **Live database: N cases** (N ≈ 140 after seed).
3. Charts / stat cards should match DB (not fixed fake trends).
4. Open Federal Secretary → Decided Cases — rows from DB; add/edit/delete persists after refresh.
5. Internal / External → **Add court** → create a court → it appears in the grid.
6. Staff cannot add courts or delete cases.

---

### Future API tests (after each phase)

As APIs are added, agent will extend scripts:

| Phase | Script / checks |
| --- | --- |
| Phase 1 | `test:users.js` — list/create/status + staff forbidden ✅ |
| Phase 2 | `test:courts.js` — layers/categories match seed ✅ |
| Phase 3 | `test:cases.js` — CRUD + filters + permissions + dashboard + court create ✅ |
| Phase 4 | covered in `test:cases.js` (`/dashboard/summary`) ✅ |
| Phase 5 | `test:reminders.js` + `test:notifications.js` ✅ |
| Phase 6 | `test:settings.js` |

Also verify with JWT of each role after every mutating endpoint.

---

## 10. How to verify Reports (UI exports)

Use these steps after FE is running (`cd CMS_FE && npm run dev`).

### A. Dashboard — Consolidated Case Position

1. Login as **Staff** or **Admin**.
2. Open **Dashboard**.
3. Find the green panel **“Official reports & exports”** (under the page header actions / below stats).
4. Click **PDF** → download should start (`ETPB_Case_Position_….pdf`).
5. Open PDF: check header **GOVERNMENT OF THE PUNJAB / EVACUEE TRUST PROPERTY BOARD**, as-on date, summary table.
6. Click **CSV** and **Word** — files download with same figures.

**Admin / Super Admin only:** button **Executive pack (PDF)** should appear; Staff should **not** see it.

### B. Internal / External overview

1. Open **Internal Courts** (sidebar).
2. Use report bar → export **Internal Courts Summary**.
3. Repeat on **External Courts**.

### C. Case register (court × category)

1. Open any court → category (e.g. Internal → Chairman → Pending Cases).
2. On the register panel, use **Export PDF / CSV / Word**.
3. PDF should list rows for **that court + category only**.
4. Add or edit a case, export again — new data should appear (reads live from case store).

### D. Users directory (Admin+)

1. Login as **Admin**.
2. Open **Users & Roles**.
3. Export directory PDF/CSV/Word.
4. Login as **Staff** → Users page blocked; no user report.

### E. Regression (must still work)

- Add / edit / delete case
- Role permissions (Staff cannot delete)
- Login / logout / dashboard charts

---

## 11. Testing checklist (agent + you)

### Agent responsibilities (before handing to you)

- [ ] Implement APIs for the phase
- [ ] Seed/migrate works on empty DB
- [ ] Run automated API smoke for that phase
- [ ] Wire FE for that phase
- [ ] Confirm sample requests/responses locally
- [ ] Tell you phase is ready for UAT

### Your UAT (each phase)

- [ ] Fresh login with Admin / Staff / Super Admin
- [ ] Permission differences visible
- [ ] Data survives refresh
- [ ] Optional: second machine / empty DB + `db:setup` still works
- [ ] Mobile login centered; main flows usable

---

## 12. Risks, order of work, and definition of done

### Risks

| Risk | Mitigation |
| --- | --- |
| Network drive file watch issues | nodemon `legacyWatch` (done for BE); FE Vite already polling |
| `alter: true` unsafe in prod | Phase 7 formal migrations |
| FE Cloudflare preset vs Railway | Decide Option A/B early (Section 7) |
| Admin ≈ Super Admin permissions | Confirm product rule; adjust seed |
| localStorage cases diverge from API | Phase 3 cutover; clear old `ips.cases.v1` |

### Recommended implementation order

`Phase 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8`

Phase 3 (Cases) is the largest; everything CRM-critical depends on it.

### Definition of “full functional”

1. Auth, users, courts, cases, dashboard, settings, reminders, and notifications all use Postgres via API. Reminders are derived from case next dates; the notifications inbox stores per-user read state.
2. New laptop: clone + Postgres + `db:setup` + env → full demo without any DB backup file.
3. Permissions enforced on server.
4. Deploy path documented and smoke-tested (Railway and/or Cloudflare hybrid).
5. You can verify every API with the steps in Section 8 (+ phase scripts).

---

## Appendix A — Suggested future endpoint catalog

```text
# Auth / roles (done)
GET  /api/health
GET  /api/roles
POST /api/auth/login
GET  /api/auth/me

# Users (Phase 1)
GET    /api/users
POST   /api/users
PATCH  /api/users/:id
PATCH  /api/users/:id/status

# Courts (Phase 2)
GET   /api/courts
GET   /api/courts/:id
POST  /api/courts
PATCH /api/courts/:id

# Cases (Phase 3)
GET    /api/cases?layer=&courtId=&category=&q=&page=&limit=
GET    /api/cases/:id
POST   /api/cases
PATCH  /api/cases/:id
DELETE /api/cases/:id
DELETE /api/cases            (bulk ids or courtId+category)

# Dashboard (Phase 4)
GET /api/dashboard/summary
  → total, byLayer, byCategory, byCourt, monthly[6], upcomingHearings, trends, categorySplit

# Reminders (Phase 5 — derived live alerts)
GET /api/reminders?daysAhead=&limit=

# Notifications (Phase 5 — persistent per-user inbox)
GET   /api/notifications
PATCH /api/notifications/:id/read
POST  /api/notifications/read-all

# Settings (Phase 6)
GET   /api/settings/profile
PATCH /api/settings/profile
POST  /api/settings/password
GET   /api/settings/modules
PATCH /api/settings/modules
```

> Phase 5 delivers **both** live reminders (no read state) and a persistent notifications inbox (with `readAt`). The inbox is synced from reminder-worthy case dates.

---

## Appendix B — Immediate next action

Remaining out-of-band items:

1. Role-matrix UAT with you (Staff / Admin / Super Admin)
2. Mobile QA pass (login, tables, dialogs)
3. Railway staging deploy (needs your Railway account + FE host choice)

Until then, this document is the single source of truth for scope, portable DB strategy, Railway options, what you must provide, and how to verify APIs.
