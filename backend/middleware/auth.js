import jwt from 'jsonwebtoken';
import config from '../config.js';

/**
 * JWT 认证中间件
 * 保护需要管理员权限的路由
 */
export function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未授权：请先登录' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: '权限不足' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: '令牌无效或已过期' });
  }
}

/**
 * 可选认证中间件
 * 解析权限但不强制拦截
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  req.isAdmin = false;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      if (decoded.role === 'admin') {
        req.isAdmin = true;
      }
    } catch {
      // 忽略过期或无效
    }
  }
  next();
};
