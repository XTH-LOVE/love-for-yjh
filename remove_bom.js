const fs = require('fs');

const filePath = 'D:/love-for-yjh/frontend/src/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Remove BOM if present
if (content.charCodeAt(0) === 0xFEFF) {
    content = content.substring(1);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('BOM removed!');
} else {
    console.log('No BOM found');
}
