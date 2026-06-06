# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bolg is a portfolio/blog CMS with three components:
- **bolg-api** — Go REST API server (Gin framework, GORM, MySQL)
- **admin** — Next.js 16 admin dashboard (React 19, Tailwind CSS 4, shadcn/ui)
- **index.html** — Static frontend portfolio page served by the API

## Development Commands

### API Server (bolg-api/)
```bash
cd bolg-api
go run cmd/server/main.go          # Run in dev mode
go build -o bolg-api.exe cmd/server/main.go  # Build binary
go test ./...                       # Run tests
go mod tidy                         # Clean dependencies
```

### Admin Dashboard (admin/)
```bash
cd admin
npm run dev          # Start dev server on port 3000
npm run build        # Production build
npm run lint         # Run ESLint
```

### Starting All Services
```bash
# Terminal 1: API server
cd bolg-api && ./bolg-api.exe

# Terminal 2: Admin dashboard  
cd admin && npm run dev

# Terminal 3: Static frontend (optional)
cd F:/Bolg && python -m http.server 8081
```

## Architecture

### API (Go)
- **Entry**: `cmd/server/main.go` — loads config, connects DB, runs migrations, starts server
- **Config**: `config/config.yaml` — MySQL, JWT secrets, storage settings
- **Router**: `internal/router/router.go` — all route definitions, grouped by auth/permissions
- **Handlers**: `internal/handler/*.go` — HTTP request handlers
- **Services**: `internal/service/*.go` — business logic
- **Models**: `internal/model/*.go` — GORM models with translations pattern
- **Middleware**: `internal/middleware/` — CORS, JWT auth, RBAC permissions, audit logging

API runs on port 8080, serves `/uploads` static files, and proxies `/` to index.html.

### Admin (Next.js)
- **App Router**: `src/app/(admin)/` — protected admin pages with sidebar layout
- **Site Pages**: `src/app/site/` — public-facing preview pages
- **API Client**: `src/lib/api/client.ts` — fetch wrapper with JWT auto-refresh
- **API Modules**: `src/lib/api/*.ts` — typed API functions per resource
- **Components**: `src/components/` — shadcn/ui components + custom forms
- **i18n**: `src/lib/i18n.ts` — English/Chinese translation system
- **Validations**: `src/lib/validations.ts` — Zod schemas for forms

### Key Patterns
- **Bilingual content**: All translatable content uses `translations` pattern with `en`/`zh` fields
- **Image uploads**: Use `mediaAPI.upload()` — images stored in `bolg-api/uploads/`, served via `http://localhost:8080/uploads/...`
- **Image URLs**: Use `getFullImageUrl()` from `lib/utils/image.ts` to convert relative paths to full URLs
- **Auth**: JWT access tokens stored in localStorage, auto-refreshed on 401
- **RBAC**: Permission-based access control (works.read, works.write, etc.)

### Database
- MySQL 5.7 on localhost:3306, database name: `bolg`
- Charset: utf8mb4 (required for Chinese characters)
- Auto-migration via GORM on server start
- User: root, password in config.yaml

## Important Notes

- The admin dashboard uses Base UI primitives (@base-ui/react), not Radix UI
- When creating Link buttons, wrap `<Button>` with `<Link>` instead of using `nativeButton={false} render={<Link />}`
- Chinese character support requires MySQL charset=utf8mb4 and collation=utf8mb4_unicode_ci
- The static index.html is a single-file portfolio page, not part of the Next.js app
