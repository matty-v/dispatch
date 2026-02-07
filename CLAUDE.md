# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dispatch is a PWA for managing scheduled tasks, reminders, and recurring jobs. It provides a kanban board and agenda view backed by Google Sheets (via SheetsDB API) with offline-first IndexedDB storage. An AI agent called Echo reads the same sheet, so changes in Dispatch are automatically picked up for execution.

## Commands

```bash
npm run dev          # Vite dev server (localhost:5173)
npm run build        # TypeScript check + Vite production build
npm run lint         # ESLint (flat config)
npm run typecheck    # TypeScript only (no emit)
npm run test         # vitest run (not yet set up — needs vitest in devDeps)
npm run test:watch   # vitest watch mode
npm run test:e2e     # playwright test (not yet set up — needs playwright in devDeps)
npm run deploy       # Build + firebase deploy (target: matty-dispatch-pwa)
```

## Architecture

### Data Flow (Offline-First)

```
User Action → TanStack Query Mutation → IndexedDB (Dexie) write → Queue to pendingSync table
    → Invalidate query cache → Re-render
    → [Async] processSyncQueue() pushes to Google Sheets
    → [Async] pullFromRemote() fetches from Sheets, merges by updatedAt (last-write-wins)
```

### Key Layers

- **Pages** (`src/pages/`): Route handlers — Home (board), AgendaPage, Settings
- **Feature Components** (`src/components/board/`, `agenda/`, `task/`): Business logic using hooks
- **UI Primitives** (`src/components/ui/`): Radix UI wrappers with CVA variants
- **Layout** (`src/components/layout/`): App shell with cyberpunk animated background
- **Hooks** (`src/hooks/`): `useTasks` (TanStack Query CRUD), `useSync` (push/pull orchestration), `useFilters` (client-side filter/sort)
- **Lib** (`src/lib/`): `db.ts` (Dexie schema), `sync.ts` (queue + merge), `transformers.ts` (sheet row ↔ app type), `tasks-api.ts` (SheetsDB config), `types.ts`
- **Services** (`src/services/sheetsdb/`): `SheetsDbClient` — HTTP client for Google Sheets API with fluent `.sheet()` builder

### Routing (React Router)

- `/` → Board view (kanban columns by status)
- `/agenda` → Agenda view (chronological by nextRun)
- `/settings` → Sheets connection config (base URL + spreadsheet ID stored in localStorage)

### Data Model

`DispatchTask`: id, name, type (`recurring`|`one-shot`|`reminder`), status (`Scheduled`|`In Progress`|`Done`|`Error`|`Paused`), schedule, description, nextRun, lastRun, lastResult, createdAt, updatedAt.

`PendingSync`: auto-increment id, taskId, operation (`create`|`update`|`delete`), data, createdAt.

IndexedDB is the source of truth for reads. Sheets is the sync target.

### Sync Details

- Writes go to IndexedDB immediately, then queued in `pendingSync` table
- `processSyncQueue()` pushes pending ops to Sheets, returns `{ synced, errors }`
- `pullFromRemote()` fetches all rows, merges by `updatedAt` timestamp (last-write-wins)
- Sheets config keys in localStorage: `dispatch_sheets_base_url`, `dispatch_sheets_spreadsheet_id`

## Tech Stack

React 19, TypeScript (strict), Vite 7, Tailwind CSS 3, Radix UI, CVA, TanStack Query, Dexie (IndexedDB), vite-plugin-pwa. Path alias: `@/*` → `src/*`.

## Theme: Cyberpunk (voget.io design system)

- Font: JetBrains Mono (Google Fonts)
- Background: `#0a0e14`, accent cyan `#00d4ff`, accent purple `#a78bfa`, accent pink `#ec4899`
- Visual effects: animated gradient backdrop, grid overlay, scanline, glass morphism cards (`backdrop-blur`)
- Task type colors: recurring=cyan, one-shot=amber, reminder=emerald
- CSS classes: `.tech-card`, `.glow-cyan`, `.glow-purple`, `.tech-badge`, `.tech-input`, `.tech-button-primary`/`.secondary`/`.ghost`

## Conventions

- Component files are PascalCase, hooks are `use-*.ts` (kebab-case)
- ESLint allows unused vars prefixed with `_`
- Dialogs use controlled pattern: `open` prop + `onOpenChange` callback
- TypeScript strict mode with `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- ISO 8601 strings for all timestamps (no date library)

## Deployment

Firebase Hosting, project `kinetic-object-322814`, target `matty-dispatch-pwa`. GitHub Actions workflows are designed but temporarily removed (see DESIGN.md for specs). Required secrets: `FIREBASE_SERVICE_ACCOUNT`, `CLAUDE_CODE_OAUTH_TOKEN`.
