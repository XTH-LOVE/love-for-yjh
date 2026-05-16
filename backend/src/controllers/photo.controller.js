const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const photoDao = require('../models/photo.dao');
const { authMiddleware } = require('../middleware/auth');
const { success, error } = require('../utils/response');

const router = express.Router();

/* Upload storage config */
const UPLOAD_DIR = path.join(__dirname, '../../data/uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|bmp/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase().replace('.', ''));
    const mimeOk = allowed.test(file.mimetype.split('/')[1]?.toLowerCase() || '');
    if (extOk || mimeOk) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

/** GET /api/photos - list all photos for user */
router.get('/', authMiddleware, (req, res, next) => {
  try {
    const photos = photoDao.findByUserId(req.user.id);
    return res.json(success(photos));
  } catch (err) { next(err); }
});

/** POST /api/photos/upload - upload photos (multi) */
router.post('/upload', authMiddleware, upload.array('photos', 20), (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json(error(null, 'No files uploaded', 400));
    }
    const results = [];
    for (const file of req.files) {
      const photo = photoDao.create({
        userId: req.user.id,
        title: req.body.title || '',
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
      });
      results.push(photo);
    }
    return res.status(201).json(success(results, `${results.length} photo(s) uploaded`));
  } catch (err) { next(err); }
});

/** GET /api/photos/file/:filename - serve uploaded image */
router.get('/file/:filename', (req, res, next) => {
  try {
    const filePath = path.join(UPLOAD_DIR, req.params.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json(error(null, 'File not found', 404));
    }
    res.sendFile(filePath);
  } catch (err) { next(err); }
});

/** DELETE /api/photos/:id */
router.delete('/:id', authMiddleware, (req, res, next) => {
  try {
    const photo = photoDao.findById(parseInt(req.params.id));
    if (!photo) {
      return res.status(404).json(error(null, 'Photo not found', 404));
    }
    // Delete file from disk
    const filePath = path.join(UPLOAD_DIR, photo.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    photoDao.delete(parseInt(req.params.id), req.user.id);
    return res.json(success(null, 'Photo deleted'));
  } catch (err) { next(err); }
});

module.exports = router;
