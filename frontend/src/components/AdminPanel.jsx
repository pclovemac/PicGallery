import { useState, useEffect } from 'react';
import { fetchSettings, updateSettings } from '../api';
import { useTranslation } from '../context/LanguageContext';

export default function AdminPanel({ onClose, onToast, onSettingsChanged }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    photosDir: '',
    adminUsername: '',
    adminPassword: ''
  });

  const handleClearCache = async () => {
    if (!window.confirm(t('admin.confirmClearCache'))) return;
    setSaving(true);
    try {
      const { clearThumbnailCache } = await import('../api');
      const res = await clearThumbnailCache();
      onToast(res.message || 'Cache Cleared', 'success');
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await fetchSettings();
        setFormData({
          photosDir: data.photosDir || '',
          adminUsername: data.adminUsername || '',
          adminPassword: data.adminPassword || ''
        });
      } catch (err) {
        onToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, [onToast]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(formData);
      onToast(t('admin.success'), 'success');
      onSettingsChanged(formData);
      onClose();
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-card admin-settings-modal">
        <h2 className="modal-title">{t('admin.title')}</h2>
        <p className="modal-subtitle">{t('admin.subtitle')}</p>

        {loading ? (
          <div className="spinner" style={{ margin: '0 auto' }}></div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('admin.pathLabel')}</label>
              <input
                type="text"
                className="form-input"
                name="photosDir"
                value={formData.photosDir}
                onChange={e => setFormData({ ...formData, photosDir: e.target.value })}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">{t('admin.userLabel')}</label>
              <input
                type="text"
                className="form-input"
                name="adminUsername"
                value={formData.adminUsername}
                onChange={e => setFormData({ ...formData, adminUsername: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('admin.pwdLabel')}</label>
              <input
                type="password"
                className="form-input"
                name="adminPassword"
                placeholder="••••••••"
                value={formData.adminPassword}
                onChange={e => setFormData({ ...formData, adminPassword: e.target.value })}
                required
              />
            </div>
            
            <div className="form-group" style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <label className="form-label">{t('admin.dangerZone')}</label>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={handleClearCache} 
                disabled={saving}
                style={{ width: '100%' }}
              >
                🗑️ {t('admin.clearCache')}
              </button>
            </div>
            
            <div className="modal-actions" style={{ marginTop: '30px' }}>
              <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
                {t('admin.cancel')}
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? t('admin.saving') : t('admin.submit')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
