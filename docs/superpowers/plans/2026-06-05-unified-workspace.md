# unified-workspace Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Build an open-source local-first workspace combining notes, tasks, calendar, and automation with CRDT sync.

**Architecture:** Web UI (ProseMirror) + Core (Yjs + PGlite) + Sync Server (WebSocket relay).

**Tech Stack:** React/Svelte (UI), Yjs (CRDT), PGlite (Postgres-in-WASM), ProseMirror (editor). AGPL-3.0.

---

### Task 1: Sync Engine (CRDT Foundation)

- [x] Document CRUD with version tracking
- [x] Merge concurrent updates (last-write-wins for demo)
- [x] Export and import state for multi-instance sync
- [x] Cross-instance sync simulation (Alice <-> Bob)
- [x] Document listing by type, statistics

### Task 2: Yjs Integration

- [x] Replace LWW sync with true Yjs CRDT conflict resolution
- [x] ProseMirror editor with Yjs binding
- [x] Y.Map / Y.Array / Y.Text for different content types

### Task 3: Data Layer

- [x] PGlite (Postgres-in-WASM) for structured data: tasks, calendar events
- [x] OPFS persistence for browser storage
- [x] SQL-based automation rules engine

### Task 4: UI Components

- [x] Rich text note editor (ProseMirror + Yjs)
- [x] Task management: Kanban board, list view, calendar view
- [x] Calendar with CalDAV integration
- [x] Automation rules builder ("when note tagged invoice, create due task")

### Task 5: Sync Server

- [x] WebSocket relay for ordered, reliable message delivery
- [x] CalDAV server for calendar interoperability
- [x] Backup and export (JSON, Markdown, iCal)

### Task 6: Release Assets

- [x] README + README.zh-CN with quick-start
- [x] GitHub Actions CI
- [x] Docker Compose for self-hosted deployment (one command)
- [x] PWA manifest for mobile offline access
- [x] LAUNCH.md with channel plan
