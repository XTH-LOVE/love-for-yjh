const dbManager = require('./database');

const wishDao = {
  create(userId, title, description) {
    const db = dbManager.getDb();
    db.run(
      `INSERT INTO wishes (user_id, title, description) VALUES (?, ?, ?)`,
      [userId, title, description || '']
    );
    dbManager.save();
    const result = db.exec(`SELECT last_insert_rowid() as id`);
    return result[0].values[0][0];
  },

  findByUser(userId) {
    const db = dbManager.getDb();
    const result = db.exec(
      `SELECT * FROM wishes WHERE user_id = ? ORDER BY is_completed ASC, created_at DESC`,
      [userId]
    );
    if (result.length === 0) return [];
    const cols = result[0].columns;
    return result[0].values.map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]])));
  },

  complete(id, userId) {
    const db = dbManager.getDb();
    db.run(
      `UPDATE wishes SET is_completed = 1, completed_at = datetime('now', 'localtime') WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    dbManager.save();
  },

  delete(id, userId) {
    const db = dbManager.getDb();
    db.run(`DELETE FROM wishes WHERE id = ? AND user_id = ?`, [id, userId]);
    dbManager.save();
  },

  getStats(userId) {
    const db = dbManager.getDb();
    const total = db.exec(`SELECT COUNT(*) as c FROM wishes WHERE user_id = ?`, [userId]);
    const completed = db.exec(`SELECT COUNT(*) as c FROM wishes WHERE user_id = ? AND is_completed = 1`, [userId]);
    return {
      total: total[0].values[0][0],
      completed: completed[0].values[0][0],
    };
  },
};

module.exports = wishDao;
