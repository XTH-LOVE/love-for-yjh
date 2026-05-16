const express = require('express');
const router = express.Router();
const AchievementDao = require('../models/achievement.dao');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// 获取成就列表（含已解锁状态）
router.get('/', (req, res) => {
  const userId = req.user.id;
  const definitions = AchievementDao.getAllDefinitions();
  const unlocked = AchievementDao.getUnlocked(userId);
  const unlockedKeys = new Set(unlocked.map(a => a.key));

  const data = definitions.map(d => {
    const ua = unlocked.find(u => u.key === d.key);
    return {
      ...d,
      unlocked: !!ua,
      unlocked_at: ua?.unlocked_at || null,
    };
  });

  res.json({ code: 200, message: 'ok', data });
});

// 检查并解锁新成就
router.post('/check', (req, res) => {
  const userId = req.user.id;
  const newlyUnlocked = AchievementDao.checkAndUnlock(userId);
  res.json({ code: 200, message: 'ok', data: newlyUnlocked });
});

// 获取已解锁成就
router.get('/mine', (req, res) => {
  const userId = req.user.id;
  const unlocked = AchievementDao.getUnlocked(userId);
  res.json({ code: 200, message: 'ok', data: unlocked });
});

module.exports = router;
