import fs from 'fs/promises';
import path from 'path';

/**
 * 递归读取目录下所有文件
 * @param {string} dir 绝对路径
 * @param {string} baseDir 保持相对路径的基准目录
 * @returns {Promise<string[]>} 相对于 baseDir 的文件路径数组
 */
export async function readDirRecursive(dir, baseDir = dir) {
  const files = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      // 跳过隐藏文件或缩略图文件夹
      if (entry.name.startsWith('.')) continue;

      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const subFiles = await readDirRecursive(fullPath, baseDir);
        files.push(...subFiles);
      } else {
        files.push(path.relative(baseDir, fullPath).replace(/\\/g, '/'));
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`无法读取目录 ${dir}:`, err.message);
    }
  }
  return files;
}
