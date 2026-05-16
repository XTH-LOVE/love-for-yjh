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

class PhotoDao {
  create({ userId, title, filename, mimetype, size }) {
    const r = _run(
      'INSERT INTO photos (user_id, title, filename, mimetype, size) VALUES (?, ?, ?, ?, ?)',
      [userId, title || '', filename, mimetype || 'image/jpeg', size || 0]
    );
    dbManager.save();
    return this.findById(r.lastInsertRowid);
  }

  findById(id) {
    return _getOne('SELECT * FROM photos WHERE id = ?', [id]);
  }

  findByUserId(userId) {
    return _getAll('SELECT * FROM photos WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  }

  delete(id, userId) {
    _run('DELETE FROM photos WHERE id = ? AND user_id = ?', [id, userId]);
    dbManager.save();
  }
}

module.exports = new PhotoDao();
