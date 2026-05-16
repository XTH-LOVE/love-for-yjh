const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const wishDao = require('../models/wish.dao');

/* GET /api/wishes - 获取愿望列表 */
router.get('/', authMiddleware, (req, res) => {
  try {
    const wishes = wishDao.findByUser(req.user.id);
    const stats = wishDao.getStats(req.user.id);
    res.json({ code: 1, message: 'ok', data: { wishes, stats } });
  } catch (err) {
    console.error('[Wish] list error:', err);
    res.status(500).json({ code: 0, message: '获取失败', data: null });
  }
});

/* POST /api/wishes - 创建愿望 */
router.post('/', authMiddleware, (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ code: 0, message: '愿望不能为空', data: null });

    const id = wishDao.create(req.user.id, title, description || '');
    res.json({ code: 1, message: '愿望创建成功 ✨', data: { id } });
  } catch (err) {
    console.error('[Wish] create error:', err);
    res.status(500).json({ code: 0, message: '创建失败', data: null });
  }
});

/* POST /api/wishes/:id/complete - 完成愿望 */
router.post('/:id/complete', authMiddleware, (req, res) => {
  try {
    wishDao.complete(Number(req.params.id), req.user.id);
    res.json({ code: 1, message: '太棒了！愿望已完成 🎉', data: null });
  } catch (err) {
    console.error('[Wish] complete error:', err);
    res.status(500).json({ code: 0, message: '操作失败', data: null });
  }
});

/* DELETE /api/wishes/:id - 删除愿望 */
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    wishDao.delete(Number(req.params.id), req.user.id);
    res.json({ code: 1, message: '删除成功', data: null });
  } catch (err) {
    console.error('[Wish] delete error:', err);
    res.status(500).json({ code: 0, message: '删除失败', data: null });
  }
});

module.exports = router;
