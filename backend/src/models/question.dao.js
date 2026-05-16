const dbManager = require('./database');

const questionDao = {
  /** 获取今日问题（每个用户每天一个问题） */
  getToday() {
    const db = dbManager.getDb();
    const today = new Date().toISOString().slice(0, 10);
    const result = db.exec(`SELECT * FROM questions WHERE is_active = 1 ORDER BY RANDOM() LIMIT 1`);
    if (result.length === 0 || result[0].values.length === 0) return null;
    const cols = result[0].columns;
    return Object.fromEntries(cols.map((c, i) => [c, result[0].values[0][i]]));
  },

  /** 获取所有已激活的问题 */
  getAll() {
    const db = dbManager.getDb();
    const result = db.exec(`SELECT * FROM questions WHERE is_active = 1 ORDER BY id DESC`);
    if (result.length === 0) return [];
    const cols = result[0].columns;
    return result[0].values.map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]])));
  },

  /** 提交答案 */
  submitAnswer(questionId, userId, answer) {
    const db = dbManager.getDb();
    db.run(
      `INSERT OR REPLACE INTO question_answers (question_id, user_id, answer) VALUES (?, ?, ?)`,
      [questionId, userId, answer]
    );
    dbManager.save();
  },

  /** 获取某问题的所有回答 */
  getAnswers(questionId) {
    const db = dbManager.getDb();
    const result = db.exec(
      `SELECT qa.*, u.nickname FROM question_answers qa
       JOIN users u ON qa.user_id = u.id
       WHERE qa.question_id = ? ORDER BY qa.created_at`,
      [questionId]
    );
    if (result.length === 0) return [];
    const cols = result[0].columns;
    return result[0].values.map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]])));
  },

  /** 获取当前用户对某问题的回答 */
  getMyAnswer(questionId, userId) {
    const db = dbManager.getDb();
    const result = db.exec(
      `SELECT * FROM question_answers WHERE question_id = ? AND user_id = ?`,
      [questionId, userId]
    );
    if (result.length === 0 || result[0].values.length === 0) return null;
    const cols = result[0].columns;
    return Object.fromEntries(cols.map((c, i) => [c, result[0].values[0][i]]));
  },

  /** 获取历史问答记录 */
  getHistory(userId) {
    const db = dbManager.getDb();
    const result = db.exec(
      `SELECT q.*, qa.answer as my_answer, qa.created_at as answered_at,
              (SELECT COUNT(*) FROM question_answers WHERE question_id = q.id) as answer_count
       FROM questions q
       LEFT JOIN question_answers qa ON q.id = qa.question_id AND qa.user_id = ?
       WHERE q.id IN (SELECT question_id FROM question_answers)
       ORDER BY qa.created_at DESC`,
      [userId]
    );
    if (result.length === 0) return [];
    const cols = result[0].columns;
    return result[0].values.map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]])));
  },
};

module.exports = questionDao;
