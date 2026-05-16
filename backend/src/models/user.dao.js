/**
 * UserDao - uses sql.js API
 * sql.js has .run(), .exec(), and raw SQL results
 */
const dbManager = require('./database');

function _get(db) {
  return dbManager.getDb();
}

/** Helper: run a statement and return { lastInsertRowid, changes } */
function _run(sql, params = []) {
  const db = _get();
  db.run(sql, params);
  const info = db.exec('SELECT last_insert_rowid() as lid, changes() as chg');
  const lid = info.length > 0 ? info[0].values[0][0] : 0;
  const chg = info.length > 0 ? info[0].values[0][1] : 0;
  return { lastInsertRowid: lid, changes: chg };
}

/** Helper: get one row from SELECT */
function _getOne(sql, params = []) {
  const db = _get();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

/** Helper: get all rows from SELECT */
function _getAll(sql, params = []) {
  const db = _get();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

class UserDao {
  create({ username, passwordHash, email = '', nickname = '' }) {
    const result = _run(
      'INSERT INTO users (username, password_hash, email, nickname) VALUES (?, ?, ?, ?)',
      [username, passwordHash, email, nickname]
    );
    dbManager.save();
    return this.findById(result.lastInsertRowid);
  }

  findById(id) {
    return _getOne(
      'SELECT id, username, email, nickname, avatar, partner_name, partner_avatar, signature, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
  }

  findByUsername(username) {
    return _getOne('SELECT * FROM users WHERE username = ?', [username]);
  }

  update(id, { nickname, email, avatar, signature, partner_name, partner_avatar }) {
    const fields = [];
    const values = [];
    if (nickname !== undefined) { fields.push('nickname = ?'); values.push(nickname); }
    if (email !== undefined) { fields.push('email = ?'); values.push(email); }
    if (avatar !== undefined) { fields.push('avatar = ?'); values.push(avatar); }
    if (signature !== undefined) { fields.push('signature = ?'); values.push(signature); }
    if (partner_name !== undefined) { fields.push('partner_name = ?'); values.push(partner_name); }
    if (partner_avatar !== undefined) { fields.push('partner_avatar = ?'); values.push(partner_avatar); }

    if (fields.length === 0) return this.findById(id);

    fields.push("updated_at = datetime('now', 'localtime')");
    values.push(id);

    _run(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    dbManager.save();
    return this.findById(id);
  }

  delete(id) {
    return _run('DELETE FROM users WHERE id = ?', [id]);
  }
}

module.exports = new UserDao();
