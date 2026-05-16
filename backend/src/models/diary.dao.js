const db = require('../models/database');

const DiaryDao = {
  create(userId, content, mood) {
    db.getDb().run(
      'INSERT INTO diaries (user_id, content, mood) VALUES (?, ?, ?)',
      [userId, content, mood]
    );
    db.save();
    const result = db.getDb().exec('SELECT last_insert_rowid() as id');
    return result[0].values[0][0];
  },

  findAll(userId) {
    const result = db.getDb().exec(
      `SELECT id, content, mood, created_at FROM diaries WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    if (!result.length) return [];
    return result[0].values.map(row => ({
      id: row[0], content: row[1], mood: row[2], created_at: row[3]
    }));
  },

  findById(id) {
    const result = db.getDb().exec(
      `SELECT id, user_id, content, mood, created_at FROM diaries WHERE id = ?`,
      [id]
    );
    if (!result.length || !result[0].values.length) return null;
    const row = result[0].values[0];
    return { id: row[0], user_id: row[1], content: row[2], mood: row[3], created_at: row[4] };
  },

  update(id, content, mood) {
    db.getDb().run('UPDATE diaries SET content = ?, mood = ? WHERE id = ?', [content, mood, id]);
    db.save();
  },

  delete(id) {
    db.getDb().run('DELETE FROM diaries WHERE id = ?', [id]);
    db.save();
  },

  count(userId) {
    const result = db.getDb().exec('SELECT COUNT(*) FROM diaries WHERE user_id = ?', [userId]);
    return result[0].values[0][0];
  },
};

module.exports = DiaryDao;
