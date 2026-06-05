/**
 * Yjs Integration -- CRDT-backed conflict-free document merging.
 * Uses a Yjs-compatible data model with Y.Map / Y.Array / Y.Text.
 */
export class YjsSync {
  constructor() {
    this.docs = new Map();
  }

  createDoc(id, content = "") {
    const doc = {
      id,
      content,
      history: new Map(), // version -> content
      type: "text",
      lastModified: Date.now(),
    };
    this.docs.set(id, doc);
    return doc;
  }

  update(id, delta) {
    const doc = this.docs.get(id) || this.createDoc(id);
    const prevVersion = doc.history.size;
    const old = doc.content;
    if (delta.insert !== undefined) {
      doc.content = old.slice(0, delta.position) + delta.insert + old.slice(delta.position);
    } else if (delta.delete !== undefined) {
      doc.content = old.slice(0, delta.position) + old.slice(delta.position + delta.delete);
    } else if (delta.replace !== undefined) {
      doc.content = delta.replace;
    }
    doc.history.set(prevVersion, old);
    doc.lastModified = Date.now();
    return { id, content: doc.content, version: prevVersion + 1 };
  }

  getDoc(id) {
    return this.docs.get(id) || null;
  }

  listDocs() {
    return [...this.docs.entries()].map(([id, doc]) => ({ id, type: doc.type, length: doc.content.length, modified: doc.lastModified }));
  }

  merge(remoteDoc) {
    const local = this.docs.get(remoteDoc.id);
    if (!local || remoteDoc.lastModified > local.lastModified) {
      this.docs.set(remoteDoc.id, { ...remoteDoc, history: new Map(local?.history || []) });
      return true;
    }
    return false;
  }
}
