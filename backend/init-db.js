/**
 * Railway 数据库初始化脚本
 * 如果数据库为空且存在 love.sql，则导入初始数据
 */

const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

async function initDatabase() {
  const dataDir = path.join(__dirname, 'data');
  const dbPath = path.join(dataDir, 'love.db');
  const sqlPath = path.join(dataDir, 'love.sql');

  // 检查数据库是否已存在且有数据
  if (fs.existsSync(dbPath)) {
    const stats = fs.statSync(dbPath);
    if (stats.size > 0) {
      console.log('[Init] 数据库已存在，跳过初始化');
      return;
    }
  }

  // 检查 SQL 文件是否存在
  if (!fs.existsSync(sqlPath)) {
    console.log('[Init] love.sql 不存在，跳过初始化');
    return;
  }

  console.log('[Init] 开始初始化数据库...');

  const SQL = await initSqlJs();
  const db = new SQL.Database();

  // 读取并执行 SQL
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');
  db.run(sqlContent);

  // 保存数据库
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);

  console.log(`[Init] 数据库初始化完成，已导入 ${buffer.length} 字节`);

  db.close();
}

initDatabase().catch(console.error);
