const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const config = require('../config');

class DatabaseManager {
  constructor() {
    this._ready = false;
    this.db = null;
  }

  async init() {
    if (this._ready) return;

    const dbDir = path.dirname(config.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    const SQL = await initSqlJs();

    if (fs.existsSync(config.dbPath)) {
      const buffer = fs.readFileSync(config.dbPath);
      this.db = new SQL.Database(buffer);
    } else {
      this.db = new SQL.Database();
    }

    this.db.run('PRAGMA journal_mode = WAL');
    this.db.run('PRAGMA foreign_keys = ON');
    this._migrateUsersTable();
    this._initTables();
    this._initAchievements();
    this._ready = true;
    console.log('[DB] SQLite initialized via sql.js');
  }

  _migrateUsersTable() {
    try {
      // 添加 partner_name 字段（如果不存在）
      const cols = this.db.exec("PRAGMA table_info(users)");
      const colNames = cols.length > 0 ? cols[0].values.map(v => v[1]) : [];
      if (!colNames.includes('partner_name')) {
        this.db.run("ALTER TABLE users ADD COLUMN partner_name TEXT DEFAULT ''");
        console.log('[DB] Added partner_name column');
      }
      if (!colNames.includes('partner_avatar')) {
        this.db.run("ALTER TABLE users ADD COLUMN partner_avatar TEXT DEFAULT ''");
        console.log('[DB] Added partner_avatar column');
      }
    } catch (e) {
      // 忽略错误（新数据库不需要迁移）
    }
  }

  _initTables() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        email TEXT DEFAULT '',
        nickname TEXT DEFAULT '',
        avatar TEXT DEFAULT '',
        partner_name TEXT DEFAULT '',
        partner_avatar TEXT DEFAULT '',
        signature TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
      )
    `);
    this.db.run(`
      CREATE TABLE IF NOT EXISTS anniversaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL DEFAULT '',
        date TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    this.db.run(`
      CREATE TABLE IF NOT EXISTS love_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        category TEXT DEFAULT 'general',
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT DEFAULT '',
        filename TEXT NOT NULL DEFAULT '',
        mimetype TEXT DEFAULT 'image/jpeg',
        size INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS diaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        mood TEXT DEFAULT 'happy',
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS whispers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_user_id INTEGER NOT NULL,
        to_user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        icon TEXT DEFAULT '🏆',
        condition_type TEXT NOT NULL,
        condition_value INTEGER DEFAULT 1
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        achievement_id INTEGER NOT NULL,
        unlocked_at TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
        UNIQUE(user_id, achievement_id)
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        show_date TEXT DEFAULT (date('now', 'localtime')),
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS question_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        answer TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(question_id, user_id)
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS coupons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        subtitle TEXT DEFAULT '',
        color TEXT DEFAULT '#ff6b9d',
        is_used INTEGER DEFAULT 0,
        used_by INTEGER DEFAULT NULL,
        used_at TEXT DEFAULT NULL,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS wishes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        is_completed INTEGER DEFAULT 0,
        completed_at TEXT DEFAULT NULL,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL DEFAULT '',
        option_c TEXT NOT NULL DEFAULT '',
        option_d TEXT NOT NULL DEFAULT '',
        answer TEXT NOT NULL DEFAULT '',
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS quiz_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quiz_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        user_answer TEXT NOT NULL,
        is_correct INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(quiz_id, user_id)
      )
    `);

    this._seedQuestions();
    this._seedQuizzes();

    this._seedLoveNotes();
  }

  _seedQuestions() {
    const result = this.db.exec("SELECT COUNT(*) as c FROM questions");
    if (result.length > 0 && result[0].values[0][0] > 0) return;

    const questions = [
      '你最喜欢我哪个瞬间？',
      '你最想和我一起去哪里旅行？',
      '如果只能选一样，你最想和我一起做什么？',
      '你觉得我们之间最浪漫的事是什么？',
      '我做过最让你感动的事是什么？',
      '你最想对我说的一句话是什么？',
      '我们的第一次约会还记得吗？',
      '你觉得我最大的优点是什么？',
      '你最想和我一起尝试的新事物是什么？',
      '如果有时光机，你最想回到我们哪一刻？',
      '你觉得我们最合拍的地方是什么？',
      '你最期待我们未来的什么？',
      '我做的哪道菜你最想吃？',
      '你最喜欢我们一起看什么类型的电影？',
      '如果有超能力，你最想和我一起做什么？',
      '你最想带我去吃的美食是什么？',
      '你觉得我们吵架后谁先道歉？',
      '你最想收到的礼物是什么？',
      '你觉得我们在一起多久会结婚？',
      '如果下辈子还能遇见，你希望我们以什么方式认识？',
    ];

    this.db.run('BEGIN TRANSACTION');
    for (const q of questions) {
      this.db.run('INSERT INTO questions (content, is_active, show_date) VALUES (?, 1, date("now", "localtime"))', [q]);
    }
    this.db.run('COMMIT');
    console.log(`[DB] Seeded ${questions.length} daily questions`);
  }

  _seedQuizzes() {
    const result = this.db.exec("SELECT COUNT(*) as c FROM quizzes");
    if (result.length > 0 && result[0].values[0][0] > 0) return;

    const quizzes = [
      { content: '我们的纪念日是哪一天？', option_a: '1月14日', option_b: '2月14日', option_c: '1月1日', option_d: '不知道', answer: 'A' },
      { content: '我最爱的颜色是什么？', option_a: '粉色', option_b: '蓝色', option_c: '紫色', option_d: '不知道', answer: 'A' },
      { content: '我们第一次约会去了哪里？', option_a: '电影院', option_b: '餐厅', option_c: '公园', option_d: '不知道', answer: 'A' },
      { content: '我最喜欢的食物是什么？', option_a: '火锅', option_b: '烧烤', option_c: '日料', option_d: '不知道', answer: 'A' },
      { content: '我们认识多久了？', option_a: '几个月', option_b: '一年多', option_c: '好几年', option_d: '不知道', answer: 'A' },
      { content: '我最喜欢的季节是什么？', option_a: '春天', option_b: '夏天', option_c: '秋天', option_d: '不知道', answer: 'A' },
      { content: '我最常用的表情是什么？', option_a: '😊', option_b: '😍', option_c: '🥰', option_d: '不知道', answer: 'A' },
      { content: '我最喜欢的动物是什么？', option_a: '猫', option_b: '狗', option_c: '兔子', option_d: '不知道', answer: 'A' },
      { content: '我们吵架后通常谁先道歉？', option_a: '我', option_b: '你', option_c: '互相道歉', option_d: '不知道', answer: 'A' },
      { content: '我最想要什么样的周末？', option_a: '一起宅在家', option_b: '出去逛街', option_c: '户外运动', option_d: '不知道', answer: 'A' },
    ];

    this.db.run('BEGIN TRANSACTION');
    for (const q of quizzes) {
      this.db.run(
        'INSERT INTO quizzes (content, option_a, option_b, option_c, option_d, answer) VALUES (?, ?, ?, ?, ?, ?)',
        [q.content, q.option_a, q.option_b, q.option_c, q.option_d, q.answer]
      );
    }
    this.db.run('COMMIT');
    console.log(`[DB] Seeded ${quizzes.length} quiz questions`);
  }

  _seedLoveNotes() {
    const result = this.db.exec("SELECT COUNT(*) as c FROM love_notes");
    if (result.length > 0 && result[0].values[0][0] > 0) return;

    const notes = [
      { content: '阳婧欢，遇见你是我这辈子最幸运的事', category: 'love' },
      { content: '从今以后，每一个日出日落，我都想和你一起看', category: 'love' },
      { content: '你的笑容是我见过最美的风景，我愿意用一辈子去守护', category: 'love' },
      { content: '世界上最动听的三个字不是"我爱你"，而是你的名字——阳婧欢', category: 'love' },
      { content: '你是我平淡生活里的那束光，照亮了我所有的日子', category: 'love' },
      { content: '如果全世界都对你恶意相加，我就对你说上一世情话', category: 'romantic' },
      { content: '我想和你一起，从晨光微露走到星光漫天', category: 'romantic' },
      { content: '你是我写过最美的情诗，不需要任何修饰，你就是最好的', category: 'romantic' },
      { content: '余生很长，我只想牵着你的手慢慢走', category: 'future' },
      { content: '每天醒来第一件事就是想你，睡前最后一件事也是想你', category: 'love' },
      { content: '你是我藏在心底最深处的秘密，也是我最想炫耀的骄傲', category: 'love' },
      { content: '想和你一起做饭、散步、看电影，平凡的日子因为有你而闪耀', category: 'future' },
      { content: '不管未来有多远，只要有你在身边，我就什么都不怕', category: 'future' },
      { content: '阳婧欢，你就是我今生最大的幸福和骄傲', category: 'love' },
      { content: '如果有一天我老了，我也想牵着你的手，慢慢走', category: 'future' },
      { content: '喜欢你这件事，是我做过最持久的决定', category: 'love' },
      { content: '你的眼睛里住着星星，每次看你我都会忍不住微笑', category: 'romantic' },
      { content: '我愿意把全世界最好的都给你，因为你值得', category: 'love' },
      { content: '无论刮风下雨，我都会在你身边，永远不离不弃', category: 'promise' },
      { content: '这辈子最浪漫的事，就是和你一起慢慢变老', category: 'future' },
      { content: '你的声音是我听过最好听的音乐，百听不厌', category: 'romantic' },
      { content: '阳婧欢，我爱的不只是今天的你，而是每一天的你', category: 'love' },
      { content: '你让我相信，这个世界上真的有一见钟情和命中注定', category: 'romantic' },
      { content: '我想给你所有的温柔，因为你值得世间一切美好', category: 'love' },
      { content: '和你在一起的每一秒，都是我人生中最珍贵的时刻', category: 'love' },
    ];

    this.db.run('BEGIN TRANSACTION');
    for (const note of notes) {
      this.db.run('INSERT INTO love_notes (content, category) VALUES (?, ?)', [note.content, note.category]);
    }
    this.db.run('COMMIT');
    console.log(`[DB] Seeded ${notes.length} love notes`);
  }

  _initAchievements() {
    const result = this.db.exec("SELECT COUNT(*) as c FROM achievements");
    if (result.length > 0 && result[0].values[0][0] > 0) return;

    const achievements = [
      // 第一次
      { key: 'first_diary', title: '第一篇日记', description: '写下了第一篇爱情日记', icon: '📝', condition_type: 'first', condition_value: 1 },
      { key: 'first_whisper', title: '悄悄话首发', description: '发出第一条悄悄话', icon: '💌', condition_type: 'first', condition_value: 1 },
      { key: 'first_photo', title: '定格瞬间', description: '上传第一张照片', icon: '📷', condition_type: 'first', condition_value: 1 },
      // 日记相关
      { key: 'diary_7', title: '连续记录者', description: '写满7篇日记', icon: '📔', condition_type: 'diary_count', condition_value: 7 },
      { key: 'diary_30', title: '日记达人', description: '写满30篇日记', icon: '📓', condition_type: 'diary_count', condition_value: 30 },
      // 悄悄话相关
      { key: 'whisper_10', title: '倾诉小能手', description: '发出10条悄悄话', icon: '💭', condition_type: 'whisper_sent', condition_value: 10 },
      // 照片相关
      { key: 'photo_10', title: '回忆收藏家', description: '上传10张照片', icon: '🖼️', condition_type: 'photo_count', condition_value: 10 },
      { key: 'photo_50', title: '时光相册', description: '上传50张照片', icon: '🎞️', condition_type: 'photo_count', condition_value: 50 },
      // 纪念日
      { key: 'anniversary_5', title: '铭记时刻', description: '添加5个纪念日', icon: '📅', condition_type: 'anniversary_count', condition_value: 5 },
      // 在一起天数
      { key: 'days_100', title: '百日甜恋', description: '在一起满100天', icon: '💯', condition_type: 'days_together', condition_value: 100 },
      { key: 'days_365', title: '一周年', description: '在一起满365天', icon: '🎉', condition_type: 'days_together', condition_value: 365 },
    ];

    this.db.run('BEGIN TRANSACTION');
    for (const a of achievements) {
      this.db.run(
        'INSERT INTO achievements (key, title, description, icon, condition_type, condition_value) VALUES (?, ?, ?, ?, ?, ?)',
        [a.key, a.title, a.description, a.icon, a.condition_type, a.condition_value]
      );
    }
    this.db.run('COMMIT');
    console.log(`[DB] Seeded ${achievements.length} achievements`);
  }

  /** Save database to file */
  save() {
    const data = this.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(config.dbPath, buffer);
  }

  getDb() {
    return this.db;
  }

  close() {
    if (this.db) {
      this.save();
      this.db.close();
      this._ready = false;
    }
  }
}

module.exports = new DatabaseManager();
