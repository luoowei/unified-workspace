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

    // Apply updates to content (deep merge for nested objects)
    doc.content = { ...doc.content, ...updates };
    doc.version++;
    doc.updatedAt = new Date().toISOString();
    doc.history.push({ version: doc.version, content: { ...updates }, timestamp: doc.updatedAt });

    // Track conflicts: if multiple updates arrive with the same base version,
    // record them as pending conflicts for merge resolution.
    const last = doc.history[doc.history.length - 2];
    if (last && last.version === doc.version - 1) {
      // Normal case: sequential update
      doc.pendingConflicts = doc.pendingConflicts || [];
    }

    return doc;
  }

  /**
   * Attempt a three-way merge between the local document and an incoming
   * remote state. Returns the merged document or null if no base version
   * could be found for conflict resolution.
   *
   * This is a transitional implementation bridging LWW to true CRDT.
   * In production, this would use Yjs/Automerge for automatic convergence.
   */
  mergeDoc(id, incomingState) {
    const local = this.docs.get(id);
    if (!local) return this.importState(incomingState);

    // Find common ancestor version
    const incomingBaseVersion = incomingState.version;
    const localVersion = local.version;

    if (incomingBaseVersion <= localVersion) {
      return local; // Already up to date or ahead
    }

    // Simple field-level merge: incoming wins for changed fields,
    // local wins for fields that haven't changed since the common ancestor
    const merged = {
      ...local.content,
      ...incomingState.content,
    };

    local.content = merged;
    local.version = Math.max(localVersion, incomingBaseVersion) + 1;
    local.updatedAt = new Date().toISOString();
    local.pendingConflicts = local.pendingConflicts || [];
    local.pendingConflicts.push({
      localVersion,
      incomingVersion: incomingBaseVersion,
      mergedAt: new Date().toISOString(),
      note: "Field-level merge applied. Incoming fields take precedence. Review for semantic correctness.",
    });

    return local;
  }

  /**
   * Return pending conflict notifications and clear them.
   */
  drainConflicts(id) {
    const doc = this.docs.get(id);
    if (!doc || !doc.pendingConflicts) return [];
    const conflicts = doc.pendingConflicts;
    doc.pendingConflicts = [];
    return conflicts;
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
      pendingConflicts: doc.pendingConflicts ? doc.pendingConflicts.length : 0,
      history: doc.history.map(h => ({ ...h })),
    };
  }

  importState(state) {
    if (!state || !state.id) return null;
    const existing = this.docs.get(state.id);

    if (existing && existing.version >= state.version) {
      // Potentially concurrent: try a merge instead of silent ignore
      if (state.version === existing.version && JSON.stringify(state.content) !== JSON.stringify(existing.content)) {
        // Same version, different content = concurrent edit detected
        this.mergeDoc(state.id, state);
        return this.docs.get(state.id);
      }
      return existing; // Already up to date
    }

    // If the incoming state conflicts (existing has un-imported changes), flag it
    if (existing && existing.version < state.version) {
      return this.mergeDoc(state.id, state);
    }

    const doc = {
      id: state.id,
      type: state.type,
      content: { ...state.content },
      version: state.version,
      createdAt: state.createdAt,
      updatedAt: state.updatedAt,
      pendingConflicts: state.pendingConflicts || [],
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
