import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import settingsService from '../services/settingsService.js';
import thumbnailService from '../services/thumbnailService.js';

const router = Router();

/**
 * GET /api/settings
 * 获取当前设置
 */
router.get('/', requireAdmin, (req, res) => {
  res.json(settingsService.getSettings());
});

/**
 * PUT /api/settings
 * 更新当前设置
 */
router.put('/', requireAdmin, async (req, res) => {
  try {
    const oldDir = settingsService.getSettings().photosDir;
    await settingsService.updateSettings(req.body);
    
    // 如果修改了图片目录，触发一次重新打包
    if (req.body.photosDir && oldDir !== req.body.photosDir) {
      setTimeout(() => {
        thumbnailService.scanAndGenerate().catch(console.error);
      }, 500);
    }
    
    res.json({ message: '设置已更新', settings: settingsService.getSettings() });
  } catch (err) {
    console.error('更新设置失败:', err);
    res.status(500).json({ error: '更新设置失败' });
  }
});

/**
 * POST /api/settings/block
 * 屏蔽或取消屏蔽一个文件
 */
router.post('/block', requireAdmin, async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) return res.status(400).json({ error: '缺少 filename 参数' });
    
    const isBlocked = await settingsService.toggleBlockFile(filename);
    res.json({ message: isBlocked ? '已屏蔽' : '已取消屏蔽', blocked: isBlocked });
  } catch (err) {
    console.error('修改屏蔽状态失败:', err);
    res.status(500).json({ error: '操作失败' });
  }
});

export default router;
