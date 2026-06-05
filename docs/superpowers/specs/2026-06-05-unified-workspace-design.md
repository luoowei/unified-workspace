# unified-workspace Design Specification

## Overview

`unified-workspace` is an open-source, local-first, self-hosted workspace combining rich note-taking, task management, calendar, and personal automation in a single CRDT-synced application.

## Motivation

Zero mature tools combine all four capabilities with conflict-free sync. AFFiNE (Notion alternative), Super Productivity (tasks), Vikunja (projects) each do 1-2 things. IronPad v0.3.0 comes closest but is pre-1.0 and solo-dev. CRDT technology (Yjs/Automerge) is production-ready. Self-hosting at all-time high ($19.99/mo VPS runs 5-10 apps).

## Architecture

```
┌─────────────────────────────────────────┐
│  Web UI (React / Svelte)                 │
│  ├─ Rich text editor (ProseMirror)       │
│  ├─ Task board (Kanban + list + calendar)│
│  ├─ Calendar view (CalDAV integration)   │
│  └─ Automation rules engine              │
├─────────────────────────────────────────┤
│  Core (WASM via Yjs + SQLite OPFS)       │
│  ├─ CRDT document model (Yjs)            │
│  ├─ Local SQLite (OPFS persistence)      │
│  └─ Offline-first sync engine             │
├─────────────────────────────────────────┤
│  Sync server (optional, self-hosted)     │
│  ├─ WebSocket relay (ordered delivery)   │
│  ├─ CalDAV server                        │
│  └─ Backup + export                      │
└─────────────────────────────────────────┘
```

### Key technical decisions

- **Yjs** for text editing (smallest update payloads, broad editor bindings)
- **PGlite** (Postgres-in-WASM) for structured data (tasks, calendar events, automation rules)
- **ProseMirror** for rich text (most mature Yjs binding)
- **OPFS** for browser persistence (high performance, persistent)

### Sync architecture

Device A/B/C → local Yjs doc + local PGlite → WebSocket relay (ordered, reliable) → CRDT merge. Offline edits synchronize on reconnect. Conflict-free by construction.

## Distribution

Single Docker Compose file. PWA for mobile (no native app initially). Browser-first desktop access. Optional sync server for multi-device.

## License

AGPL-3.0 (core), optional hosted sync service
