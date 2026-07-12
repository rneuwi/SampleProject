# Mortgage Loan Prequalification Dashboard

A full-stack sample application for reviewing mortgage loan applications: entering applicant
and loan data, and surfacing an automated DTI / LTV / underwriting recommendation.

**Status: scaffolding phase.** Project structure, tooling, and Docker configuration are in
place. Backend business logic, frontend UI, and styling land in subsequent phases.

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

## Running locally

```bash
cp .env.example .env
docker compose up --build
```

- API: http://localhost:4000/api/health (verifies both the process and the DB connection)
- Client: http://localhost:5173

## Roadmap

1. ~~Scaffolding & Docker configuration~~ ✅
2. Backend: applicant/loan-application CRUD, DTI/LTV calculators, underwriting rules engine
3. Frontend: dashboard views, reusable components (DataTable, FormField, Modal, Pagination, Cards), Pinia stores
4. Styling & refinement pass
