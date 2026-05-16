const fs = require('fs');

const filePath = 'D:/love-for-yjh/frontend/src/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Read raw bytes to see the actual content
const buffer = fs.readFileSync(filePath);
console.log('Line 610 bytes:', buffer.slice(13200, 13250));

// Find and replace specific corrupted patterns
content = content.replace(/\{ key: '\/map', icon: '[^']*', label: '[^']*' \}/, "{ key: '/map', icon: '🗺️', label: 'Map' }");
content = content.replace(/\{ key: '\/capsule', icon: '[^']*', label: '[^']*' \}/, "{ key: '/capsule', icon: '💊', label: 'Time Capsule' }");
content = content.replace(/\{ key: '\/reconcile', icon: '[^']*', label: '[^']*' \}/, "{ key: '/reconcile', icon: '💕', label: 'Reconcile' }");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed!');
