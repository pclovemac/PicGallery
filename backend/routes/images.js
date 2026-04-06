import { Router } from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import config from '../config.js';
import { requireAdmin, optionalAuth } from '../middleware/auth.js';
import thumbnailService from '../services/thumbnailService.js';
import { readDirRecursive } from '../utils.js';

const router = Router();

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.photosDir),
  filename: (req, file, cb) => {
    // 保留原始文件名，但解决命名冲突
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const safeName = base.replace(/[^a-zA-Z0-9_\-\u4e00-\u9fa5]/g, '_');
    const uniqueName = `${safeName}_${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (config.supportedFormats.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`不支持的文件格式: ${ext}`));
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB per file (for video support)
  },
});

/**
 * GET /api/images
 * 获取图片列表（分页）
 */
router.get('/', optionalAuth, async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit || String(config.defaultPageSize), 10)));
    const sort = req.query.sort || 'newest'; // newest | oldest | name

    const filterType = req.query.filter || 'all'; // newest | oldest | name

    let files = await readDirRecursive(config.photosDir);

    // 过滤出支持的图片格式，并筛除屏蔽项目
    files = files.filter(f => {
      const ext = path.extname(f).toLowerCase();
      const isVideo = config.supportedVideoFormats.includes(ext);
      const isImage = config.supportedImageFormats.includes(ext);
      
      if (!isVideo && !isImage) return false;
      if (filterType === 'video' && !isVideo) return false;
      if (filterType === 'image' && !isImage) return false;
      
      // 如果是非管理员，隐藏被屏蔽的文件
      const isBlocked = config.blockedFiles && config.blockedFiles.includes(f);
      if (isBlocked && !req.isAdmin) return false;

      return true;
    });

    // 获取文件信息用于排序
    const fileInfosRaw = await Promise.all(
      files.map(async f => {
        try {
          const stats = await fs.stat(path.join(config.photosDir, f));
          return { name: f, mtime: stats.mtime.getTime(), size: stats.size };
        } catch {
          return { name: f, mtime: 0, size: 0 };
        }
      })
    );

    // 计算所有可用的年份（提取离散集合）
    const availableYearsSet = new Set();
    const availableFoldersSet = new Set();
    fileInfosRaw.forEach(f => {
      if (f.mtime > 0) {
        const year = new Date(f.mtime).getFullYear();
        if (!isNaN(year)) availableYearsSet.add(year);
      }
      
      const parts = f.name.replace(/\\/g, '/').split('/');
      if (parts.length > 1) {
        availableFoldersSet.add(parts[0]);
      }
    });
    const availableYears = Array.from(availableYearsSet).sort((a, b) => b - a);
    const availableFolders = Array.from(availableFoldersSet).sort();

    // 执行按年过滤
    const yearFilter = req.query.year;
    let fileInfos = fileInfosRaw;
    if (yearFilter && yearFilter !== 'all') {
      const targetYear = parseInt(yearFilter, 10);
      fileInfos = fileInfos.filter(f => {
        return f.mtime > 0 && new Date(f.mtime).getFullYear() === targetYear;
      });
    }

    // 执行按目录专辑过滤
    const folderFilter = req.query.folder;
    if (folderFilter && folderFilter !== 'all') {
      fileInfos = fileInfos.filter(f => {
        return f.name.replace(/\\/g, '/').startsWith(folderFilter + '/');
      });
    }

    // 排序
    switch (sort) {
      case 'oldest':
        fileInfos.sort((a, b) => a.mtime - b.mtime);
        break;
      case 'name':
        fileInfos.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        fileInfos.sort((a, b) => b.mtime - a.mtime);
        break;
    }

    const totalPages = Math.ceil(fileInfos.length / limit);
    const startIndex = (page - 1) * limit;
    const paginatedFiles = fileInfos.slice(startIndex, startIndex + limit);
    
    const total = fileInfos.length;

    let totalImagesCount = 0;
    let totalVideosCount = 0;
    fileInfos.forEach(f => {
      const ext = path.extname(f.name).toLowerCase();
      if (config.supportedVideoFormats.includes(ext)) {
        totalVideosCount++;
      } else {
        totalImagesCount++;
      }
    });

    const images = paginatedFiles.map(f => {
      const ext = path.extname(f.name).toLowerCase();
      const type = config.supportedVideoFormats.includes(ext) ? 'video' : 'image';
      const isBlocked = config.blockedFiles && config.blockedFiles.includes(f.name);
      return {
        filename: f.name,
        url: `/api/images/${encodeURIComponent(f.name)}`,
        thumbnail: `/api/thumbnails/${encodeURIComponent(path.basename(thumbnailService.getThumbnailPath(f.name)))}`,
        size: f.size,
        modified: f.mtime,
        type: type,
        blocked: isBlocked
      };
    });

    res.json({
      images,
      pagination: {
        page,
        limit,
        total: fileInfos.length,
        totalPages,
        imageCount: totalImagesCount,
        videoCount: totalVideosCount,
        availableYears,
        availableFolders
      },
    });
  } catch (err) {
    console.error('获取图片列表失败:', err);
    res.status(500).json({ error: '获取图片列表失败' });
  }
});

/**
 * GET /api/images/:filename(*)
 * 获取原图
 */
router.get('/:filename(*)', (req, res) => {
  const filename = decodeURIComponent(req.params.filename);
  const targetDir = path.resolve(config.photosDir);
  const filePath = path.resolve(config.photosDir, filename);

  // 安全检查：防止路径遍历
  if (!filePath.startsWith(targetDir)) {
    return res.status(403).json({ error: '禁止访问' });
  }

  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({ error: '图片不存在' });
    }
  });
});

/**
 * POST /api/images/upload
 * 批量上传图片（需管理员权限）
 */
router.post('/upload', requireAdmin, upload.array('photos', 50), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '没有上传文件' });
    }

    // 为上传的图片异步生成缩略图
    const results = await Promise.all(
      req.files.map(async file => {
        const thumb = await thumbnailService.generateThumbnail(file.filename);
        return {
          filename: file.filename,
          size: file.size,
          thumbnailGenerated: !!thumb,
        };
      })
    );

    res.json({
      message: `成功上传 ${results.length} 张图片`,
      files: results,
    });
  } catch (err) {
    console.error('上传失败:', err);
    res.status(500).json({ error: '上传失败' });
  }
});

/**
 * DELETE /api/images/:filename(*)
 * 删除图片
 */
router.delete('/:filename(*)', requireAdmin, async (req, res) => {
  const filename = decodeURIComponent(req.params.filename);
  const targetDir = path.resolve(config.photosDir);
  const filePath = path.resolve(config.photosDir, filename);

  // 安全检查：防止路径遍历的删除越权
  if (!filePath.startsWith(targetDir)) {
    return res.status(403).json({ error: '禁止访问' });
  }

  try {
    await fs.unlink(filePath);
    await thumbnailService.removeThumbnail(filename);
    res.json({ message: `已删除: ${filename}` });
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ error: '图片不存在' });
    }
    console.error('删除失败:', err);
    res.status(500).json({ error: '删除失败' });
  }
});

/**
 * POST /api/images/scan
 * 手动触发重新扫描（需管理员权限）
 */
router.post('/scan', requireAdmin, async (req, res) => {
  try {
    const result = await thumbnailService.scanAndGenerate();
    res.json({ message: '扫描完成', ...result });
  } catch (err) {
    console.error('扫描失败:', err);
    res.status(500).json({ error: '扫描失败' });
  }
});

export default router;
