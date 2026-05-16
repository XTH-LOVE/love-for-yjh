const { execSync } = require('child_process');

const gitPath = 'C:\\Program Files\\Git\\cmd\\git.exe';
const cwd = 'D:\\love-for-yjh';

try {
  console.log('Pushing to origin main...');
  const result = execSync(`"${gitPath}" push -u origin main`, {
    cwd: cwd,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  console.log('Success:', result);
} catch(e) {
  console.log('STDOUT:', e.stdout);
  console.log('STDERR:', e.stderr);
  console.log('STATUS:', e.status);
}
