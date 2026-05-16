const fs = require('fs');
const path = require('path');

const filePath = 'D:/love-for-yjh/frontend/src/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace all corrupted Chinese strings with English
const replacements = [
    [/title=\{isDark \? '[^']*' : '[^']*'\}/g, "title={isDark ? 'Light' : 'Dark'}"],
    [/\{isDark \? '[^']*☀️[^']*' : '[^']*🌙[^']*'\}/g, "{isDark ? 'Light' : 'Dark'}"],
    [/注册成功！欢迎来到我们的小世界/g, "Success! Welcome"],
    [/欢迎回来，我最爱的人/g, "Welcome back my love"],
    [/LOGIN PAGE �?极致浪漫星空主题/g, "LOGIN PAGE - Romantic Theme"],
    [/动态光�?/g, "Dynamic lights"],
    [/装饰�?/g, "Decorations"],
    [/退出登�?/g, "Logout"],
    [/HOME PAGE �?极简浪漫首页 v3.0/g, "HOME PAGE - Romantic Home v3.0"],
    [/悄悄话已送达�?/g, "Message sent"],
    [/发送失败/g, "Failed"],
    [/请重试/g, "Please retry"],
    [/const emojis = \[[^\]]*'�[^"']*'[^"']*"[^"']*\][^;]*;/g, "const emojis = ['💕', '💗', '💖', '🌸', '🌹', '🎀', '💛', '💞', '🎵'];"],
];

replacements.forEach(([pattern, replacement]) => {
    content = content.replace(pattern, replacement);
});

// Replace specific corrupted lines
content = content.replace(/'�\? : '�\?/g, "'>' : '<'");
content = content.replace(/我们的回忆/g, "Our Memories");
content = content.replace(/缐廷华/g, "Xian Tinghua");
content = content.replace(/阳婧欢/g, "Yang Jinghuan");
content = content.replace(/我们的爱情故事/g, "Our Love Story");
content = content.replace(/地图足迹/g, "Map");
content = content.replace(/时光胶囊/g, "Time Capsule");
content = content.replace(/和解/g, "Reconcile");
content = content.replace(/珍贵瞬间/g, "moments");
content = content.replace(/记录属于我们的/g, "Record our");
content = content.replace(/上传照片/g, "Upload");
content = content.replace(/第一张/g, "first");
content = content.replace(/合照/g, "photo");
content = content.replace(/让回忆永远留在这里/g, "keep memories");
content = content.replace(/还没有/g, "No");
content = content.replace(/加载中\.\.\./g, "Loading...");
content = content.replace(/换一句/g, "Change");
content = content.replace(/情话/g, "quote");
content = content.replace(/正在为你准备/g, "Preparing");
content = content.replace(/最甜蜜的/g, "sweet");
content = content.replace(/点击前往/g, "Go to");
content = content.replace(/上传/g, "Upload");
content = content.replace(/每一句话，都是真心话/g, "Sincere words");
content = content.replace(/永远相爱/g, "Forever");
content = content.replace(/上传成功/g, "Success");
content = content.replace(/已删除/g, "Deleted");
content = content.replace(/视频/g, "Video");
content = content.replace(/美好时光/g, "precious time");
content = content.replace(/YYYY年MM月DD日 HH:mm/g, "YYYY-MM-DD HH:mm");
content = content.replace(/YYYY年MM月DD日/g, "YYYY-MM-DD");
content = content.replace(/更新成功/g, "Updated");
content = content.replace(/添加成功/g, "Added");
content = content.replace(/记录每一个重要的日子/g, "Record important days");
content = content.replace(/有迹可循/g, "");
content = content.replace(/快去添加/g, "Add");
content = content.replace(/第一个重要日子/g, "first day");
content = content.replace(/编辑纪念日/g, "Edit");
content = content.replace(/添加纪念日/g, "Add");
content = content.replace(/纪念日名称/g, "Title");
content = content.replace(/请输入/g, "Enter");
content = content.replace(/名称/g, "name");
content = content.replace(/保存修改/g, "Save");
content = content.replace(/头像更新/g, "Avatar");
content = content.replace(/成功/g, "Success");
content = content.replace(/匿名/g, "Anonymous");
content = content.replace(/爱的人的名字/g, "love name");
content = content.replace(/我的昵称/g, "Nickname");
content = content.replace(/邮箱/g, "Email");
content = content.replace(/未设置/g, "Not set");
content = content.replace(/TA的名字/g, "Partner name");
content = content.replace(/在一起天数/g, "Days together");
content = content.replace(/开始日期/g, "Start date");
content = content.replace(/我爱你/g, "Love");
content = content.replace(/无数次/g, "Countless");
content = content.replace(/想你次数/g, "Miss you");
content = content.replace(/快捷操作/g, "Quick");
content = content.replace(/纪念日/g, "Memory");
content = content.replace(/天/g, "days");
content = content.replace(/时/g, "hrs");
content = content.replace(/分/g, "min");
content = content.replace(/秒/g, "sec");
content = content.replace(/我们已经在一起/g, "Together");
content = content.replace(/了！/g, "");
content = content.replace(/——/g, "-");

// Fix the sidebar menu items
content = content.replace(/\{ key: '\/photos', icon: '📸', label: '[^']*' \}/g, "{ key: '/photos', icon: '📸', label: 'Our Memories' }");
content = content.replace(/\{ key: '\/map', icon: '🗺️', label: '[^']*' \}/g, "{ key: '/map', icon: '🗺️', label: 'Map' }");
content = content.replace(/\{ key: '\/capsule', icon: '[^']*', label: '[^']*' \}/g, "{ key: '/capsule', icon: '💊', label: 'Time Capsule' }");
content = content.replace(/\{ key: '\/reconcile', icon: '💕', label: '[^']*' \}/g, "{ key: '/reconcile', icon: '💕', label: 'Reconcile' }");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed!');
