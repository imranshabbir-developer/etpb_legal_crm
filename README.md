# ETPB Legal CRM

**Evacuee Trust Property Board (ETPB) / IPS Legal Case Management CRM** — a modern web application for tracking legal cases across **internal** and **external** courts, with role-based access, dashboards, notifications, and user management.

> Application UI lives in `CMS_FE/` (TanStack Start + React). `CMS_BE/` is reserved for the backend API.

---

## What this system does

| Module | Description |
| --- | --- |
| **Login** | Role-based demo sign-in (Super Admin, Admin, Staff) with theme support |
| **Dashboard** | Overview stats, charts, and recent activity for legal operations |
| **Internal Courts** | Case registers under departmental forums (Federal Secretary, Chairman, Administrator, etc.) |
| **External Courts** | Case registers under judicial forums (Supreme Court, High Court, District Court, etc.) |
| **Case Register** | Full CRUD-style case records: case no., property/land details, counsel, hearings, orders, fees, status |
| **Users & Roles** | Manage staff/admin users (permission-gated) |
| **Notifications** | Hearing and case alerts by category |
| **Settings** | CRM preferences and module configuration (role-gated) |
| **Assistant** | In-dashboard assistant UI for guided help |

### Case categories

- **Decided Cases**
- **Pending Cases**
- **Restraining Order**
- **Direction Cases**

### Court layers

**Internal courts**

- Federal Secretary  
- Joint Secretary  
- Chairman  
- Administrator  
- Assistant / Deputy Administrator  

**External courts**

- Federal Constitutional Court of Pakistan  
- Supreme Court of Pakistan  
- High Court  
- District & Session Court  
- Civil Court  
- Federal Service Tribunal  
- Other Courts  

Each court exposes the categories configured for that forum (internal courts typically have all four; most external courts focus on Restraining Order & Direction Cases).

---

## Roles & permissions

| Role | Capabilities |
| --- | --- |
| **Super Admin** | Full access: cases (view/create/edit/delete), users (view + manage staff & admin), settings, module configuration. Cannot manage other Super Admins. |
| **Admin** | Same operational access as Super Admin for cases, users (staff & admin), settings, and modules. |
| **Staff** | View and edit cases; view settings. Cannot create/delete cases or manage users. |

### Permission matrix

| Permission | Staff | Admin | Super Admin |
| --- | --- | --- | --- |
| `cases:view` | ✅ | ✅ | ✅ |
| `cases:create` | ❌ | ✅ | ✅ |
| `cases:edit` | ✅ | ✅ | ✅ |
| `cases:delete` | ❌ | ✅ | ✅ |
| `users:view` | ❌ | ✅ | ✅ |
| `users:manage-staff` | ❌ | ✅ | ✅ |
| `users:manage-admin` | ❌ | ✅ | ✅ |
| `settings:view` | ✅ | ✅ | ✅ |
| `settings:manage` | ❌ | ✅ | ✅ |
| `modules:configure` | ❌ | ✅ | ✅ |

### Demo accounts (local development)

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | `superadmin@ips.gov.pk` | `SuperAdmin@123` |
| Admin | `admin@ips.gov.pk` | `Admin@123` |
| Staff | `staff@ips.gov.pk` | `Staff@123` |

Auth is currently **client-side / demo session** (localStorage). Suitable for UI and workflow demos; wire a real backend auth when moving to production.

---

## Repository structure

```text
ETPB/
├── README.md                 ← you are here
├── .gitignore
├── CMS_FE/                   ← Legal CRM frontend (TanStack Start)
│   ├── src/
│   │   ├── routes/           ← pages (login, dashboard, courts, users, …)
│   │   ├── components/       ← UI, cases, sidebar, assistant
│   │   └── lib/cases/        ← domain types, permissions, courts, store
│   ├── public/               ← static assets
│   └── package.json
└── CMS_BE/                   ← placeholder for backend API
```

---

## How to run

### Prerequisites

- **Node.js** 20+ (recommended)  
- **npm** (or **bun** — `bun.lock` is included)

### Install & start (development)

```bash
git clone https://github.com/imranshabbir-developer/etpb_legal_crm.git
cd etpb_legal_crm
git checkout imran-dev

cd CMS_FE
npm install
npm run dev
```

Open **http://localhost:3000** (Vite default host/port as configured).

### Other scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start local development server |
| `npm run build` | Production build (Cloudflare module via Nitro) |
| `npm run build:dev` | Development-mode build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier format |

---

## Tech stack & libraries

### Core

| Library | Role |
| --- | --- |
| [React 19](https://react.dev/) | UI |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Vite 8](https://vitejs.dev/) | Dev server & bundling |
| [TanStack Start](https://tanstack.com/start) | Full-stack React framework |
| [TanStack Router](https://tanstack.com/router) | File-based routing |
| [TanStack Query](https://tanstack.com/query) | Async/server state |
| [Tailwind CSS 4](https://tailwindcss.com/) | Styling |
| [Nitro](https://nitro.build/) | Production server / Cloudflare deploy preset |

### UI & UX

| Library | Role |
| --- | --- |
| Radix UI primitives | Accessible dialogs, menus, tabs, etc. |
| [shadcn/ui-style](https://ui.shadcn.com/) components | App component kit under `src/components/ui` |
| [Lucide React](https://lucide.dev/) | Icons |
| [Recharts](https://recharts.org/) | Dashboard charts |
| [Sonner](https://sonner.emilkowal.ski/) | Toasts |
| [Lottie](https://airbnb.io/lottie/) (`lottie-web`) | Login / motion assets |
| [Three.js](https://threejs.org/) + React Three Fiber / Drei | 3D assistant visuals |
| `vaul`, `cmdk`, `embla-carousel-react` | Drawer, command palette, carousel |

### Forms & validation

| Library | Role |
| --- | --- |
| React Hook Form | Forms |
| Zod | Schema validation |
| `@hookform/resolvers` | RHF ↔ Zod bridge |
| `date-fns` / `react-day-picker` | Dates & calendar |

### Tooling

| Library | Role |
| --- | --- |
| ESLint + typescript-eslint | Linting |
| Prettier | Formatting |
| Lightning CSS | CSS transforms |

---

## Daily development workflow

Work on the **`imran-dev`** branch, then open a pull request into **`main`**:

```bash
git checkout imran-dev
# …make changes…
git add .
git commit -m "Describe your change"
git push origin imran-dev
# Open PR: imran-dev → main on GitHub
```

---

## Notes

- Case data is currently driven by an **in-app store / mock data** for CRM UI flows.
- `CMS_BE/` is empty by design until the backend API package is added.
- Do not commit `.env`, `.dev.vars`, `node_modules`, or build caches (see root `.gitignore`).

---

## License

Private / internal project unless otherwise stated by the repository owner.
