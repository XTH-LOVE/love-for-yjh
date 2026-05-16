const https = require('https');

const OWNER = 'XTH-LOVE';
const REPO = 'love-for-yjh';
const TOKEN = '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';

const files = [
  {
    path: 'Dockerfile',
    content: `FROM node:18-alpine AS builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production
COPY backend/ ./backend/
COPY --from=builder /app/frontend/build ./frontend/build
RUN mkdir -p backend/data/uploads backend/data/videos
WORKDIR /app/backend
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
EXPOSE 3000
CMD ["node", "src/server.js"]`
  },
  {
    path: 'railway.json',
    content: JSON.stringify({
      "$schema": "https://railway.com/railway.schema.json",
      "build": {
        "builder": "DOCKERFILE",
        "dockerfilePath": "Dockerfile"
      },
      "deploy": {
        "startCommand": "node src/server.js",
        "restartPolicyType": "ON_FAILURE",
        "restartPolicyMaxRetries": 10,
        "healthcheckPath": "/api/health",
        "healthcheckTimeout": 30
      }
    }, null, 2)
  },
  {
    path: '.dockerignore',
    content: `node_modules
frontend/node_modules
backend/node_modules
frontend/build
*.log
.DS_Store
.git
.gitignore
.env
.vscode
.idea
android
`
  }
];

async function getMainBranchSha() {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: 'api.github.com',
      path: `/repos/${OWNER}/${REPO}/git/ref/heads/main`,
      headers: {
        'User-Agent': 'node',
        'Authorization': `token ${TOKEN}`
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const json = JSON.parse(data);
        resolve(json.object.sha);
      });
    }).on('error', reject);
  });
}

async function createFile(filePath, content, sha) {
  const body = JSON.stringify({
    message: `Add ${filePath} for Railway deployment`,
    content: Buffer.from(content).toString('base64'),
    branch: 'main',
    sha: sha
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.github.com',
      path: `/repos/${OWNER}/${REPO}/contents/${filePath}`,
      method: 'PUT',
      headers: {
        'User-Agent': 'node',
        'Authorization': `token ${TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        console.log(`Created ${filePath}: Status ${res.statusCode}`);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          console.log('Response:', data);
          reject(new Error(`Failed: ${res.statusCode}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function getFileSha(filePath) {
  return new Promise((resolve) => {
    https.get({
      hostname: 'api.github.com',
      path: `/repos/${OWNER}/${REPO}/contents/${filePath}?ref=main`,
      headers: {
        'User-Agent': 'node',
        'Authorization': `token ${TOKEN}`
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.sha);
        } catch(e) {
          resolve(null); // file doesn't exist
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function main() {
  try {
    console.log('Getting main branch SHA...');
    const branchSha = await getMainBranchSha();
    console.log('Branch SHA:', branchSha);

    for (const file of files) {
      const existingSha = await getFileSha(file.path);
      console.log(`File ${file.path} exists: ${!!existingSha}`);
      await createFile(file.path, file.content, existingSha);
    }

    console.log('\nAll files uploaded! Railway should auto-deploy.');
  } catch(e) {
    console.error('Error:', e.message);
  }
}

main();
