const fs = require('fs');

const filePath = 'D:/love-for-yjh/frontend/src/App.tsx';
const buffer = fs.readFileSync(filePath);

// Find line 577 (after 576 newlines)
let lineStart = 0;
let newlineCount = 0;

for (let i = 0; i < buffer.length && newlineCount < 576; i++) {
    if (buffer[i] === 0x0A) {
        newlineCount++;
        lineStart = i + 1;
    }
}

console.log('Line 577 starts at byte:', lineStart);
console.log('First 100 bytes of line 577:');
console.log(buffer.slice(lineStart, lineStart + 100).toString('hex'));
console.log('\nAs string:');
console.log(buffer.slice(lineStart, lineStart + 100).toString('utf8'));
