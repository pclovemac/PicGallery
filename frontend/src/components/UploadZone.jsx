import { useState, useRef } from 'react';
import { uploadImages } from '../api';
import { useTranslation } from '../context/LanguageContext';

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function UploadZone({ onUploaded, onToast }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragover, setDragover] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = (fileList) => {
    const arr = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (arr.length === 0) {
      onToast('请选择图片文件', 'error');
      return;
    }
    setFiles(prev => [...prev, ...arr]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragover(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setProgress(0);
    try {
      const res = await uploadImages(files, setProgress);
      onToast(`成功上传 ${res.files.length} 张照片`, 'success');
      setFiles([]);
      setOpen(false);
      onUploaded();
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (!open) {
    return (
      <button className="upload-fab" onClick={() => setOpen(true)} title="上传图片">
        +
      </button>
    );
  }

  return (
    <div className="upload-panel">
      <div className="upload-panel-header">
        <span className="upload-panel-title">📤 上传图片</span>
        <button
          className="btn btn-icon btn-ghost"
          onClick={() => { setOpen(false); setFiles([]); }}
        >
          ✕
        </button>
      </div>

      {uploading && (
        <div className="upload-progress">
          <div className="upload-progress-bar" style={{ width: `${progress}%` }} />
        </div>
      )}

      <div
        className={`upload-dropzone ${dragover ? 'dragover' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
        onDragLeave={() => setDragover(false)}
        onDrop={handleDrop}
      >
        <div className="upload-dropzone-icon">📁</div>
        <div className="upload-dropzone-text">{t('upload.dragText')}<span style={{color: 'var(--accent)'}}>{t('upload.clickText')}</span></div>
        <div className="upload-dropzone-hint">支持 JPG、PNG、WebP、GIF、MP4 等格式</div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: 'none' }}
        />
      </div>

      {files.length > 0 && (
        <ul className="upload-file-list">
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`} className="upload-file-item">
              <span className="upload-file-name">{file.name}</span>
              <span className="upload-file-size">{formatSize(file.size)}</span>
              {!uploading && (
                <button
                  className="btn btn-icon btn-ghost"
                  style={{ width: 24, height: 24, fontSize: '0.7rem' }}
                  onClick={() => removeFile(i)}
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="upload-panel-footer">
        <button
          className="btn btn-ghost"
          onClick={() => { setOpen(false); setFiles([]); }}
          disabled={uploading}
        >
          {t('admin.cancel')}
        </button>
        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
        >
          {uploading ? t('upload.uploading', { progress }) : `+ (${files.length})`}
        </button>
      </div>
    </div>
  );
}
