const express = require('express');
const router = express.Router();
const WhisperDao = require('../models/whisper.dao');
const UserDao = require('../models/user.dao');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// 发送悄悄话
router.post('/', (req, res) => {
  const fromUserId = req.user.id;
  const { toUsername, content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ code: 400, message: '内容不能为空', data: null });
  }
  if (!toUsername) {
    return res.status(400).json({ code: 400, message: '请指定接收人', data: null });
  }
  // 查找目标用户
  const toUser = UserDao.findByUsername(toUsername);
  if (!toUser) {
    return res.status(404).json({ code: 404, message: '用户不存在', data: null });
  }
  if (toUser.id === fromUserId) {
    return res.status(400).json({ code: 400, message: '不能给自己发悄悄话', data: null });
  }
  const id = WhisperDao.create(fromUserId, toUser.id, content.trim());
  res.json({ code: 200, message: '悄悄话已送达', data: { id } });
});

// 获取收到的悄悄话
router.get('/received', (req, res) => {
  const userId = req.user.id;
  const whispers = WhisperDao.findForUser(userId);
  res.json({ code: 200, message: 'ok', data: whispers });
});

// 获取发出的悄悄话
router.get('/sent', (req, res) => {
  const userId = req.user.id;
  const whispers = WhisperDao.findFromUser(userId);
  res.json({ code: 200, message: 'ok', data: whispers });
});

// 标记已读
router.put('/:id/read', (req, res) => {
  WhisperDao.markRead(req.params.id);
  res.json({ code: 200, message: '已读', data: null });
});

// 获取未读数
router.get('/unread-count', (req, res) => {
  const userId = req.user.id;
  const count = WhisperDao.countUnread(userId);
  res.json({ code: 200, message: 'ok', data: { count } });
});

module.exports = router;
