const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const dbManager = require('./models/database');

const authController = require('./controllers/auth.controller');
const loveController = require('./controllers/love.controller');
const photoController = require('./controllers/photo.controller');
const videoController = require('./controllers/video.controller');
const diaryController = require('./controllers/diary.controller');
const whisperController = require('./controllers/whisper.controller');
const achievementController = require('./controllers/achievement.controller');
const questionController = require('./controllers/question.controller');
const couponController = require('./controllers/coupon.controller');
const wishController = require('./controllers/wish.controller');
const quizController = require('./controllers/quiz.controller');

const app = express();

/* ==================== Middleware ==================== */
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ==================== API Routes ==================== */
app.use('/api/auth', authController);
app.use('/api/love', loveController);
app.use('/api/photos', photoController);
app.use('/api/videos', videoController);
app.use('/api/diaries', diaryController);
app.use('/api/whispers', whisperController);
app.use('/api/achievements', achievementController);
app.use('/api/questions', questionController);
app.use('/api/coupons', couponController);
app.use('/api/wishes', wishController);
app.use('/api/quizzes', quizController);

/** Health check */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Love For YJH', time: new Date().toISOString() });
});

/* ==================== Static Files ==================== */
const publicDir = path.join(__dirname, '../public');
if (fs.existsSync(publicDir)) {
  app.use('/static', express.static(publicDir));
}

/* ==================== Serve Frontend Static Files ==================== */
const frontendDist = path.join(__dirname, '../../frontend/build');

if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));

  // SPA fallback: any non-API request returns index.html
  app.get(/^(?!\/api).*/, (req, res) => {
    const filePath = path.join(frontendDist, req.path);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      res.sendFile(filePath);
    } else {
      res.sendFile(path.join(frontendDist, 'index.html'));
    }
  });

  console.log('[Static] Frontend dist found, serving static files');
}

/* ==================== Global Error Handler ==================== */
app.use((err, req, res, next) => {
  console.error('[Error]', err.message || err);
  res.status(500).json({ code: 500, message: 'Internal Server Error', data: null });
});

/* ==================== Start Server (async to init DB) ==================== */
/**
 * Graceful shutdown handler.
 * NOTE: All DAO write operations already call dbManager.save() immediately.
 * We do NOT save here to prevent stale in-memory DB from overwriting the file.
 */
function gracefulShutdown(signal) {
  console.log(`[Signal] ${signal} received, shutting down...`);
  process.exit(0);
}
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

async function start() {
  // Railway 环境：检查是否需要初始化数据库
  if (process.env.RAILWAY_ENVIRONMENT) {
    try {
      const initDb = require('../init-db');
      await initDb.initDatabase();
    } catch (e) {
      console.log('[Init] 跳过数据库初始化:', e.message);
    }
  }

  await dbManager.init();

  app.listen(config.port, config.host, () => {
    console.log('='.repeat(50));
    console.log('  Love For YJH - Server Started');
    console.log(`  Local:   http://127.0.0.1:${config.port}`);
    console.log(`  Network: http://0.0.0.0:${config.port}`);
    console.log('='.repeat(50));
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = app;
