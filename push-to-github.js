const { execSync } = require('child_process');

const gitPath = 'C:\\Program Files\\Git\\cmd\\git.exe';
const cwd = 'D:\\love-for-yjh';

try {
  // 添加所有修改的文件
  console.log('Adding files...');
  execSync(`"${gitPath}" add -A`, {
    cwd: cwd,
    encoding: 'utf8',
    stdio: 'pipe'
  });

  // 检查是否有更改
  const status = execSync(`"${gitPath}" status --porcelain`, {
    cwd: cwd,
    encoding: 'utf8',
    stdio: 'pipe'
  });

  if (!status.stdout.trim()) {
    console.log('没有文件更改，跳过提交');
  } else {
    // 提交
    console.log('Committing...');
    execSync(`"${gitPath}" commit -m "feat: 添加数据库导出和Railway初始化支持"`, {
      cwd: cwd,
      encoding: 'utf8',
      stdio: 'pipe'
    });
  }

  // 添加 GitHub remote
  console.log('Setting up GitHub remote...');
  try {
    execSync(`"${gitPath}" remote add github https://XTH-LOVE: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@github.com/XTH-LOVE/love-for-yjh.git`, {
      cwd: cwd,
      encoding: 'utf8',
      stdio: 'pipe'
    });
  } catch(e) {
    console.log('Remote might already exist, trying set-url...');
    execSync(`"${gitPath}" remote set-url github https://XTH-LOVE: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@github.com/XTH-LOVE/love-for-yjh.git`, {
      cwd: cwd,
      encoding: 'utf8',
      stdio: 'pipe'
    });
  }

  // Push to GitHub
  console.log('Pushing to GitHub...');
  const result = execSync(`"${gitPath}" push -u github main`, {
    cwd: cwd,
    encoding: 'utf8',
    stdio: 'pipe',
    timeout: 180000
  });
  console.log('Success!', result);
} catch(e) {
  console.log('STDOUT:', e.stdout);
  console.log('STDERR:', e.stderr);
  console.log('STATUS:', e.status);
}
