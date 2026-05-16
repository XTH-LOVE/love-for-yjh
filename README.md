# Love For YJH 💕

> 缐廷华 ❤️ 阳婧欢 - 专属爱情记录网站

## ✨ 功能特点

- 💌 情书撰写与收藏
- 📸 照片相册管理
- 🎬 视频回忆录
- 📖 日记记录
- 💕 纪念日提醒
- 🎯 愿望清单
- 🤝 情侣任务
- 📊 心情图表
- 💬 悄悄话墙
- ⏳ 时光胶囊
- 🌤️ 天气小工具
- 🎆 烟花特效
- 🌙 **深色模式**
- 📱 **PWA 支持**（可添加到桌面）
- 🖥️ **桌面应用**（Tauri）

## 🚀 快速开始

### Web 版本

```bash
cd frontend
npm install
npm start
```

### 打包为桌面应用 (Tauri)

1. 安装 Tauri CLI:
```bash
npm install -g @tauri-apps/cli
```

2. 安装 Rust (Windows 需要):
   - 下载 [Rust](https://rustup.rs/)
   - 安装时选择默认配置

3. 构建应用:
```bash
cd D:/love-for-yjh
npm install
npm run tauri build
```

桌面应用将生成在 `src-tauri/target/release/bundle/` 目录。

## 📱 PWA 安装

在浏览器中打开应用后，你可以：

1. **桌面端 (Chrome/Edge)**:
   - 点击地址栏右侧的安装图标
   - 或使用快捷键 `Ctrl + Shift + I` 打开开发者工具，找到 Application > Install

2. **移动端 (iOS/Android)**:
   - Safari: 点击分享按钮 → "添加到主屏幕"
   - Chrome: 点击菜单 → "安装应用"

## 🎨 深色模式

点击右上角的 🌙/☀️ 图标即可切换深色/浅色模式。

主题偏好会自动保存。

## 📂 项目结构

```
D:/love-for-yjh/
├── frontend/          # React 前端
│   ├── src/
│   │   ├── pages/   # 各功能页面
│   │   ├── styles/  # 全局样式
│   │   └── App.tsx  # 主应用
│   └── public/
│       ├── manifest.json    # PWA 配置
│       └── sw.js           # Service Worker
├── backend/          # Node.js 后端
│   └── src/
│       ├── controllers/  # API 控制器
│       ├── models/      # 数据模型
│       └── services/    # 业务逻辑
├── tauri.conf.json   # Tauri 配置
└── README.md         # 本文件
```

## 🛠️ 技术栈

- **前端**: React + TypeScript + Ant Design
- **后端**: Node.js + Express + SQLite
- **打包**: Vite (Web) / Tauri (桌面)
- **样式**: CSS3 + 自定义变量 + 深色模式

## 💝 致谢

- 感谢阳婧欢给我灵感和动力 💕
- 使用了浪漫的粉色渐变配色
- 包含了丰富的动画效果和交互体验

---

Made with 💖 by 缐廷华 for 阳婧欢
