import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const translations = {
  zh: {
    // Header
    "header.photos": "张照片",
    "header.videos": "个视频",
    "header.all": "全部",
    "header.imageOnly": "照片",
    "header.videoOnly": "视频",
    "header.sortNewest": "最新",
    "header.sortOldest": "最早",
    "header.sortName": "名称排序",
    "header.allYears": "全部年份",
    "header.allFolders": "全部分类",
    "header.refresh": "重新检索",
    "header.adminMode": "🔓 管理中",
    "header.settings": "⚙️ 设置",
    
    // Gallery
    "gallery.deleteConfirm": "确定要删除 {filename} 吗？",
    "gallery.unblock": "取消屏蔽预览",
    "gallery.block": "仅管理员可见",
    "gallery.delete": "彻底删除",
    "gallery.emptyText": "这儿什么也没有...",
    "gallery.emptyHint": "看起来您还没有上传任何照片或视频，去下面上传一些属于您的回忆记录吧！",

    // Admin Panel
    "admin.title": "⚙️ 系统设置",
    "admin.subtitle": "照片存放路径与管理员凭证",
    "admin.pathLabel": "NAS 挂载目录 (绝对路径)",
    "admin.userLabel": "管理员登录账号",
    "admin.pwdLabel": "管理员登录密码",
    "admin.pwdPlaceholder": "默认值 admin123",
    "admin.cancel": "取消",
    "admin.submit": "提交修改",
    "admin.saving": "保存中...",
    "admin.success": "设置保存成功",

    // App Toasts & messages
    "app.deleted": "已删除 {filename}",
    "app.uploaded": "上传成功",

    // Login Modal
    "login.title": "管理员身份验证",
    "login.username": "账号",
    "login.usernamePlaceholder": "请输入管理员账号",
    "login.password": "密码",
    "login.passwordPlaceholder": "请输入管理密码",
    "login.cancel": "取消",
    "login.submit": "🔐 登录",
    "login.loggingIn": "验证中...",
    
    // Upload Zone
    "upload.dragText": "拖拽图片 / 视频到这里，或",
    "upload.clickText": "点击选择",
    "upload.uploading": "正在上传... {progress}%",
  },
  en: {
    // Header
    "header.photos": "Photos",
    "header.videos": "Videos",
    "header.all": "All",
    "header.imageOnly": "Photos",
    "header.videoOnly": "Videos",
    "header.sortNewest": "Newest",
    "header.sortOldest": "Oldest",
    "header.sortName": "Sort Name",
    "header.allYears": "All Years",
    "header.allFolders": "All Albums",
    "header.refresh": "Rescan",
    "header.adminMode": "🔓 Mgmt Mode",
    "header.settings": "⚙️ Settings",
    
    // Gallery
    "gallery.deleteConfirm": "Are you sure you want to delete {filename}?",
    "gallery.unblock": "Unblock Preview",
    "gallery.block": "Admin Only (Hide)",
    "gallery.delete": "Permanently Delete",
    "gallery.emptyText": "Nothing to see here...",
    "gallery.emptyHint": "Looks like you haven't uploaded any photos or videos yet. Upload something below to save your memories!",

    // Admin Panel
    "admin.title": "⚙️ System Settings",
    "admin.subtitle": "Photo storage path & Admin Credentials",
    "admin.pathLabel": "NAS Mount Directory (Absolute Path)",
    "admin.userLabel": "Admin Username",
    "admin.pwdLabel": "Admin Password",
    "admin.pwdPlaceholder": "Default: admin123",
    "admin.cancel": "Cancel",
    "admin.submit": "Submit Changes",
    "admin.saving": "Saving...",
    "admin.success": "Settings saved successfully",

    // App Toasts & messages
    "app.deleted": "Deleted {filename}",
    "app.uploaded": "Uploaded successfully",

    // Login Modal
    "login.title": "Admin Authentication",
    "login.username": "Username",
    "login.usernamePlaceholder": "Enter admin username",
    "login.password": "Password",
    "login.passwordPlaceholder": "Enter admin password",
    "login.cancel": "Cancel",
    "login.submit": "🔐 Login",
    "login.loggingIn": "Verifying...",
    
    // Upload Zone
    "upload.dragText": "Drag photos / videos here, or ",
    "upload.clickText": "browse",
    "upload.uploading": "Uploading... {progress}%",
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('picgallery_lang') || 'zh';
  });

  useEffect(() => {
    localStorage.setItem('picgallery_lang', language);
  }, [language]);

  const t = useCallback((key, params = {}) => {
    let str = translations[language][key] || translations['en'][key] || key;
    Object.keys(params).forEach(k => {
      str = str.replace(`{${k}}`, params[k]);
    });
    return str;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
