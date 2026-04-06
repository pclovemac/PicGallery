import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  port: parseInt(process.env.PORT || '3000', 10),

  // 图片存储目录 - 部署时通过环境变量指向 NAS 挂载路径
  // 例如: PHOTOS_DIR=/mnt/nas/photos
  photosDir: process.env.PHOTOS_DIR || path.join(__dirname, '..', 'photos'),

  // 缩略图缓存目录
  thumbnailsDir: process.env.THUMBNAILS_DIR || path.join(__dirname, '..', '.thumbnails'),

  // 缩略图尺寸
  thumbnailWidth: parseInt(process.env.THUMB_WIDTH || '400', 10),
  thumbnailHeight: parseInt(process.env.THUMB_HEIGHT || '400', 10),

  // JWT 配置
  jwtSecret: process.env.JWT_SECRET || 'picgallery_secret_key_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // 管理员凭证
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',

  // 屏蔽列表，由 settingsService 动态注入
  blockedFiles: [],

  // 支持的图片格式 (保留向后兼容)
  supportedFormats: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif', '.avif', '.heic', '.heif', '.mp4', '.webm', '.mov', '.mkv', '.avi'],

  // 特定类型分组，用于快速类型判断
  supportedVideoFormats: ['.mp4', '.webm', '.mov', '.mkv', '.avi'],
  supportedImageFormats: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif', '.avif', '.heic', '.heif'],

  // 分页
  defaultPageSize: parseInt(process.env.PAGE_SIZE || '50', 10),

  // 前端构建产物目录（生产模式下由 Express 静态托管）
  frontendDistDir: path.join(__dirname, '..', 'frontend', 'dist'),
};

export default config;
