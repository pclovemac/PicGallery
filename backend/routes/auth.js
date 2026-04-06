import { Router } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config.js';

const router = Router();

/**
 * POST /api/auth/login
 * 管理员登录
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === config.adminUsername && password === config.adminPassword) {
    const token = jwt.sign(
      { username, role: 'admin' },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
    return res.json({ token, expiresIn: config.jwtExpiresIn });
  }

  return res.status(401).json({ error: '用户名或密码错误' });
});

/**
 * GET /api/auth/verify
 * 验证当前 token 是否有效
 */
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ valid: false });
  }

  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], config.jwtSecret);
    return res.json({ valid: true, username: decoded.username });
  } catch {
    return res.json({ valid: false });
  }
});

export default router;
