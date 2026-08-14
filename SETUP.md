# ETPB Legal CRM — Portable laptop setup

Clone this repo, install Postgres + Node, copy env files, run `db:setup`. No database dump is required; schema and demo data come from migrations + seeds.

## Prerequisites

- Node.js 20+ and npm
- PostgreSQL 14+ (local or Railway)
- Git

## 1. Backend (`CMS_BE`)

```sh
cd CMS_BE
cp .env.example .env
# Edit .env: Postgres credentials (or DATABASE_URL), JWT_SECRET, CORS_ORIGIN
npm i
npm run verify:env
npm run db:setup
npm run dev
```

API defaults to `http://127.0.0.1:4000` with prefix `/api`.

Useful commands:

| Command | Purpose |
| --- | --- |
| `npm run db:migrate` | Apply Sequelize migrations only |
| `npm run db:seed` | Idempotent roles/users/courts/cases/notifications |
| `npm run db:reset` | Wipe + reseed (**blocked in production**) |
| `npm run test:smoke` | Auth → users → courts → cases → reminders → notifications → settings |

Demo logins after seed:

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | `superadmin@ips.gov.pk` | `SuperAdmin@123` |
| Admin | `admin@ips.gov.pk` | `Admin@123` |
| Staff | `staff@ips.gov.pk` | `Staff@123` |

Existing demo cases are preserved on reseed unless `SEED_OVERWRITE_CASES=true`.

## 2. Frontend (`CMS_FE`)

```sh
cd CMS_FE
cp .env.example .env
# VITE_API_URL=http://127.0.0.1:4000/api
npm i
npm run dev
```

App defaults to `http://localhost:3000` (or the Vite port shown in the terminal).

Production builds:

```sh
npm run build              # Cloudflare Nitro preset
npm run build:railway      # Node server preset (Dockerfile / railway.json)
```

## 3. Reminders vs notifications

- **Reminders** (`GET /api/reminders`, `/reminders`) — derived live from case `nextDateOfHearing` (no read state).
- **Notifications** (`GET /api/notifications`, `/notifications`) — per-user Postgres inbox synced from reminders, with `readAt`, mark-one / mark-all.

## 4. Deploy packaging

| App | Files |
| --- | --- |
| Backend | `CMS_BE/Dockerfile`, `CMS_BE/railway.json` |
| Frontend | `CMS_FE/Dockerfile`, `CMS_FE/railway.json` (`build:railway`) |

Point FE `VITE_API_URL` / runtime API origin at the deployed BE. Lock BE `CORS_ORIGIN` to the FE origin. Use a strong `JWT_SECRET` (≥24 chars in production).

## 5. Verify

```sh
cd CMS_BE
npm run test:smoke   # phase scripts
npm run test:e2e     # every API + dashboard consistency + FE route probe
npm run cleanup:smoke  # remove leftover e2e/smoke users & deactivate test courts
```

## 6. More detail

- Plan & phase status: `docs/PROJECT_PLAN.md`
- UAT checklist: `docs/UAT_CHECKLIST.md`
- FE notes: `CMS_FE/README.md`
- BE notes: `CMS_BE/README.md` (if present)
