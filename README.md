# Mortgage Loan Prequalification Dashboard

A full-stack sample application for reviewing mortgage loan applications: entering applicant
and loan data, and surfacing an automated DTI / LTV / underwriting recommendation.

**Status: backend and frontend implemented.** A styling/refinement pass is next — see Roadmap.

## Tech stack

| Layer    | Choices |
|----------|---------|
| Frontend | Vue 3 (Composition API) + Vite + TypeScript, Vue Router, Pinia, Axios, Bootstrap 5 |
| Backend  | Node.js + Express + TypeScript, mysql2 |
| Database | MySQL 8 |
| Infra    | Docker & Docker Compose |

## Project layout

```
.
├── client/                 # Vue 3 SPA
│   └── src/
│       ├── components/
│       │   ├── common/     # Reusable, domain-agnostic UI (DataTable, FormField, Modal, ...)
│       │   └── layout/     # App shell (header, sidebar, page layout)
│       ├── views/          # Route-level pages
│       ├── router/
│       ├── stores/         # Pinia stores
│       ├── services/       # Axios instance + API clients
│       └── types/          # Shared TS types/interfaces
├── server/                 # Express API
│   ├── db/init.sql         # Schema, auto-applied on first MySQL container boot
│   └── src/
│       ├── config/         # Env loading, DB pool
│       ├── controllers/    # HTTP request/response handling
│       ├── services/       # Business logic (DTI, LTV, underwriting rules)
│       ├── routes/
│       ├── middleware/
│       └── types/
└── docker-compose.yml
```

**Why this split:** `client` and `server` are independent npm packages with their own
`package.json`/`tsconfig.json`/`Dockerfile`. Nothing about the API depends on Vite, and
nothing about the SPA depends on Express — they could be deployed, scaled, or replaced
independently, which mirrors how a real mortgage platform would separate a public web
tier from an internal API tier.

**Why controllers/services/routes are separate on the backend:** routes wire URLs to
controllers, controllers only translate HTTP ⇄ domain calls (parsing input, shaping
responses, status codes), and services hold the actual business logic (DTI/LTV math,
underwriting rules) with no knowledge of Express. That makes the underwriting logic unit
testable without spinning up an HTTP server, and reusable if it's ever needed outside a
request (e.g. a batch re-evaluation job).

## Docker configuration

Each app has a multi-stage `Dockerfile`:

- **`dev`** — installs all dependencies and runs the framework's own dev server
  (`ts-node-dev` for the API, Vite for the SPA) with the source tree bind-mounted for hot
  reload. This is the target `docker-compose.yml` builds.
- **`build`** — compiles TypeScript (API) or bundles static assets (SPA).
- **`prod`** — a minimal runtime image: plain `node:20-alpine` running compiled JS for the
  API, or `nginx:alpine` serving the static bundle for the SPA. Not wired into
  `docker-compose.yml` yet since local dev only needs `dev`, but it demonstrates the image
  a real deployment would use.

`docker-compose.yml` bind-mounts `./client` and `./server` into their containers for hot
reload, but gives each container its **own named volume for `node_modules`**
(`server_node_modules`, `client_node_modules`). Without that, the bind mount would
overwrite the container's Linux-built `node_modules` with whatever (possibly
Windows/macOS-built) `node_modules` exists on the host, breaking native deps.

MySQL initializes its schema automatically: `server/db/init.sql` is mounted to
`/docker-entrypoint-initdb.d/`, which the official MySQL image executes on first boot only
(i.e. when the `mysql_data` volume is empty).

**Two Windows/macOS Docker Desktop gotchas worth knowing:**

- Native filesystem change events don't reliably cross a bind mount on Docker Desktop for
  Windows/macOS, so both dev servers are configured to poll for changes instead
  (`ts-node-dev --poll`, Vite's `server.watch.usePolling`). Without this, editing a file on
  the host silently doesn't trigger a reload inside the container.
- The named `node_modules` volumes persist independently of the image. Rebuilding the image
  (`docker compose up --build`) does **not** refresh a container's already-existing volume —
  if you add a dependency to a running stack, run
  `docker compose exec <service> npm install` (or drop the volume with
  `docker compose down -v` to force a clean reinstall).

## Running locally

```bash
cp .env.example .env
docker compose up --build
```

- API: http://localhost:4000/api/health (verifies both the process and the DB connection)
- Client: http://localhost:5173

## API surface

All routes are under `/api`.

| Method | Path | Notes |
|---|---|---|
| GET | `/applicants` | Paginated, `?search=` by name/email |
| GET | `/applicants/:id` | Includes the applicant's loan applications |
| GET | `/loan-applications` | Paginated; `?status=`, `?sortBy=`, `?sortDir=` |
| GET | `/loan-applications/summary` | Portfolio counts by status + average DTI/LTV, for dashboard stat cards |
| GET | `/loan-applications/:id` | Full detail, joined with applicant |
| POST | `/loan-applications` | Creates applicant (find-or-create by email) + loan application in one transaction; computes DTI/LTV/underwriting |
| PATCH | `/loan-applications/:id` | Recomputes DTI/LTV/underwriting from the merged fields |
| DELETE | `/loan-applications/:id` | |

## Frontend architecture notes

- **Reusable components live in `components/common/`**: `DataTable` (generic over row type,
  scoped-slot cell overrides, sortable headers), `Pagination`, `Modal`, `FormField`,
  `StatusBadge`, `StatCard`, `RatioProgress`. Each is used more than once or is generic
  enough that it earns its place as a standalone component rather than inline markup.
- **`Modal` is built on Bootstrap's CSS classes but not its JS.** Bootstrap's modal component
  manages its own DOM state (via Popper + data attributes), which fights Vue's reactivity
  model when you need the modal's open/closed state to originate from application state
  (e.g. a delete confirmation triggered by a store action). Driving visibility with
  `v-if`/`Teleport` and only borrowing Bootstrap's classes for visual styling avoids that
  entirely.
- **Numeric form fields are sent as strings and coerced server-side.** The Zod schemas
  backing the API already use `z.coerce.number()`, so there's no separate client-side
  numeric parsing/validation layer to keep in sync with the server's — one source of truth
  for "what counts as a valid loan amount."
- **The Pinia store (`stores/loanApplications.ts`) doesn't call `axios` directly** — it calls
  functions in `services/loanApplicationsApi.ts`. That mirrors the backend's
  controller/service split: the store owns UI-facing state (loading flags, pagination,
  filters), the API module owns HTTP concerns, and neither depends on the other's internals.

## Roadmap

1. ~~Scaffolding & Docker configuration~~ ✅
2. ~~Backend: applicant/loan-application CRUD, DTI/LTV calculators, underwriting rules engine~~ ✅
3. ~~Frontend: dashboard views, reusable components (DataTable, FormField, Modal, Pagination, Cards), Pinia store~~ ✅
4. Styling & refinement pass
