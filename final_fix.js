const fs = require('fs');

const filePath = 'D:/love-for-yjh/frontend/src/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace all remaining issues
const replacements = [
    // Line 367
    [/LOGIN PAGE.*浪漫星空主题/, "LOGIN PAGE - Romantic Theme"],
    // Line 384
    [/注册Success！欢迎来到我们的小世.*💕/, "Success! Welcome 💕"],
    [/\欢迎回来，.*最爱的.*💖/, "Welcome back my love 💖"],
    // Line 449
    [/Yang Jinghuan.*永远爱.*/g, "Yang Jinghuan, I love you forever"],
    // Line 633, 635, 731
    [/缐廷华/g, "Xian Tinghua"],
    [/阳婧欢/g, "Yang Jinghuan"],
    [/我们的爱情故事/g, "Our Love Story"],
    // Line 803
    [/HOME PAGE.*极简浪漫首页 v3.0/, "HOME PAGE - Romantic Home v3.0"],
    // Line 883
    [/发送失败/g, "Failed"],
    // Line 886
    [/"Failed，请重试"/g, '"Retry"'],
    // Comments
    [/\/\/ 添加自定义样式/, "// Add custom styles"],
    [/\/\/ 双人头像展示 - 增强版/, "// Avatar display"],
    [/\/\/ TA的头像/, "// Partner avatar"],
    [/\/\/ 合并的名字显示/, "// Combined names"],
    [/\/\/ 倒计时 - 增强版/, "// Countdown"],
    [/\/\/ Memory提示/, "// Memory tips"],
    [/\/\/ 照片墙/, "// Photo wall"],
    [/\/\/ 悬浮悄悄话按钮/, "// Floating message button"],
    [/\/\/ 悄悄话弹窗/, "// Message popup"],
    [/\/\/ 为每个Video生成缩略图：seek到第1 sec处/, "// Generate video thumbnail"],
    [/\/\/ 使用 XMLHttpRequest 以支持进度回调/, "// Upload with progress"],
    [/\/\/ Upload完成后刷新列表/, "// Refresh after upload"],
    [/\/\/ Upload进度/, "// Upload progress"],
    [/\/\/ Video缩略图区/, "// Video thumbnail"],
    [/\/\/ 圆形进度环组件/, "// Circular progress"],
    [/\/\/ 悬浮上传/, "// Floating upload"],
    [/\/\/ TA的信息/, "// Partner info"],
    [/\/\/ 个性签名/, "// Signature"],
    [/\/\/ 爱情数据区域 - 增强版/, "// Love data"],
    // Line 1018
    [/alt="�?/g, 'alt="avatar"'],
    // Line 1033, 1034
    [/<span className="spinning-heart".*<\/span>/g, '<span className="spinning-heart"></span>'],
    // Line 1061, 1063
    [/\|\| '缐廷华'\]/g, "|| 'Xian Tinghua']"],
    [/\|\| '阳婧欢'\)/g, "|| 'Yang Jinghuan')"],
    // Line 1066
    [/永远在一.*/g, "Together Forever"],
    // Line 1068
    [/在一.*days.*L键满屏爱心.*/g, "Together {counter.days} days · Press L for hearts"],
    // Line 1074
    [/我们已经在一.*/g, "Together for {daysTogether} days!"],
    // Line 1077-1080
    [/{ val: counter\.days, label: '[^']*', glow: true }/g, "{ val: counter.days, label: 'Days', glow: true }"],
    [/{ val: pad\(counter\.hours\), label: '[^']*', glow: false }/g, "{ val: pad(counter.hours), label: 'Hrs', glow: false }"],
    [/{ val: pad\(counter\.minutes\), label: '[^']*', glow: false }/g, "{ val: pad(counter.minutes), label: 'Min', glow: false }"],
    [/{ val: pad\(counter\.seconds\), label: '[^']*', glow: true }/g, "{ val: pad(counter.seconds), label: 'Sec', glow: true }"],
    // Line 1092
    [/2026.*纪念日/g, "2026 Memory"],
    // Line 1127
    [/'Preparingsweet情话\.\.\.'/g, "'Preparing sweet words...'"],
    // Line 1133
    [/'🔄 加载中\.\.\.' : '🔀 Change情话'}/g, "'🔄 Loading...' : '🔀 Change quote'}"],
    // Line 1143
    [/>我们的回忆<\/span>/g, ">Our Memories</span>"],
    // Line 1149
    [/'查看全部 →' : '去上传 ↗'}/g, "'View all →' : 'Upload ↗'}"],
    // Line 1171
    [/>No回忆<\/div>/g, ">No Memories</div>"],
    // Line 1172
    [/Go to「Our Memories」上传照片/g, "Go to 'Our Memories' to upload"],
    // Line 1216
    [/写下你想.*TA 说的.*/g, "Write something to your love"],
    // Line 1220
    [/placeholder="我想对你说.*\.\."/g, 'placeholder="I want to say to you..."'],
    // Line 1271
    [/const emojis = \[[^\]]+\]/g, "const emojis = ['💕', '💗', '💖', '🌸', '🌹', '🎀', '💛', '💞', '🎵'];"],
    // Line 1278
    [/Sincere words · 缐廷华💕 阳婧欢<\/p>/g, "Sincere words · For YJH 💕</p>"],
    // Line 1332
    [/—— 缐廷华💕 阳婧欢，Forever/g, "- Xian Tinghua 💕 Yang Jinghuan, Forever"],
    // Line 1335, 1337
    [/>上一首<\/button>/g, "><</button>"],
    [/>下一首<\/button>/g, ">></button>"],
    // Line 1395
    [/'🎉 照片UploadSuccess'/g, "'🎉 Photo Uploaded!'"],
    // Line 1418
    [/无论Success与否.*文件可能已Upload/g, "Refresh after upload"],
    // Line 1426, 1644, 1835
    [/'💨 已删除！'/g, "'💨 Deleted!'"],
    // Line 1442
    [/📸 我们的回忆<\/h2>/g, "📸 Our Memories</h2>"],
    // Line 1444
    [/已收藏.*张珍贵瞬间/g, "precious moments"],
    [/记录属于我们的每一个瞬间/g, "Record our precious moments"],
    // Line 1455
    [/'上传中\.\.\.' : '\+ 上传照片'}/g, "'Uploading...' : '+ Upload Photo'}"],
    // Line 1463
    [/>还没有照片<\/h3>/g, ">No Photos Yet</h3>"],
    // Line 1464
    [/上传你们的第一张合照.*/g, "Upload your first photo together"],
    // Line 1519, 1521
    [/><\/button>/g, "><</button>"],
    // Line 1533
    [/VIDEOS PAGE.*爱的影集/, "VIDEOS PAGE - Love Videos"],
    // Line 1597, 1607
    [/'🎬 VideoUploadSuccess'/g, "'🎬 Video Uploaded!'"],
    // Line 1637
    [/无论Success与否.*文件可能已Upload/g, "Refresh after upload"],
    // Line 1664
    [/珍藏.*段珍贵Video/g, "precious videos"],
    [/记录属于我们的珍贵视频/g, "Record our precious videos"],
    // Line 1676
    [/\`Upload.*\$\{uploadProgress\}/g, "`Uploading ${uploadProgress}%"],
    // Line 1704
    [/>还没有视频<\/h3>/g, ">No Videos Yet</h3>"],
    // Line 1705
    [/上传你们的第一段Video.*/g, "Upload your first video together"],
    // Line 1744
    [/我们的视频/g, "Our Video"],
    // Line 1750
    [/确定删除这段Video/g, "Confirm delete this video"],
    // Line 1782
    [/💕 我们的美好时光/g, "💕 Our Precious Time"],
    // Line 1784
    [/YYYY年MM月DD日 HH:mm/g, "YYYY-MM-DD HH:mm"],
    // Line 1820
    [/'✅ 更新成功'/g, "'✅ Updated'"],
    // Line 1823
    [/'🎉 添加成功！'/g, "'🎉 Added!'"],
    // Line 1849
    [/记录每一个重要的日子，让爱有迹可循/g, "Record every important day"],
    // Line 1856
    [/添加纪念日/g, "Add Memory"],
    // Line 1861
    [/🗓️<\/div>/g, "🗓️</div>"],
    // Line 1863
    [/Add你们的first day吧.*/g, "Add your first memory!"],
    // Line 1865
    [/>添加第一个Memory/g, ">Add First Memory"],
    // Line 1901
    [/YYYY年MM月DD日/g, "YYYY-MM-DD"],
    // Line 1904, 1905
    [/>已过 \{days\}.*<\/span>/g, ">Passed {days} days</span>"],
    [/>还有 \{daysUntil\}.*<\/span>/g, ">In {daysUntil} days</span>"],
    // Line 1906
    [/今days.*<\/span>/g, "Today!</span>"],
    // Line 1916
    [/\? '✏️ 编辑纪念日' : '🎁 添加纪念日'/g, "? '✏️ Edit' : '🎁 Add Memory'"],
    // Line 1923
    [/Memory名称/g, "Title"],
    [/Enter名称/g, "Enter"],
    // Line 1924
    [/例如：我们在一起的第一天💕/g, "e.g. First day together 💕"],
    // Line 1931
    [/'保存 →' : '添加纪念日 🎉'}/g, "'Save →' : 'Add Memory 🎉'}"],
    // Line 1941
    [/双人头像.*v3\.0/g, "Profile v3.0"],
    // Line 1968
    [/'💖 保存Success'/g, "'💖 Saved!'"],
    // Line 2004
    [/'💖 头像Updated'/g, "'💖 Avatar Updated!'"],
    // Line 2069
    [/加载中\.\.\./g, "Loading..."],
    // Line 2077
    [/\/\/ 自定义样式/g, "// Custom styles"],
    // Line 2138
    [/\/\/ 圆形进度环组件/g, "// Circular progress"],
    // Line 2191, 2253
    [/\{\/\* 悬浮上传 \*\/\}/g, "{/* Floating upload */}"],
    // Line 2195, 2257
    [/div style=\{\{ fontSize: 24 \}\}>�?<\/div>/g, 'div style={{ fontSize: 24 }}>Upload</div>'],
    // Line 2209
    [/>👤 �?<\/div>/g, "><👤 Anonymous</div>"],
    // Line 2224, 2313, 2354
    [/\{\/\* TA的头像 \*\/\}/g, "{/* Partner avatar */}"],
    [/\{\/\* TA的信息 \*\/\}/g, "{/* Partner info */}"],
    // Line 2240
    [/alt="TA的头像"/g, 'alt="Partner avatar"'],
    // Line 2315, 2356
    [/💜 TA的信息<\/div>/g, "💜 Partner Info</div>"],
    // Line 2316, 2360
    [/TA的名字/g, "Partner name"],
    // Line 2317
    [/你爱的人的名字/g, "Your love name"],
    // Line 2321, 2366
    [/\{\/\* 个性签名 \*\/\}/g, "{/* Signature */}"],
    [/\{\/\* 个性签名的显示 \*\/\}/g, "{/* Signature */}"],
    // Line 2323, 2369
    [/💜 个性签名<\/div>/g, "💜 Signature</div>"],
    // Line 2324
    [/想对TA说的话/g, "Words for partner"],
    // Line 2325
    [/写一句甜甜的话/g, "Sweet words"],
    // Line 2341, 2342
    [/'未设置'/g, "'Not set'"],
    // Line 2379
    [/\{\/\* 爱情数据区域 - 增强版 \*\/\}/g, "{/* Love data */}"],
    // Line 2384
    [/在一起days天数/g, "Days together"],
    // Line 2385
    [/开始days日期/g, "Start date"],
    // Line 2386
    [/我爱你/g, "Love"],
    [/'无数次'/g, "'Countless'"],
    // Line 2388
    [/'�?, label: 'Miss you', value: '[^']*' }/g, "'💭', label: 'Miss you', value: 'N/A' }"],
    // Line 2409
    [/>💫 快捷操作<\/h3>/g, ">💫 Quick Actions</h3>"],
    // Line 2453
    [/>纪念日<\/div>/g, ">Memory</div>"],
];

replacements.forEach(([pattern, replacement]) => {
    try {
        content = content.replace(pattern, replacement);
    } catch (e) {
        console.log(`Error with pattern: ${pattern}`);
    }
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done!');
