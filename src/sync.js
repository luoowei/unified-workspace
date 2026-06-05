/**
 * Document Sync Engine — simplified CRDT-inspired local-first sync.
 *
 * In production, this would use Yjs or Automerge for true CRDT conflict resolution.
 * This engine uses version-vector-based last-write-wins as a demonstrative implementation.
 */
export class SyncEngine {
  constructor() {
    this.docs = new Map();     // docId -> { id, type, content, version, history }
  }

  createDoc(type, content = {}) {
    const id = crypto.randomUUID();
    const doc = {
      id,
      type,
      content: { ...content },
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [{ version: 1, content: { ...content }, timestamp: new Date().toISOString() }],
    };
    this.docs.set(id, doc);
    return doc;
  }

  getDoc(id) {
    return this.docs.get(id) || null;
  }

  updateDoc(id, updates) {
    const doc = this.docs.get(id);
    if (!doc) throw new Error(`Document not found: ${id}`);
    doc.content = { ...doc.content, ...updates };
    doc.version++;
    doc.updatedAt = new Date().toISOString();
    doc.history.push({ version: doc.version, content: { ...updates }, timestamp: doc.updatedAt });
    return doc;
  }

  getVersion(id) {
    const doc = this.docs.get(id);
    return doc ? doc.version : 0;
  }

  exportState(id) {
    const doc = this.docs.get(id);
    if (!doc) return null;
    return {
      id: doc.id,
      type: doc.type,
      content: { ...doc.content },
      version: doc.version,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      history: doc.history.map(h => ({ ...h })),
    };
  }

  importState(state) {
    if (!state || !state.id) return null;
    const existing = this.docs.get(state.id);
    if (existing && existing.version >= state.version) {
      return existing; // Already up to date
    }
    const doc = {
      id: state.id,
      type: state.type,
      content: { ...state.content },
      version: state.version,
      createdAt: state.createdAt,
      updatedAt: state.updatedAt,
      history: state.history?.map(h => ({ ...h })) || [],
    };
    this.docs.set(state.id, doc);
    return doc;
  }

  listDocs(filter = {}) {
    let results = [...this.docs.values()];
    if (filter.type) results = results.filter(d => d.type === filter.type);
    results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    return results.map(d => ({ id: d.id, type: d.type, version: d.version, updatedAt: d.updatedAt, preview: JSON.stringify(d.content).slice(0, 60) }));
  }

  stats() {
    const types = new Map();
    for (const doc of this.docs.values()) {
      types.set(doc.type, (types.get(doc.type) || 0) + 1);
    }
    return { totalDocs: this.docs.size, byType: Object.fromEntries(types) };
  }
}
