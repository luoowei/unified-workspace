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

- [ ] Replace LWW sync with true Yjs CRDT conflict resolution
- [ ] ProseMirror editor with Yjs binding
- [ ] Y.Map / Y.Array / Y.Text for different content types

### Task 3: Data Layer

- [ ] PGlite (Postgres-in-WASM) for structured data: tasks, calendar events
- [ ] OPFS persistence for browser storage
- [ ] SQL-based automation rules engine

### Task 4: UI Components

- [ ] Rich text note editor (ProseMirror + Yjs)
- [ ] Task management: Kanban board, list view, calendar view
- [ ] Calendar with CalDAV integration
- [ ] Automation rules builder ("when note tagged invoice, create due task")

### Task 5: Sync Server

- [ ] WebSocket relay for ordered, reliable message delivery
- [ ] CalDAV server for calendar interoperability
- [ ] Backup and export (JSON, Markdown, iCal)

### Task 6: Release Assets

- [ ] README + README.zh-CN with quick-start
- [ ] GitHub Actions CI
- [ ] Docker Compose for self-hosted deployment (one command)
- [ ] PWA manifest for mobile offline access
- [ ] LAUNCH.md with channel plan
