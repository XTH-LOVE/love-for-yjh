const fs = require('fs');

const filePath = 'D:/love-for-yjh/frontend/src/App.tsx';
const buffer = fs.readFileSync(filePath);
const content = buffer.toString('utf8');
const lines = content.split('\n');

console.log('Line 577:', JSON.stringify(lines[576]));
console.log('Line 578:', JSON.stringify(lines[577]));

// Check for BOM
console.log('First char of line 1:', lines[0].charCodeAt(0));

// Check if there's a problem around line 576-577
console.log('\nContext around line 575-580:');
for (let i = 574; i < Math.min(580, lines.length); i++) {
    console.log(`${i + 1}: ${JSON.stringify(lines[i].substring(0, 100))}`);
}
