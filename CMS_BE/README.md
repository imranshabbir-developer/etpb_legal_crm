# ETPB CMS Backend

Node.js + Express + Sequelize + PostgreSQL API for the IPS / ETPB Legal CRM.

## Stack

- Express 5
- Sequelize ORM + PostgreSQL
- JWT auth (`jsonwebtoken` + `bcryptjs`)
- Zod validation
- Helmet, CORS, rate limiting

## Setup

```bash
cd CMS_BE
cp .env.example .env
npm install
npm run verify:env
npm run db:setup
npm run dev
```

API default: `http://127.0.0.1:4000/api`

Use `DATABASE_URL` instead of discrete `POSTGRES_*` vars on Railway. Production skips `sequelize.sync({ alter: true })` and uses `src/database/migrations/`.

Dev reset (blocked in production):

```bash
npm run db:reset
```

Existing demo cases are preserved on `db:seed`. Set `SEED_OVERWRITE_CASES=true` to refresh sample hearing dates.

`npm run db:export-demo` writes the current official courts/cases into `src/database/data/demo-snapshot.json` so a fresh clone matches this database.

## Demo users (after seed)

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | `superadmin@ips.gov.pk` | `SuperAdmin@123` |
| Admin | `admin@ips.gov.pk` | `Admin@123` |
| Legal Admin | `legal.admin@ips.gov.pk` | `Admin@123` |
| Staff | `staff@ips.gov.pk` | `Staff@123` |
| Records Officer | `records@ips.gov.pk` | `Staff@123` |
| Hearing Clerk | `hearings@ips.gov.pk` | `Staff@123` |
| Litigation Assistant | `litigation@ips.gov.pk` | `Staff@123` (Inactive) |

## API surface

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/health` | Health |
| GET | `/api/roles` | Login role list |
| POST | `/api/auth/login` | JWT |
| GET | `/api/auth/me` | Current user |
| GET/POST | `/api/users` | Directory |
| PATCH | `/api/users/:id` | Edit |
| PATCH | `/api/users/:id/status` | Active / Inactive |
| GET/POST | `/api/courts` | Courts |
| GET/PATCH | `/api/courts/:id` | Get / edit / deactivate |
| GET/POST | `/api/cases` | List supports `layer`, `courtId`, `category`, `q`, `page`, `limit` |
| GET/PATCH/DELETE | `/api/cases/:id` | Single case |
| DELETE | `/api/cases` | Bulk ids or `courtId`+`category` |
| GET | `/api/dashboard/summary` | Totals, monthly window, upcoming hearings |
| GET | `/api/reminders` | Live hearing reminders from case dates |
| GET | `/api/notifications` | Persistent per-user case inbox |
| PATCH | `/api/notifications/:id/read` | Mark one read |
| POST | `/api/notifications/read-all` | Mark all read |
| GET/PATCH | `/api/settings/profile` | Profile |
| POST | `/api/settings/password` | Change password |
| GET/PATCH | `/api/settings/modules` | Super Admin only to PATCH |

## Smoke tests (API must be running)

```bash
npm run test:smoke
```

Individual scripts: `test:auth`, `test:users`, `test:courts`, `test:cases`, `test:reminders`, `test:notifications`, `test:settings`.
