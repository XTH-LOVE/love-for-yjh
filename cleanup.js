const fs = require('fs');

const filePath = 'D:/love-for-yjh/frontend/src/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace all remaining corruption patterns
const fixes = [
    // Fix h1 title
    [/永远在一.*?💖<\/h1>/gs, "Together Forever 💖</h1>"],
    // Fix days counter
    [/在一.*?·.*?L键满屏爱心.*?💕/gs, "Together {counter.days} days · Press L for hearts 💕"],
    // Fix counter labels
    [/{ val: counter\.days, label: '[^']*'/g, "{ val: counter.days, label: 'Days'"],
    [/{ val: pad\(counter\.hours\), label: '[^']*'/g, "{ val: pad(counter.hours), label: 'Hrs'"],
    [/{ val: pad\(counter\.minutes\), label: '[^']*'/g, "{ val: pad(counter.minutes), label: 'Min'"],
    [/{ val: pad\(counter\.seconds\), label: '[^']*'/g, "{ val: pad(counter.seconds), label: 'Sec'"],
    // Fix badges
    [/className="love-badge">.*?2026.*?<\/span>/g, 'className="love-badge">2026 Memory</span>'],
    // Fix button text
    [/><div style={{ fontSize: 24 }}>[^<]*<\/div>/g, '<div style={{ fontSize: 24 }}>Upload</div>'],
    // Fix spinner hearts
    [/>�?<\/span>/g, '>💕</span>'],
    [/>上一首<\/button>/g, '><</button>'],
    [/>下一首<\/button>/g, '>></button>'],
    // Fix placeholder text
    [/placeholder="[^"]*我想对你说[^"]*"/g, 'placeholder="I want to say to you..."'],
    // Fix menu labels
    [/label: '[^']*回忆'/g, "label: 'Our Memories'"],
    [/label: '[^']*照片'/g, "label: 'Photos'"],
    // Fix various labels
    [/label: '[^']*已过'/g, "label: 'Passed'"],
    [/label: '[^']*还有'/g, "label: 'In'"],
    [/label: '[^']*今days'/g, "label: 'Today'"],
    // Fix form labels
    [/TA的信/g, "Partner info"],
    [/个性签/g, "Signature"],
    // Fix empty/placeholder values
    [/"[^"]*"| '[^']*'/g, (m) => {
        if (m.includes('\uFFFD')) {
            return m.replace(/\uFFFD/g, '');
        }
        return m;
    }],
    // Fix Chinese characters in labels
    [/\| \| '[^']*'/g, (m) => {
        if (m.includes('\uFFFD')) {
            return m.replace(/\uFFFD/g, '').replace(/''/g, "'");
        }
        return m;
    }],
];

fixes.forEach(([pattern, replacement]) => {
    try {
        if (typeof replacement === 'function') {
            content = content.replace(pattern, replacement);
        } else {
            content = content.replace(pattern, replacement);
        }
    } catch (e) {
        // Skip failed replacements
    }
});

// Final cleanup - remove all remaining replacement characters
content = content.replace(/\uFFFD/g, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Cleanup done!');
