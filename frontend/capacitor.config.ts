import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.loveyjh.app',
  appName: 'Love For YJH',
  webDir: 'build',
  server: {
    // Android 配置
    androidScheme: 'https',
    // 设置允许的后端域名（替换为你的实际后端地址）
    allowedHosts: ['example.com', '*.trycloudflare.com'],
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;