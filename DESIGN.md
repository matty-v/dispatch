# Dispatch — Design Document

> Task scheduler and reminder dashboard PWA. Your command center for cron jobs, reminders, and scheduled events.

## Overview

Dispatch is a Progressive Web App for managing scheduled tasks, reminders, and recurring jobs. It reads from and writes to a Google Sheets backend (the Cron sheet), providing a visual kanban-style interface for what's running, what's coming up, and what needs attention.

Echo (the AI agent) syncs with this same sheet, so changes made in Dispatch are automatically picked up and executed.

## User Stories

- **As a user**, I can see all my scheduled tasks in a kanban board view (Scheduled → In Progress → Done / Error)
- **As a user**, I can create new reminders, one-shot tasks, and recurring jobs
- **As a user**, I can edit, pause, or delete existing tasks
- **As a user**, I can see when each task last ran and what the result was
- **As a user**, I can see upcoming tasks in a timeline/agenda view
- **As a user**, I can filter tasks by type (recurring, one-shot, reminder)
- **As a user**, I can use the app offline and sync when back online

## Tech Stack

Based on the Notes app architecture:

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS** + **Radix UI** + **CVA** (component variants)
- **TanStack Query** — server state management
- **IndexedDB (Dexie)** — offline-first local storage
- **Google Sheets** via SheetsDbClient — backend database
- **PWA** — service worker, installable, offline support

## Data Model

### Source: Google Sheets (Cron sheet)

| Column | Type | Description |
|--------|------|-------------|
| id | string (UUID) | Unique job identifier |
| name | string | Job name (kebab-case slug) |
| type | enum | `recurring` / `one-shot` / `reminder` |
| status | enum | `Scheduled` / `In Progress` / `Done` / `Error` / `Paused` |
| schedule | string | Human-readable schedule ("Daily 2 AM MT", "Feb 21 2026") |
| description | string | What the job does |
| nextRun | string | Next scheduled execution (human-readable datetime) |
| lastRun | string | Last execution time |
| lastResult | string | Outcome of last run ("✅ Backup complete", "❌ Error...") |
| createdAt | string | Creation date |

### Local Type (TypeScript)

```typescript
interface DispatchTask {
  id: string;
  name: string;
  type: 'recurring' | 'one-shot' | 'reminder';
  status: 'Scheduled' | 'In Progress' | 'Done' | 'Error' | 'Paused';
  schedule: string;
  description: string;
  nextRun: string;
  lastRun: string;
  lastResult: string;
  createdAt: string;
  updatedAt: string;
}
```

### IndexedDB Schema (Dexie)

```typescript
db.version(1).stores({
  tasks: 'id, name, type, status, nextRun, createdAt',
  pendingSync: '++id, taskId, operation, createdAt'
});
```

## Views

### 1. Board View (Default)
Kanban-style columns:
- **Scheduled** — active tasks waiting for their next run
- **In Progress** — currently executing
- **Done** — completed one-shots and reminders
- **Error** — failed tasks needing attention
- **Paused** — disabled tasks

Each card shows: name, type badge, schedule, next run, last result indicator.

### 2. Agenda View
Chronological list of upcoming tasks sorted by `nextRun`:
- Today's tasks highlighted
- This week's tasks grouped by day
- Future tasks in a scrollable list
- Overdue tasks flagged at the top

### 3. Task Detail / Edit
Slide-over or modal for viewing and editing a task:
- All fields editable
- Status dropdown with kanban transitions
- History of recent runs (if we track it)
- Delete / Pause actions

### 4. Create Task
Form for adding a new task:
- Name (required)
- Type selector (recurring / one-shot / reminder)
- Schedule input (smart parsing or structured fields)
- Description
- Status defaults to "Scheduled"

## Component Architecture

```
src/
├── components/
│   ├── ui/              # Shared primitives (Button, Badge, Card, Dialog, etc.)
│   ├── board/           # Kanban board components
│   │   ├── Board.tsx
│   │   ├── Column.tsx
│   │   └── TaskCard.tsx
│   ├── agenda/          # Agenda/timeline view
│   │   ├── Agenda.tsx
│   │   └── AgendaItem.tsx
│   ├── task/            # Task CRUD
│   │   ├── TaskForm.tsx
│   │   ├── TaskDetail.tsx
│   │   └── TaskFilters.tsx
│   └── layout/          # App shell
│       ├── Header.tsx
│       ├── Navigation.tsx
│       └── Layout.tsx
├── hooks/
│   ├── use-tasks.ts     # TanStack Query hook for task CRUD
│   ├── use-sync.ts      # Offline sync logic
│   └── use-filters.ts   # Filter/sort state
├── lib/
│   ├── db.ts            # Dexie schema
│   ├── sync.ts          # Sync queue logic
│   ├── tasks-api.ts     # SheetsDbClient setup
│   ├── types.ts         # TypeScript types
│   └── transformers.ts  # Sheet row ↔ app type conversion
├── services/
│   └── sheetsdb/        # SheetsDbClient (copy from notes app)
├── pages/
│   ├── Home.tsx         # Board view (default)
│   ├── Agenda.tsx       # Agenda view
│   └── Settings.tsx     # Sheets connection setup
└── App.tsx              # Router + providers
```

## Sync Strategy

Same offline-first pattern as the Notes app:

1. **Read**: IndexedDB first → pull from Sheets on load → merge by timestamp
2. **Write**: IndexedDB immediately → queue in pendingSync → push when online
3. **Conflict**: Last-write-wins based on `updatedAt`
4. **Echo integration**: Echo reads the same sheet on heartbeats. Changes in Dispatch appear in Echo's next sync, and vice versa.

## Theme: Cyberpunk (voget.io design system)

Match the Notes app's cyberpunk aesthetic exactly:

### Color Palette
- **Background**: `#0a0e14` (deep space dark), secondary `#121821`
- **Accent Cyan**: `#00d4ff` — primary actions, links, highlights
- **Accent Purple**: `#a78bfa` — secondary accent, hover states
- **Accent Pink**: `#ec4899` — destructive actions, error states
- **Grid overlay**: `rgba(100, 150, 255, 0.08)` subtle background grid
- **Particle color**: `rgba(167, 139, 250, 0.4)` ambient glow effects

### Typography
- **Font**: JetBrains Mono (monospace) — gives the terminal/hacker feel
- Import via Google Fonts

### Visual Effects
- **Animated gradient backdrop**: Radial gradients (cyan, purple, pink) with slow rotation animation
- **Glass morphism**: Cards use `backdrop-blur` with semi-transparent backgrounds
- **Glow effects**: Cyan glow on focused/active elements (`box-shadow` with accent color)
- **Scan line**: Subtle horizontal scan animation on headers (optional)

### CSS Variables (HSL)
Copy the full HSL variable system from Notes app `index.css` — same `--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring` definitions.

### Task Card Styling
- Cards float on dark glass with subtle border glow
- **Type color coding**: Recurring (cyan `#00d4ff`), One-shot (amber/gold), Reminder (green/emerald)
- **Status badges**: Scheduled (cyan outline), In Progress (cyan pulse animation), Done (green glow), Error (pink/red glow), Paused (muted gray)
- Hover: slight scale + glow intensify

### Kanban Columns
- Column headers with accent underline (cyan for active, muted for empty)
- Subtle vertical separator lines between columns
- Column count badge with glow

## GitHub Actions

### 1. Claude Code Review (`claude-code-review.yml`)
Automated code review on PRs using Claude Code Action:
- Triggers on PR opened, synchronize, ready_for_review, reopened
- Read-only tools: Read, Grep, Glob, git log/diff/status, npm test/lint, gh pr
- Excludes bot PRs to prevent loops
- Uses `CLAUDE_CODE_OAUTH_TOKEN` secret

### 2. Claude Code (`claude.yml`)
Interactive Claude Code via @claude mentions:
- Triggers on issue/PR comments containing @claude
- Write permissions: can make commits, comment on PRs/issues
- Tools: Read, Write, Edit, Grep, Glob, npm, vitest, playwright, git, gh
- Excludes bot actors

### 3. Deploy to Firebase (`deploy.yml`)
Auto-deploy on push to main:
- Node 20, npm ci, build, deploy to Firebase Hosting
- Validates package-lock.json sync before build
- Uses `FIREBASE_SERVICE_ACCOUNT` secret
- Firebase target: `matty-dispatch-pwa` (needs Firebase setup)
- Project: `kinetic-object-322814`

### 4. PR Preview (`preview.yml`)
Preview deployments for PRs:
- Deploys to Firebase preview channel on PR open/sync
- Preview expires after 7 days
- Cleans up preview channel on PR close/merge
- Same build pipeline: validate lockfile → npm ci → build → deploy

### Required Secrets
- `CLAUDE_CODE_OAUTH_TOKEN` — for Claude Code Actions
- `FIREBASE_SERVICE_ACCOUNT` — for Firebase deploys
- `GITHUB_TOKEN` — auto-provided

## Deployment

- Firebase Hosting (same as Notes app)
- Firebase target: `matty-dispatch-pwa`
- PWA installable on mobile and desktop

## Future Ideas

- Drag-and-drop between kanban columns to change status
- Push notifications for upcoming reminders
- Recurring task streak/history visualization
- Integration with calendar view
- Quick-add from mobile with natural language ("remind me to X in 2 hours")
