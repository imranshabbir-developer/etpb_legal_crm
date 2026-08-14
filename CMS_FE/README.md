# IPS / ETPB Legal CRM — Frontend (`CMS_FE`)

TanStack Start (React) client for the Evacuee Trust Property Board Legal CRM Management System ([ips.gov.pk](https://ips.gov.pk/)).

## Stack

- React + TanStack Router / Start
- Tailwind CSS + shared UI components
- Talks to `CMS_BE` REST API (JWT auth, Postgres-backed courts/cases/users/settings/reminders/notifications)

## Prerequisites

- Node.js 20+ and npm
- Backend running (see `CMS_BE/README.md` or `docs/PROJECT_PLAN.md`)
- Copy/set `VITE_API_URL` to your API origin, e.g. `http://127.0.0.1:4000/api`

## Setup

```sh
cd CMS_FE
npm i
npm run dev
```

Production build:

```sh
npm run build
npm run preview
```

Railway Node build:

```sh
npm run build:railway
node .output/server/index.mjs
```

`railway.json` and `Dockerfile` package the frontend with Nitro's `node-server` preset. The regular `npm run build` keeps the Cloudflare preset.

## Demo accounts (after `CMS_BE` seed)

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | `superadmin@ips.gov.pk` | `SuperAdmin@123` |
| Admin | `admin@ips.gov.pk` | `Admin@123` |
| Staff | `staff@ips.gov.pk` | `Staff@123` |

## Main routes

- `/` — login
- `/dashboard` — live case totals, charts, court blocks, reminders snapshot
- `/internal`, `/external` — court overviews (DB-driven)
- `/internal/$courtId/$category`, `/external/$courtId/$category` — case registers
- `/reminders` — hearing reminders from case next dates
- `/notifications` — persistent per-user inbox with read state and case deep-links
- `/users` — Admin+ user directory
- `/settings` — module flags / preferences

## Notes

- Courts and cases are **database-only** (no mock court fallbacks).
- Topbar search filters loaded cases and opens the matching court register.
- Official PDF/CSV/DOCX exports use the Government of the Punjab / ETPB letterhead layout under Reports.
