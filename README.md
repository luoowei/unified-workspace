# unified-workspace

Open-source local-first workspace combining rich notes, task management, calendar, and personal automation with CRDT sync.

```bash
npx --yes git+https://github.com/luoowei/unified-workspace.git
```

## Why

Zero mature tools combine all four capabilities with conflict-free sync. IronPad v0.3.0 is closest but pre-1.0 and solo-dev. CRDT technology (Yjs/Automerge) is production-ready. Self-hosting at all-time high.

## What it does

- Rich text notes (ProseMirror + Yjs CRDT)
- Task management (Kanban + list + calendar views)
- Calendar with CalDAV integration
- Personal automation rules engine ("when note tagged invoice, create due task")
- Offline-first with background sync
- PWA for mobile, Docker for self-hosting

## License

AGPL-3.0
