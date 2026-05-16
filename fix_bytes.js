const fs = require('fs');

const filePath = 'D:/love-for-yjh/frontend/src/App.tsx';
const buffer = fs.readFileSync(filePath);
const content = buffer.toString('utf8');

// Find all replacement characters (U+FFFD = 0xEF 0xBF 0xBD)
const lines = content.split('\n');
let fixed = false;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('\uFFFD')) {
        console.log(`Line ${i + 1} has replacement char: ${lines[i]}`);
        // Replace the whole line with English version
        if (lines[i].includes('/map')) {
            lines[i] = "    { key: '/map', icon: '🗺️', label: 'Map' },";
            fixed = true;
        }
        if (lines[i].includes('/capsule')) {
            lines[i] = "    { key: '/capsule', icon: '💊', label: 'Time Capsule' },";
            fixed = true;
        }
        if (lines[i].includes('/reconcile')) {
            lines[i] = "    { key: '/reconcile', icon: '💕', label: 'Reconcile' },";
            fixed = true;
        }
    }
}

if (fixed) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log('Fixed!');
} else {
    console.log('No fixes needed');
}
