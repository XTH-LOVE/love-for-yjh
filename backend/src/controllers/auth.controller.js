const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authService = require('../services/auth.service');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

/* ==================== Avatar Upload Config ==================== */
const avatarDir = path.join(__dirname, '../../data/avatars');
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `avatar_${req.user?.id}_${Date.now()}${ext}`);
  }
});

const uploadAvatar = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
}).single('avatar');

/** POST /api/auth/register */
router.post('/register', async (req, res, next) => {
  try {
    const { status, result } = await authService.register(req.body);
    return res.status(status).json(result);
  } catch (err) {
    next(err);
  }
});

/** POST /api/auth/login */
router.post('/login', async (req, res, next) => {
  try {
    const { status, result } = await authService.login(req.body);
    return res.status(status).json(result);
  } catch (err) {
    next(err);
  }
});

/** GET /api/auth/profile (protected) */
router.get('/profile', authMiddleware, (req, res, next) => {
  try {
    const { status, result } = authService.getProfile(req.user.id);
    return res.status(status).json(result);
  } catch (err) {
    next(err);
  }
});

/** PUT /api/auth/profile (protected) */
router.put('/profile', authMiddleware, (req, res, next) => {
  try {
    const { status, result } = authService.updateProfile(req.user.id, req.body);
    return res.status(status).json(result);
  } catch (err) {
    next(err);
  }
});

/** POST /api/auth/avatar - Upload avatar */
router.post('/avatar', authMiddleware, (req, res, next) => {
  uploadAvatar(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ code: 400, message: err.message || 'Upload failed' });
    }
    if (!req.file) {
      return res.status(400).json({ code: 400, message: 'No file uploaded' });
    }
    try {
      const avatarPath = `/api/auth/avatar/${req.file.filename}`;
      const { status, result } = authService.updateProfile(req.user.id, { avatar: avatarPath });
      return res.status(status).json(result);
    } catch (err) {
      next(err);
    }
  });
});

/** POST /api/auth/partner-avatar - Upload partner avatar */
router.post('/partner-avatar', authMiddleware, (req, res, next) => {
  uploadAvatar(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ code: 400, message: err.message || 'Upload failed' });
    }
    if (!req.file) {
      return res.status(400).json({ code: 400, message: 'No file uploaded' });
    }
    try {
      const avatarPath = `/api/auth/avatar/${req.file.filename}`;
      const { status, result } = authService.updateProfile(req.user.id, { partner_avatar: avatarPath });
      return res.status(status).json(result);
    } catch (err) {
      next(err);
    }
  });
});

/** GET /api/auth/avatar/:filename - Serve avatar */
router.get('/avatar/:filename', (req, res) => {
  const filename = req.params.filename.replace(/\.\./g, ''); // Prevent directory traversal
  const filePath = path.join(avatarDir, filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ code: 404, message: 'Avatar not found' });
  }
});

module.exports = router;
