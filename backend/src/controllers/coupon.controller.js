const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const couponDao = require('../models/coupon.dao');

/* GET /api/coupons - 获取我的优惠券 */
router.get('/', authMiddleware, (req, res) => {
  try {
    const coupons = couponDao.findByUser(req.user.id);
    res.json({ code: 1, message: 'ok', data: coupons });
  } catch (err) {
    console.error('[Coupon] list error:', err);
    res.status(500).json({ code: 0, message: '获取失败', data: null });
  }
});

/* GET /api/coupons/all - 获取所有优惠券（可看到对方创建的） */
router.get('/all', authMiddleware, (req, res) => {
  try {
    const coupons = couponDao.findAll();
    res.json({ code: 1, message: 'ok', data: coupons });
  } catch (err) {
    console.error('[Coupon] all error:', err);
    res.status(500).json({ code: 0, message: '获取失败', data: null });
  }
});

/* POST /api/coupons - 创建优惠券 */
router.post('/', authMiddleware, (req, res) => {
  try {
    const { title, subtitle, color } = req.body;
    if (!title) return res.status(400).json({ code: 0, message: '标题不能为空', data: null });

    const id = couponDao.create(req.user.id, title, subtitle || '', color || '#ff6b9d');
    res.json({ code: 1, message: '优惠券创建成功', data: { id } });
  } catch (err) {
    console.error('[Coupon] create error:', err);
    res.status(500).json({ code: 0, message: '创建失败', data: null });
  }
});

/* POST /api/coupons/:id/use - 使用优惠券 */
router.post('/:id/use', authMiddleware, (req, res) => {
  try {
    couponDao.markUsed(Number(req.params.id), req.user.id);
    res.json({ code: 1, message: '优惠券已使用 💕', data: null });
  } catch (err) {
    console.error('[Coupon] use error:', err);
    res.status(500).json({ code: 0, message: '使用失败', data: null });
  }
});

/* DELETE /api/coupons/:id - 删除优惠券 */
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    couponDao.delete(Number(req.params.id), req.user.id);
    res.json({ code: 1, message: '删除成功', data: null });
  } catch (err) {
    console.error('[Coupon] delete error:', err);
    res.status(500).json({ code: 0, message: '删除失败', data: null });
  }
});

module.exports = router;
