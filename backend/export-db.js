/**
 * 导出数据库为 SQL 文件
 * 运行: node export-db.js
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

async function exportDatabase() {
  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, 'data', 'love.db');
  const outputPath = path.join(__dirname, 'data', 'love.sql');

  // 读取数据库
  const dbBuffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(dbBuffer);

  // 获取所有表
  const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");

  let sqlContent = '-- Love For YJH Database Export\n';
  sqlContent += `-- Export Date: ${new Date().toISOString()}\n\n`;

  for (const tableResult of tables) {
    const tableName = tableResult.values[0][0];
    if (tableName === 'sqlite_sequence') continue;

    // 获取建表语句
    const createSQL = db.exec(`SELECT sql FROM sqlite_master WHERE name='${tableName}'`);
    if (createSQL.length > 0) {
      sqlContent += createSQL[0].values[0][0] + ';\n\n';
    }

    // 获取所有数据
    const data = db.exec(`SELECT * FROM ${tableName}`);
    if (data.length > 0) {
      const columns = data[0].columns;
      for (const row of data[0].values) {
        const values = row.map(v => {
          if (v === null) return 'NULL';
          if (typeof v === 'number') return v;
          if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
          return `'${String(v).replace(/'/g, "''")}'`;
        });
        sqlContent += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
      }
      sqlContent += '\n';
    }
  }

  fs.writeFileSync(outputPath, sqlContent, 'utf8');
  console.log(`✅ 数据库已导出到: ${outputPath}`);
  console.log(`   文件大小: ${fs.statSync(outputPath).size} 字节`);
}

exportDatabase().catch(console.error);
