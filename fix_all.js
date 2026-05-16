const fs = require('fs');

const filePath = 'D:/love-for-yjh/frontend/src/App.tsx';
const buffer = fs.readFileSync(filePath);
const content = buffer.toString('utf8');

// Find all replacement characters (U+FFFD)
const lines = content.split('\n');
let fixed = false;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('\uFFFD')) {
        console.log(`Line ${i + 1}: ${lines[i].substring(0, 80)}...`);
        
        // Replace specific patterns
        lines[i] = lines[i]
            .replace(/缐廷华/g, 'Xian Tinghua')
            .replace(/阳婧欢/g, 'Yang Jinghuan')
            .replace(/我们的爱情故事/g, 'Our Love Story')
            .replace(/LOGIN PAGE.*/g, "LOGIN PAGE - Romantic Theme")
            .replace(/HOME PAGE.*/g, "HOME PAGE - Romantic Home v3.0")
            .replace(/极致浪漫星空主题/g, '')
            .replace(/极简浪漫首页 v3.0/g, '')
            .replace(/我们已经在一.*/g, 'Together for days!')
            .replace(/我们的回忆/g, 'Our Memories')
            .replace(/上传/g, 'Upload')
            .replace(/照片/g, 'Photo')
            .replace(/视频/g, 'Video')
            .replace(/还没有/g, 'No')
            .replace(/查看全部/g, 'View all')
            .replace(/去上传/g, 'Upload')
            .replace(/发送失败/g, 'Failed')
            .replace(/请重试/g, 'Retry')
            .replace(/添加自定义样式/g, 'Add custom styles')
            .replace(/双人头像展示 - 增强版/g, 'Avatar display')
            .replace(/alt=".*"/g, 'alt="avatar"')
            .replace(/<span className="spinning-heart".*<\/span>/g, '<span className="spinning-heart"></span>')
            .replace(/TA的头像/g, 'Partner avatar')
            .replace(/合并的名字显示/g, 'Combined names')
            .replace(/永远在一起/g, 'Together Forever')
            .replace(/在一.*\/div>/g, 'Together days!</div>')
            .replace(/\\uFFFD/g, '')
            .replace(/倒计时 - 增强版/g, 'Countdown')
            .replace(/label: '.*'/g, (m) => m.includes('\uFFFD') ? m.replace(/\uFFFD/g, '') : m)
            .replace(/Days together/g, 'Days together')
            .replace(/已过/g, 'passed')
            .replace(/还有/g, 'in')
            .replace(/今days/g, 'Today')
            .replace(/2026.*纪念日/g, '2026 Memory')
            .replace(/YYYY年MM月DD日/g, 'YYYY-MM-DD')
            .replace(/编辑纪念日/g, 'Edit')
            .replace(/添加纪念日/g, 'Add')
            .replace(/Memory名称/g, 'Title')
            .replace(/Enter名称/g, 'Enter')
            .replace(/例如：我们在一起的第一天/g, 'e.g. First day together')
            .replace(/保存/g, 'Save')
            .replace(/双人头像.*v3.0/g, 'Profile v3.0')
            .replace(/使用 XMLHttpRequest 以支持进度回调/g, 'Upload with progress')
            .replace(/为每个Video生成缩略图：seek到第1 sec处/g, 'Generate video thumbnail')
            .replace(/Upload完成后刷新列表/g, 'Refresh after upload')
            .replace(/圆形进度环组件/g, 'Circular progress')
            .replace(/悬浮上传/g, 'Upload')
            .replace(/TA的信息/g, 'Partner info')
            .replace(/TA的名字/g, 'Partner name')
            .replace(/个性签名/g, 'Signature')
            .replace(/想对TA说的话/g, 'Words for partner')
            .replace(/写一句甜甜的话/g, 'Sweet words')
            .replace(/爱情数据区域 - 增强版/g, 'Love data')
            .replace(/快捷操作/g, 'Quick')
            .replace(/纪念日/g, 'Memory');
            
        fixed = true;
    }
}

if (fixed) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log('Fixed all!');
} else {
    console.log('No more fixes needed');
}
