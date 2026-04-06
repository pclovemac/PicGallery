import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import config from '../config.js';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { readDirRecursive } from '../utils.js';

// 设置 ffmpeg 的绝对路径
ffmpeg.setFfmpegPath(ffmpegStatic);

/**
 * 缩略图服务
 * 自动为图片生成缩略图缓存
 */
class ThumbnailService {
  constructor() {
    this.processing = new Set();
  }

  /**
   * 确保缩略图目录存在
   */
  async ensureDir() {
    await fs.mkdir(config.thumbnailsDir, { recursive: true });
  }

  /**
   * 获取缩略图路径
   */
  getThumbnailPath(filename) {
    const safeName = filename.replace(/[/\\]/g, '_');
    const ext = path.extname(safeName).toLowerCase();
    const base = path.basename(safeName, ext);
    return path.join(config.thumbnailsDir, `${base}_thumb.webp`);
  }

  /**
   * 为单张图片生成缩略图
   */
  async generateThumbnail(filename) {
    const sourcePath = path.join(config.photosDir, filename);
    const thumbPath = this.getThumbnailPath(filename);

    // 如果缩略图已存在，跳过
    try {
      await fs.access(thumbPath);
      return thumbPath;
    } catch {
      // 缩略图不存在，继续生成
    }

    // 防止重复处理
    if (this.processing.has(filename)) {
      return thumbPath;
    }

    this.processing.add(filename);

    try {
      const ext = path.extname(filename).toLowerCase();
      
      if (config.supportedVideoFormats.includes(ext)) {
        // 利用 ffmpeg 提取视频第一秒的帧并管道输出至 sharp 处理
        await new Promise((resolve, reject) => {
          ffmpeg(sourcePath)
            .seekInput(1)       // 从第 1 秒截取避免全黑帧
            .frames(1)
            .format('image2pipe')
            .videoCodec('mjpeg')
            .on('error', reject)
            .pipe()
            .pipe(
              sharp()
                .rotate()
                .resize(config.thumbnailWidth, config.thumbnailHeight, {
                  fit: 'inside',
                  withoutEnlargement: true,
                })
                .webp({ quality: 80 })
            )
            .toFile(thumbPath)
            .then(resolve)
            .catch(reject);
        });
      } else {
        // 原有图片处理逻辑
        await sharp(sourcePath)
          .rotate()
          .resize(config.thumbnailWidth, config.thumbnailHeight, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 80 })
          .toFile(thumbPath);
      }

      console.log(`✓ 缩略图已生成: ${filename}`);
      return thumbPath;
    } catch (err) {
      console.error(`✗ 缩略图生成失败: ${filename}`, err.message);
      return null;
    } finally {
      this.processing.delete(filename);
    }
  }

  /**
   * 扫描图片目录，为所有图片生成缩略图
   */
  async scanAndGenerate() {
    await this.ensureDir();

    let files;
    try {
      files = await readDirRecursive(config.photosDir);
    } catch (err) {
      console.error('无法读取图片目录:', config.photosDir, err.message);
      return { total: 0, generated: 0, failed: 0 };
    }

    const imageFiles = files.filter(f => {
      const ext = path.extname(f).toLowerCase();
      return config.supportedFormats.includes(ext);
    });

    console.log(`发现 ${imageFiles.length} 张图片，开始生成缩略图...`);

    let generated = 0;
    let failed = 0;

    // 并发控制：每次处理 5 张
    const concurrency = 5;
    for (let i = 0; i < imageFiles.length; i += concurrency) {
      const batch = imageFiles.slice(i, i + concurrency);
      const results = await Promise.all(
        batch.map(f => this.generateThumbnail(f))
      );
      results.forEach(r => {
        if (r) generated++;
        else failed++;
      });
    }

    console.log(`缩略图生成完成: 共 ${imageFiles.length} 张, 成功 ${generated}, 失败 ${failed}`);
    return { total: imageFiles.length, generated, failed };
  }

  /**
   * 删除指定图片的缩略图
   */
  async removeThumbnail(filename) {
    const thumbPath = this.getThumbnailPath(filename);
    try {
      await fs.unlink(thumbPath);
    } catch {
      // 缩略图不存在，忽略
    }
  }

  /**
   * 获取文件元信息
   */
  async getImageInfo(filename) {
    const sourcePath = path.join(config.photosDir, filename);
    try {
      const stats = await fs.stat(sourcePath);
      const ext = path.extname(filename).toLowerCase();
      
      let info = {
        size: stats.size,
        modified: stats.mtime,
      };

      if (!config.supportedVideoFormats.includes(ext)) {
        // 如果是图片，获取宽高
        const metadata = await sharp(sourcePath).metadata();
        info.width = metadata.width;
        info.height = metadata.height;
        info.format = metadata.format;
      } else {
        // 视频暂时不深入抓取元数据（可通过 ffprobe 实现，如需）
        info.format = ext.replace('.', '');
      }
      
      return info;
    } catch {
      return null;
    }
  }
}

export default new ThumbnailService();
