const { execSync } = require('child_process');

const gitPath = 'C:\\Program Files\\Git\\cmd\\git.exe';
const cwd = 'D:\\love-for-yjh';

try {
  console.log('1. Adding new files...');
  execSync(`"${gitPath}" add Dockerfile railway.json .dockerignore`, {
    cwd: cwd,
    encoding: 'utf8',
    stdio: 'pipe'
  });
  
  console.log('2. Committing...');
  execSync(`"${gitPath}" commit -m "Add Railway deployment config"`, {
    cwd: cwd,
    encoding: 'utf8',
    stdio: 'pipe'
  });
  
  console.log('3. Pushing to GitHub...');
  execSync(`"${gitPath}" push github main`, {
    cwd: cwd,
    encoding: 'utf8',
    stdio: 'pipe',
    timeout: 180000
  });
  
  console.log('Done! Railway should auto-deploy now.');
} catch(e) {
  console.log('STDOUT:', e.stdout);
  console.log('STDERR:', e.stderr);
}
