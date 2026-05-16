const fs = require('fs');

const filePath = 'D:/love-for-yjh/frontend/src/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix menu items
content = content.replace(
    /\{ key: '\/photos', icon: '📸', label: '[^']*' \}/g,
    "{ key: '/photos', icon: '📸', label: 'Our Memories' }"
);
content = content.replace(
    /\{ key: '\/map', icon: '[^']*', label: '[^']*' \}/g,
    "{ key: '/map', icon: '🗺️', label: 'Map' }"
);
content = content.replace(
    /\{ key: '\/capsule', icon: '[^']*', label: '[^']*' \}/g,
    "{ key: '/capsule', icon: '💊', label: 'Time Capsule' }"
);
content = content.replace(
    /\{ key: '\/reconcile', icon: '💕', label: '[^']*' \}/g,
    "{ key: '/reconcile', icon: '💕', label: 'Reconcile' }"
);

// Fix other labels
content = content.replace(/label: '爱的主页'/g, "label: 'Home'");
content = content.replace(/label: '甜蜜hrs光'/g, "label: 'Sweet Time'");
content = content.replace(/label: '记录hrs光'/g, "label: 'Record'");
content = content.replace(/label: '爱的影集'/g, "label: 'Videos'");
content = content.replace(/label: '趣味hrs光'/g, "label: 'Fun Time'");
content = content.replace(/label: '记忆乐园'/g, "label: 'Memory'");
content = content.replace(/label: '悄悄话墙'/g, "label: 'Messages'");
content = content.replace(/label: '愿望清单'/g, "label: 'Wishlist'");
content = content.replace(/label: '情侣任务'/g, "label: 'Tasks'");
content = content.replace(/label: '个人中心'/g, "label: 'Profile'");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed menu items!');
