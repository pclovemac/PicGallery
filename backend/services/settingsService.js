import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

class SettingsService {
  constructor() {
    this.settings = {
      photosDir: config.photosDir,
      adminUsername: config.adminUsername,
      adminPassword: config.adminPassword,
      blockedFiles: []
    };
  }

  async init() {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      const data = await fs.readFile(SETTINGS_FILE, 'utf8');
      const loaded = JSON.parse(data);
      this.settings = { ...this.settings, ...loaded };
      this.applyToConfig();
    } catch (err) {
      if (err.code === 'ENOENT') {
        await this.save(); // initial creation
      } else {
        console.error('加载设置失败:', err);
      }
    }
  }

  applyToConfig() {
    config.photosDir = this.settings.photosDir;
    config.adminUsername = this.settings.adminUsername;
    config.adminPassword = this.settings.adminPassword;
    config.blockedFiles = this.settings.blockedFiles || [];
  }

  getSettings() {
    return this.settings;
  }

  async updateSettings(updates) {
    if (updates.photosDir !== undefined) this.settings.photosDir = updates.photosDir;
    if (updates.adminUsername !== undefined) this.settings.adminUsername = updates.adminUsername;
    if (updates.adminPassword !== undefined) this.settings.adminPassword = updates.adminPassword;
    
    this.applyToConfig();
    await this.save();
  }

  async toggleBlockFile(filename) {
    if (!this.settings.blockedFiles) this.settings.blockedFiles = [];
    const index = this.settings.blockedFiles.indexOf(filename);
    
    let isBlocked = false;
    if (index > -1) {
      this.settings.blockedFiles.splice(index, 1);
    } else {
      this.settings.blockedFiles.push(filename);
      isBlocked = true;
    }
    
    this.applyToConfig();
    await this.save();
    return isBlocked;
  }

  async save() {
    try {
      await fs.writeFile(SETTINGS_FILE, JSON.stringify(this.settings, null, 2), 'utf8');
    } catch (err) {
      console.error('保存设置失败:', err);
    }
  }
}

export default new SettingsService();
