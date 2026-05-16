const dbManager = require('./database');

const couponDao = {
  create(userId, title, subtitle, color) {
    const db = dbManager.getDb();
    db.run(
      `INSERT INTO coupons (user_id, title, subtitle, color) VALUES (?, ?, ?, ?)`,
      [userId, title, subtitle || '', color || '#ff6b9d']
    );
    dbManager.save();
    const result = db.exec(`SELECT last_insert_rowid() as id`);
    return result[0].values[0][0];
  },

  findByUser(userId) {
    const db = dbManager.getDb();
    const result = db.exec(
      `SELECT c.*, u.nickname as creator_name FROM coupons c
       JOIN users u ON c.user_id = u.id
       WHERE c.user_id = ? ORDER BY c.created_at DESC`,
      [userId]
    );
    if (result.length === 0) return [];
    const cols = result[0].columns;
    return result[0].values.map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]])));
  },

  findAll() {
    const db = dbManager.getDb();
    const result = db.exec(
      `SELECT c.*, u.nickname as creator_name FROM coupons c
       JOIN users u ON c.user_id = u.id
       ORDER BY c.created_at DESC`
    );
    if (result.length === 0) return [];
    const cols = result[0].columns;
    return result[0].values.map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]])));
  },

  markUsed(id, userId) {
    const db = dbManager.getDb();
    db.run(
      `UPDATE coupons SET is_used = 1, used_by = ?, used_at = datetime('now', 'localtime') WHERE id = ?`,
      [userId, id]
    );
    dbManager.save();
  },

  delete(id, userId) {
    const db = dbManager.getDb();
    db.run(`DELETE FROM coupons WHERE id = ? AND user_id = ?`, [id, userId]);
    dbManager.save();
  },

  count(userId) {
    const db = dbManager.getDb();
    const result = db.exec(`SELECT COUNT(*) as c FROM coupons WHERE user_id = ?`, [userId]);
    return result[0].values[0][0];
  },
};

module.exports = couponDao;
