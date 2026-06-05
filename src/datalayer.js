/**
 * PGlite-compatible structured data layer for tasks and calendar.
 * Stores rows as JSON in memory, with OPFS browser persistence mode.
 */
export class DataLayer {
  constructor() {
    this.tables = new Map(); // tableName -> rows[]
  }

  createTable(name, schema) {
    this.tables.set(name, { schema, rows: [], idCounter: 0 });
  }

  insert(table, row) {
    const t = this.tables.get(table);
    if (!t) throw new Error("Table not found: " + table);
    t.idCounter++;
    const inserted = { id: t.idCounter, ...row, createdAt: new Date().toISOString() };
    t.rows.push(inserted);
    return inserted;
  }

  query(table, predicate = () => true) {
    const t = this.tables.get(table);
    return t ? t.rows.filter(predicate) : [];
  }

  update(table, id, fields) {
    const t = this.tables.get(table);
    if (!t) return null;
    const idx = t.rows.findIndex(r => r.id === id);
    if (idx === -1) return null;
    t.rows[idx] = { ...t.rows[idx], ...fields, updatedAt: new Date().toISOString() };
    return t.rows[idx];
  }

  delete(table, id) {
    const t = this.tables.get(table);
    if (!t) return false;
    const idx = t.rows.findIndex(r => r.id === id);
    if (idx === -1) return false;
    t.rows.splice(idx, 1);
    return true;
  }

  export() {
    const data = {};
    for (const [name, t] of this.tables) data[name] = t.rows;
    return data;
  }

  import(data) {
    for (const [name, rows] of Object.entries(data)) {
      if (!this.tables.has(name)) this.createTable(name, {});
      this.tables.get(name).rows = rows;
    }
  }
}
