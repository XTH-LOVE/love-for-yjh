const fs = require('fs');

const filePath = 'D:/love-for-yjh/frontend/src/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix missing newlines - specifically line 577 and 578
// "useState<any>(null);" should be followed by a newline before the empty line
content = content.replace(
    /useState<any>\(null\);\s+const \{ isDark/g,
    'useState<any>(null);\n\n  const { isDark'
);

// Also fix any other potential issues
content = content.replace(
    /setUser\(JSON\.parse\(saved\)\);\s+const \{ isDark/g,
    'setUser(JSON.parse(saved));\n    \n    const { isDark'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed!');
