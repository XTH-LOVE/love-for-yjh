const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const questionDao = require('../models/question.dao');

/* GET /api/questions/today - 获取今日问题 */
router.get('/today', authMiddleware, (req, res) => {
  try {
    const question = questionDao.getToday();
    if (!question) return res.json({ code: 0, message: '暂无问题', data: null });

    const answers = questionDao.getAnswers(question.id);
    const myAnswer = questionDao.getMyAnswer(question.id, req.user.id);

    res.json({
      code: 1,
      message: 'ok',
      data: {
        ...question,
        answers,
        myAnswer: myAnswer ? myAnswer.answer : null,
      },
    });
  } catch (err) {
    console.error('[Question] today error:', err);
    res.status(500).json({ code: 0, message: '获取失败', data: null });
  }
});

/* POST /api/questions/answer - 提交答案 */
router.post('/answer', authMiddleware, (req, res) => {
  try {
    const { questionId, answer } = req.body;
    if (!questionId || !answer) return res.status(400).json({ code: 0, message: '参数不完整', data: null });

    questionDao.submitAnswer(Number(questionId), req.user.id, answer);

    const answers = questionDao.getAnswers(Number(questionId));
    const myAnswer = questionDao.getMyAnswer(Number(questionId), req.user.id);

    res.json({
      code: 1,
      message: '回答成功',
      data: { answers, myAnswer: myAnswer ? myAnswer.answer : null },
    });
  } catch (err) {
    console.error('[Question] answer error:', err);
    res.status(500).json({ code: 0, message: '提交失败', data: null });
  }
});

/* GET /api/questions/history - 历史问答 */
router.get('/history', authMiddleware, (req, res) => {
  try {
    const history = questionDao.getHistory(req.user.id);
    res.json({ code: 1, message: 'ok', data: history });
  } catch (err) {
    console.error('[Question] history error:', err);
    res.status(500).json({ code: 0, message: '获取失败', data: null });
  }
});

/* GET /api/questions/all - 所有问题列表 */
router.get('/all', authMiddleware, (req, res) => {
  try {
    const questions = questionDao.getAll();
    res.json({ code: 1, message: 'ok', data: questions });
  } catch (err) {
    console.error('[Question] all error:', err);
    res.status(500).json({ code: 0, message: '获取失败', data: null });
  }
});

module.exports = router;
