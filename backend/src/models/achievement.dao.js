const db = require('../models/database');

const AchievementDao = {
  /** 获取所有成就定义 */
  getAllDefinitions() {
    const result = db.getDb().exec('SELECT id, key, title, description, icon, condition_type, condition_value FROM achievements ORDER BY id');
    if (!result.length) return [];
    return result[0].values.map(row => ({
      id: row[0], key: row[1], title: row[2], description: row[3],
      icon: row[4], condition_type: row[5], condition_value: row[6]
    }));
  },

  /** 获取用户已解锁的成就 */
  getUnlocked(userId) {
    const result = db.getDb().exec(
      `SELECT a.id, a.key, a.title, a.description, a.icon, ua.unlocked_at
       FROM achievements a
       JOIN user_achievements ua ON a.id = ua.achievement_id
       WHERE ua.user_id = ?
       ORDER BY ua.unlocked_at DESC`,
      [userId]
    );
    if (!result.length) return [];
    return result[0].values.map(row => ({
      id: row[0], key: row[1], title: row[2], description: row[3],
      icon: row[4], unlocked_at: row[5]
    }));
  },

  /** 检查并解锁新成就，返回新增的成就列表 */
  checkAndUnlock(userId) {
    const definitions = this.getAllDefinitions();
    const unlocked = this.getUnlocked(userId).map(a => a.key);
    const newlyUnlocked = [];

    for (const def of definitions) {
      if (unlocked.includes(def.key)) continue;

      let unlocked_now = false;
      switch (def.condition_type) {
        case 'diary_count':
          if (this._getDiaryCount(userId) >= def.condition_value) unlocked_now = true;
          break;
        case 'photo_count':
          if (this._getPhotoCount(userId) >= def.condition_value) unlocked_now = true;
          break;
        case 'whisper_sent':
          if (this._getWhisperSent(userId) >= def.condition_value) unlocked_now = true;
          break;
        case 'anniversary_count':
          if (this._getAnniversaryCount(userId) >= def.condition_value) unlocked_now = true;
          break;
        case 'days_together':
          if (this._getDaysTogether() >= def.condition_value) unlocked_now = true;
          break;
        case 'first':
          if (def.key === 'first_diary' && this._getDiaryCount(userId) >= 1) unlocked_now = true;
          if (def.key === 'first_whisper' && this._getWhisperSent(userId) >= 1) unlocked_now = true;
          if (def.key === 'first_photo' && this._getPhotoCount(userId) >= 1) unlocked_now = true;
          break;
      }

      if (unlocked_now) {
        db.getDb().run(
          'INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)',
          [userId, def.id]
        );
        newlyUnlocked.push({ ...def, unlocked_at: new Date().toISOString() });
      }
    }

    if (newlyUnlocked.length > 0) db.save();
    return newlyUnlocked;
  },

  _getDiaryCount(userId) {
    const r = db.getDb().exec('SELECT COUNT(*) FROM diaries WHERE user_id = ?', [userId]);
    return r[0]?.values[0][0] || 0;
  },

  _getPhotoCount(userId) {
    const r = db.getDb().exec('SELECT COUNT(*) FROM photos WHERE user_id = ?', [userId]);
    return r[0]?.values[0][0] || 0;
  },

  _getWhisperSent(userId) {
    const r = db.getDb().exec('SELECT COUNT(*) FROM whispers WHERE from_user_id = ?', [userId]);
    return r[0]?.values[0][0] || 0;
  },

  _getAnniversaryCount(userId) {
    const r = db.getDb().exec('SELECT COUNT(*) FROM anniversaries WHERE user_id = ?', [userId]);
    return r[0]?.values[0][0] || 0;
  },

  _getDaysTogether() {
    // 计算从 2026-01-14 到今天的天数
    const start = new Date('2026-01-14');
    const now = new Date();
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
  },
};

module.exports = AchievementDao;
