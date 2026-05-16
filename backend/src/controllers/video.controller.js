const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { authMiddleware } = require('../middleware/auth');
const { success, error } = require('../utils/response');
const dbManager = require('../models/database');

const router = express.Router();

/* Upload storage config */
const VIDEO_DIR = path.join(__dirname, '../../data/videos');
if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, VIDEO_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp4';
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
  fileFilter: (req, file, cb) => {
    const allowed = /mp4|mov|avi|mkv|webm|m4v/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase().replace('.', ''));
    const mimeOk = file.mimetype.startsWith('video/');
    if (extOk || mimeOk) cb(null, true);
    else cb(new Error('Only video files are allowed'), false);
  },
});

/* Init videos table */
function ensureTable() {
  const db = dbManager.getDb();
  db.run(`
    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT DEFAULT '',
      filename TEXT NOT NULL DEFAULT '',
      mimetype TEXT DEFAULT 'video/mp4',
      size INTEGER DEFAULT 0,
      thumbnail TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
}

/** GET /api/videos - list all videos for user */
router.get('/', authMiddleware, (req, res, next) => {
  try {
    ensureTable();
    const db = dbManager.getDb();
    const stmt = db.prepare('SELECT * FROM videos WHERE user_id = ? ORDER BY created_at DESC');
    stmt.bind([req.user.id]);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return res.json(success(rows));
  } catch (err) { next(err); }
});

/** POST /api/videos/upload - upload a video */
router.post('/upload', authMiddleware, upload.single('video'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json(error(null, 'No file uploaded', 400));
    }
    ensureTable();
    const db = dbManager.getDb();
    const stmt = db.prepare(
      'INSERT INTO videos (user_id, title, filename, mimetype, size) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run([req.user.id, req.body.title || '', req.file.filename, req.file.mimetype, req.file.size]);
    stmt.free();
    dbManager.save();

    // fetch the inserted row
    const stmt2 = db.prepare('SELECT * FROM videos WHERE user_id = ? ORDER BY id DESC LIMIT 1');
    stmt2.bind([req.user.id]);
    let video = null;
    if (stmt2.step()) video = stmt2.getAsObject();
    stmt2.free();

    return res.status(201).json(success(video, 'Video uploaded'));
  } catch (err) { next(err); }
});

/** GET /api/videos/file/:filename - stream video file */
router.get('/file/:filename', (req, res, next) => {
  try {
    const filePath = path.join(VIDEO_DIR, req.params.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json(error(null, 'File not found', 404));
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    // 检测是否为移动端浏览器
    const userAgent = req.headers['user-agent'] || '';
    const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);

    // 对于移动端，直接发送完整文件，不使用 Range
    if (isMobile) {
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Length', fileSize);
      res.setHeader('Accept-Ranges', 'none');
      res.setHeader('Cache-Control', 'no-cache');
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) { next(err); }
});

/** DELETE /api/videos/:id */
router.delete('/:id', authMiddleware, (req, res, next) => {
  try {
    ensureTable();
    const db = dbManager.getDb();
    const stmt = db.prepare('SELECT * FROM videos WHERE id = ? AND user_id = ?');
    stmt.bind([parseInt(req.params.id), req.user.id]);
    let video = null;
    if (stmt.step()) video = stmt.getAsObject();
    stmt.free();

    if (!video) {
      return res.status(404).json(error(null, 'Video not found', 404));
    }

    const filePath = path.join(VIDEO_DIR, video.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    const del = db.prepare('DELETE FROM videos WHERE id = ? AND user_id = ?');
    del.run([parseInt(req.params.id), req.user.id]);
    del.free();
    dbManager.save();

    return res.json(success(null, 'Video deleted'));
  } catch (err) { next(err); }
});

module.exports = router;
