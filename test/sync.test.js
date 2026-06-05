import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SyncEngine } from "../src/sync.js";

describe("SyncEngine", () => {
  it("creates documents with initial content", () => {
    const engine = new SyncEngine();
    const doc = engine.createDoc("note", { title: "Hello", body: "World" });
    assert.equal(doc.type, "note");
    assert.equal(doc.content.title, "Hello");
    assert.ok(doc.id);
  });

  it("tracks document versions", () => {
    const engine = new SyncEngine();
    const doc = engine.createDoc("note", { body: "v1" });
    engine.updateDoc(doc.id, { body: "v2" });
    engine.updateDoc(doc.id, { body: "v3" });
    assert.equal(engine.getVersion(doc.id), 3);
  });

  it("merges concurrent updates (CRDT — last-write-wins for demo)", () => {
    const engine = new SyncEngine();
    const doc = engine.createDoc("note", { title: "A", body: "a" });
    engine.updateDoc(doc.id, { title: "B" });
    engine.updateDoc(doc.id, { body: "b" });
    const merged = engine.getDoc(doc.id);
    assert.equal(merged.content.title, "B");
    assert.equal(merged.content.body, "b");
  });

  it("returns null for missing documents", () => {
    const engine = new SyncEngine();
    assert.equal(engine.getDoc("nonexistent"), null);
  });

  it("exports document state", () => {
    const engine = new SyncEngine();
    const doc = engine.createDoc("task", { title: "Buy milk", status: "todo", priority: "high" });
    const exported = engine.exportState(doc.id);
    assert.equal(exported.type, "task");
    assert.equal(exported.content.status, "todo");
    assert.ok(exported.version >= 1);
  });

  it("syncs across multiple engine instances (simulated)", () => {
    const alice = new SyncEngine();
    const bob = new SyncEngine();

    const docA = alice.createDoc("note", { title: "Shared" });
    const docB = bob.createDoc("note", { title: "Other" });

    // Import Alice's doc into Bob's engine
    const snapshot = alice.exportState(docA.id);
    bob.importState(snapshot);

    assert.equal(bob.getVersion(docA.id), snapshot.version);
    assert.equal(bob.getDoc(docA.id).content.title, "Shared");
  });
});
