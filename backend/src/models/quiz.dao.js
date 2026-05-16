const dbManager = require('./database');

const quizDao = {
  getAll() {
    const db = dbManager.getDb();
    const result = db.exec(`SELECT * FROM quizzes ORDER BY id`);
    if (result.length === 0) return [];
    const cols = result[0].columns;
    return result[0].values.map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]])));
  },

  getRandom(limit = 5) {
    const db = dbManager.getDb();
    const result = db.exec(`SELECT * FROM quizzes ORDER BY RANDOM() LIMIT ${Number(limit)}`);
    if (result.length === 0) return [];
    const cols = result[0].columns;
    return result[0].values.map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]])));
  },

  submitAnswer(quizId, userId, userAnswer) {
    const db = dbManager.getDb();
    const quizResult = db.exec(`SELECT answer FROM quizzes WHERE id = ?`, [quizId]);
    if (quizResult.length === 0 || quizResult[0].values.length === 0) return false;
    const correctAnswer = quizResult[0].values[0][0];
    const isCorrect = userAnswer.toUpperCase() === correctAnswer.toUpperCase();
    db.run(
      `INSERT OR REPLACE INTO quiz_answers (quiz_id, user_id, user_answer, is_correct) VALUES (?, ?, ?, ?)`,
      [quizId, userId, userAnswer, isCorrect ? 1 : 0]
    );
    dbManager.save();
    return isCorrect;
  },

  getMyAnswers(userId) {
    const db = dbManager.getDb();
    const result = db.exec(
      `SELECT qa.*, q.content, q.option_a, q.option_b, q.option_c, q.option_d, q.answer as correct_answer
       FROM quiz_answers qa JOIN quizzes q ON qa.quiz_id = q.id
       WHERE qa.user_id = ? ORDER BY qa.created_at DESC`,
      [userId]
    );
    if (result.length === 0) return [];
    const cols = result[0].columns;
    return result[0].values.map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]])));
  },

  getStats(userId) {
    const db = dbManager.getDb();
    const total = db.exec(`SELECT COUNT(*) as c FROM quiz_answers WHERE user_id = ?`, [userId]);
    const correct = db.exec(`SELECT COUNT(*) as c FROM quiz_answers WHERE user_id = ? AND is_correct = 1`, [userId]);
    return {
      total: total[0].values[0][0],
      correct: correct[0].values[0][0],
    };
  },
};

module.exports = quizDao;
