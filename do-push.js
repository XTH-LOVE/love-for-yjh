const { execSync } = require('child_process');
const fs = require('fs');
const gitPath = 'C:\\Program Files\\Git\\cmd\\git.exe';
const cwd = 'D:\\love-for-yjh';

try {
  // 检查状态
  const status = execSync(`"${gitPath}" status`, {
    cwd: cwd,
    encoding: 'utf8',
    stdio: 'pipe'
  });
  console.log('Status:', status.toString());

  // 添加所有更改
  console.log('Adding changes...');
  execSync(`"${gitPath}" add -A`, {
    cwd: cwd,
    encoding: 'utf8'
  });

  // 提交
  console.log('Committing...');
  execSync(`"${gitPath}" commit -m "feat: Railway volumes配置 + 数据库初始化脚本 + 导出工具"`, {
    cwd: cwd,
    encoding: 'utf8'
  });

  // Push
  console.log('Pushing...');
  const result = execSync(`"${gitPath}" push github main`, {
    cwd: cwd,
    encoding: 'utf8',
    timeout: 180000
  });
  console.log('Success!');

} catch(e) {
  console.error('Error:', e.message);
  if (e.stdout) console.error('stdout:', e.stdout.toString());
  if (e.stderr) console.error('stderr:', e.stderr.toString());
}
