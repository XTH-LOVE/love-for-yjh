const dbManager = require('./database');

function _run(sql, params = []) {
  const db = dbManager.getDb();
  db.run(sql, params);
  const info = db.exec('SELECT last_insert_rowid() as lid');
  const lid = info.length > 0 ? info[0].values[0][0] : 0;
  return { lastInsertRowid: lid };
}

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

class AnniversaryDao {
  create({ userId, title, date }) {
    const r = _run('INSERT INTO anniversaries (user_id, title, date) VALUES (?, ?, ?)', [userId, title, date]);
    dbManager.save();
    return this.findById(r.lastInsertRowid);
  }

  findById(id) {
    return _getOne('SELECT * FROM anniversaries WHERE id = ?', [id]);
  }

  findByUserId(userId) {
    return _getAll('SELECT * FROM anniversaries WHERE user_id = ? ORDER BY date ASC', [userId]);
  }

  update(id, { title, date }) {
    const fields = []; const values = [];
    if (title !== undefined) { fields.push('title = ?'); values.push(title); }
    if (date !== undefined) { fields.push('date = ?'); values.push(date); }
    if (fields.length === 0) return this.findById(id);
    values.push(id);
    _run(`UPDATE anniversaries SET ${fields.join(', ')} WHERE id = ?`, values);
    dbManager.save();
    return this.findById(id);
  }

  delete(id, userId) {
    _run('DELETE FROM anniversaries WHERE id = ? AND user_id = ?', [id, userId]);
    dbManager.save();
  }
}

module.exports = new AnniversaryDao();
