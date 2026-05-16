const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const quizDao = require('../models/quiz.dao');

/* GET /api/quizzes/random - 随机获取测验题目 */
router.get('/random', authMiddleware, (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;
    const quizzes = quizDao.getRandom(limit);
    // 不返回正确答案
    const safe = quizzes.map(q => ({ id: q.id, content: q.content, option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d }));
    res.json({ code: 1, message: 'ok', data: safe });
  } catch (err) {
    console.error('[Quiz] random error:', err);
    res.status(500).json({ code: 0, message: '获取失败', data: null });
  }
});

/* POST /api/quizzes/answer - 提交答案 */
router.post('/answer', authMiddleware, (req, res) => {
  try {
    const { quizId, answer } = req.body;
    if (!quizId || !answer) return res.status(400).json({ code: 0, message: '参数不完整', data: null });

    const isCorrect = quizDao.submitAnswer(Number(quizId), req.user.id, answer);
    res.json({ code: 1, message: isCorrect ? '回答正确 🎉' : '回答错误，继续加油！', data: { isCorrect } });
  } catch (err) {
    console.error('[Quiz] answer error:', err);
    res.status(500).json({ code: 0, message: '提交失败', data: null });
  }
});

/* GET /api/quizzes/stats - 测验统计 */
router.get('/stats', authMiddleware, (req, res) => {
  try {
    const stats = quizDao.getStats(req.user.id);
    res.json({ code: 1, message: 'ok', data: stats });
  } catch (err) {
    console.error('[Quiz] stats error:', err);
    res.status(500).json({ code: 0, message: '获取失败', data: null });
  }
});

/* GET /api/quizzes/history - 历史答题记录 */
router.get('/history', authMiddleware, (req, res) => {
  try {
    const history = quizDao.getMyAnswers(req.user.id);
    res.json({ code: 1, message: 'ok', data: history });
  } catch (err) {
    console.error('[Quiz] history error:', err);
    res.status(500).json({ code: 0, message: '获取失败', data: null });
  }
});

module.exports = router;
