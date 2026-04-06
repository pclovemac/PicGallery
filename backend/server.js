import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import config from './config.js';
import authRoutes from './routes/auth.js';
import imageRoutes from './routes/images.js';
import settingsRoutes from './routes/settings.js';
import thumbnailService from './services/thumbnailService.js';
import settingsService from './services/settingsService.js';

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/settings', settingsRoutes);

// 缩略图静态文件服务
app.use('/api/thumbnails', express.static(config.thumbnailsDir, {
  maxAge: '7d',
  immutable: true,
}));

// 生产模式：托管前端构建产物
try {
  await fs.access(config.frontendDistDir);
  app.use(express.static(config.frontendDistDir));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(config.frontendDistDir, 'index.html'));
    }
  });
  console.log('✓ 前端静态文件已托管');
} catch {
  console.log('⚠ 未发现前端构建产物，仅运行 API 模式');
}

// 启动服务
async function start() {
  await fs.mkdir(path.join(__dirname, '..', 'data'), { recursive: true });
  // 必须先加载系统设置覆盖静态 config
  await settingsService.init();

  // 确保图片目录存在
  await fs.mkdir(config.photosDir, { recursive: true });
  await fs.mkdir(config.thumbnailsDir, { recursive: true });

  console.log(`\n📂 图片目录: ${config.photosDir}`);
  console.log(`📂 缩略图目录: ${config.thumbnailsDir}`);

  // 启动时扫描并生成缩略图
  console.log('\n🔍 正在扫描图片目录...');
  await thumbnailService.scanAndGenerate();

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`\n🖼️  PicGallery 已启动`);
    console.log(`🌐 地址: http://0.0.0.0:${config.port}`);
    console.log(`👤 管理员: ${config.adminUsername}`);
    console.log('');
  });
}

start().catch(err => {
  console.error('启动失败:', err);
  process.exit(1);
});
