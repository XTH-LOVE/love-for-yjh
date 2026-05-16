const express = require('express');
const router = express.Router();
const DiaryDao = require('../models/diary.dao');
const { authMiddleware } = require('../middleware/auth');

// 全部日记接口需要登录
router.use(authMiddleware);

// 创建日记
router.post('/', (req, res) => {
  const userId = req.user.id;
  const { content, mood } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ code: 400, message: '内容不能为空', data: null });
  }
  const id = DiaryDao.create(userId, content.trim(), mood || 'happy');
  res.json({ code: 200, message: '保存成功', data: { id } });
});

// 获取所有日记
router.get('/', (req, res) => {
  const userId = req.user.id;
  const diaries = DiaryDao.findAll(userId);
  res.json({ code: 200, message: 'ok', data: diaries });
});

// 更新日记
router.put('/:id', (req, res) => {
  const userId = req.user.id;
  const { content, mood } = req.body;
  const diary = DiaryDao.findById(req.params.id);
  if (!diary || diary.user_id !== userId) {
    return res.status(404).json({ code: 404, message: '日记不存在', data: null });
  }
  DiaryDao.update(req.params.id, content.trim(), mood || diary.mood);
  res.json({ code: 200, message: '更新成功', data: null });
});

// 删除日记
router.delete('/:id', (req, res) => {
  const userId = req.user.id;
  const diary = DiaryDao.findById(req.params.id);
  if (!diary || diary.user_id !== userId) {
    return res.status(404).json({ code: 404, message: '日记不存在', data: null });
  }
  DiaryDao.delete(req.params.id);
  res.json({ code: 200, message: '删除成功', data: null });
});

module.exports = router;
