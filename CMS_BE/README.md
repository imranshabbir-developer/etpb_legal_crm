# ETPB CMS Backend

Node.js + Express + Sequelize + PostgreSQL API for the Legal CRM.

## Stack

- Express 5
- Sequelize ORM
- PostgreSQL
- JWT auth (`jsonwebtoken` + `bcryptjs`)
- Zod validation
- Helmet, CORS, rate limiting

## Folder structure

```text
CMS_BE/
├── .env / .env.example
├── package.json
├── scripts/
│   └── test-auth.js
└── src/
    ├── app.js
    ├── server.js
    ├── config/
    ├── database/          # migrate + seed
    ├── middleware/
    ├── models/
    ├── modules/
    │   ├── auth/
    │   └── roles/
    ├── routes/
    └── utils/
```

## Setup

```bash
cd CMS_BE
npm install
npm run db:setup
npm run dev
```

API default: `http://127.0.0.1:4000/api`

## Auth endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET | `/api/roles` | Active roles (for login UI) |
| POST | `/api/auth/login` | Email + password (+ optional role) |
| GET | `/api/auth/me` | Current user (Bearer JWT) |

### Seeded demo users

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | `superadmin@ips.gov.pk` | `SuperAdmin@123` |
| Admin | `admin@ips.gov.pk` | `Admin@123` |
| Staff | `staff@ips.gov.pk` | `Staff@123` |

## Test

```bash
# with server running
npm run test:auth
```
