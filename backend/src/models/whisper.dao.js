const db = require('../models/database');

const WhisperDao = {
  create(fromUserId, toUserId, content) {
    db.getDb().run(
      'INSERT INTO whispers (from_user_id, to_user_id, content) VALUES (?, ?, ?)',
      [fromUserId, toUserId, content]
    );
    db.save();
    const result = db.getDb().exec('SELECT last_insert_rowid() as id');
    return result[0].values[0][0];
  },

  /** 获取发给某用户的所有悄悄话（按时间倒序） */
  findForUser(userId) {
    const result = db.getDb().exec(
      `SELECT w.id, w.content, w.is_read, w.created_at,
              u.id as from_user_id, u.nickname as from_nickname
       FROM whispers w
       LEFT JOIN users u ON w.from_user_id = u.id
       WHERE w.to_user_id = ?
       ORDER BY w.created_at DESC`,
      [userId]
    );
    if (!result.length) return [];
    return result[0].values.map(row => ({
      id: row[0], content: row[1], is_read: !!row[2], created_at: row[3],
      from_user_id: row[4], from_nickname: row[5]
    }));
  },

  /** 获取我发出的所有悄悄话 */
  findFromUser(userId) {
    const result = db.getDb().exec(
      `SELECT w.id, w.content, w.is_read, w.created_at,
              u.id as to_user_id, u.nickname as to_nickname
       FROM whispers w
       LEFT JOIN users u ON w.to_user_id = u.id
       WHERE w.from_user_id = ?
       ORDER BY w.created_at DESC`,
      [userId]
    );
    if (!result.length) return [];
    return result[0].values.map(row => ({
      id: row[0], content: row[1], is_read: !!row[2], created_at: row[3],
      to_user_id: row[4], to_nickname: row[5]
    }));
  },

  /** 标记某条悄悄话为已读 */
  markRead(id) {
    db.getDb().run('UPDATE whispers SET is_read = 1 WHERE id = ?', [id]);
    db.save();
  },

  /** 统计未读数 */
  countUnread(userId) {
    const result = db.getDb().exec(
      'SELECT COUNT(*) FROM whispers WHERE to_user_id = ? AND is_read = 0',
      [userId]
    );
    return result[0].values[0][0];
  },
};

module.exports = WhisperDao;
