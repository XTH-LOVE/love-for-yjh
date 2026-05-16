const dbManager = require('./database');

function _getOne(sql, params = []) {
  const db = dbManager.getDb();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) { const row = stmt.getAsObject(); stmt.free(); return row; }
  stmt.free();
  return null;
}

function _getAll(sql, params = []) {
  const db = dbManager.getDb();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) { rows.push(stmt.getAsObject()); }
  stmt.free();
  return rows;
}

function _run(sql, params = []) {
  const db = dbManager.getDb();
  db.run(sql, params);
  const info = db.exec('SELECT last_insert_rowid() as lid');
  const lid = info.length > 0 ? info[0].values[0][0] : 0;
  return { lastInsertRowid: lid };
}

class LoveNoteDao {
  getRandom() {
    const rows = _getAll('SELECT * FROM love_notes ORDER BY RANDOM() LIMIT 1');
    return rows.length > 0 ? rows[0] : null;
  }

  getAll() {
    return _getAll('SELECT * FROM love_notes ORDER BY id ASC');
  }

  getByCategory(category) {
    return _getAll('SELECT * FROM love_notes WHERE category = ? ORDER BY RANDOM()', [category]);
  }

  create(content, category = 'general') {
    const r = _run('INSERT INTO love_notes (content, category) VALUES (?, ?)', [content, category]);
    dbManager.save();
    return _getOne('SELECT * FROM love_notes WHERE id = ?', [r.lastInsertRowid]);
  }
}

module.exports = new LoveNoteDao();
