const API_BASE = '/api';

/**
 * 获取保存的管理员 token
 */
function getToken() {
  return localStorage.getItem('picgallery_token');
}

/**
 * 带认证的 fetch 封装
 */
async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, { ...options, headers });
  return res;
}

/**
 * 管理员登录
 */
export async function login(username, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '登录失败');
  localStorage.setItem('picgallery_token', data.token);
  return data;
}

/**
 * 退出登录
 */
export function logout() {
  localStorage.removeItem('picgallery_token');
}

/**
 * 验证 token 是否有效
 */
export async function verifyToken() {
  const token = getToken();
  if (!token) return false;
  try {
    const res = await authFetch(`${API_BASE}/auth/verify`);
    const data = await res.json();
    return data.valid;
  } catch {
    return false;
  }
}

/**
 * 获取图片列表
 */
export async function fetchImages(page = 1, limit = 50, sort = 'newest', filter = 'all', year = 'all', folder = 'all') {
  const res = await fetch(`${API_BASE}/images?page=${page}&limit=${limit}&sort=${sort}&filter=${filter}&year=${year}&folder=${folder}`);
  if (!res.ok) throw new Error('获取图片列表失败');
  return res.json();
}

/**
 * 上传图片
 */
export async function uploadImages(files, onProgress) {
  const formData = new FormData();
  for (const file of files) {
    formData.append('photos', file);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/images/upload`);

    const token = getToken();
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error || '上传失败'));
        } catch {
          reject(new Error('上传失败'));
        }
      }
    });

    xhr.addEventListener('error', () => reject(new Error('网络错误')));
    xhr.send(formData);
  });
}

/**
 * 删除图片
 */
export async function deleteImage(filename) {
  const res = await authFetch(`${API_BASE}/images/${encodeURIComponent(filename)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || '删除失败');
  }
  return res.json();
}

/**
 * 手动扫描
 */
export async function scanImages() {
  const res = await authFetch(`${API_BASE}/images/scan`, { method: 'POST' });
  if (!res.ok) throw new Error('扫描失败');
  return res.json();
}

/**
 * 获取系统设置
 */
export async function fetchSettings() {
  const res = await authFetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('获取设置失败');
  return res.json();
}

/**
 * 更新系统设置
 */
export async function updateSettings(settings) {
  const res = await authFetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || '更新设置失败');
  }
  return res.json();
}

/**
 * 切换屏蔽状态
 */
export async function toggleBlockFile(filename) {
  const res = await authFetch(`${API_BASE}/settings/block`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || '操作失败');
  }
  return res.json();
}
