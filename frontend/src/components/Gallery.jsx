import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { toggleBlockFile } from '../api';
import { useTranslation } from '../context/LanguageContext';

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function GalleryItem({ image, onClick, onDelete, onBlockChanged, isAdmin }) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && imgRef.current) {
          imgRef.current.src = image.thumbnail;
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [image.thumbnail]);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(t('gallery.deleteConfirm', { filename: image.filename }))) {
      onDelete(image.filename);
    }
  };

  const handleBlock = async (e) => {
    e.stopPropagation();
    try {
      const { blocked } = await toggleBlockFile(image.filename);
      onBlockChanged(image.filename, blocked);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className={`gallery-item ${image.blocked ? 'blocked-item' : ''}`} onClick={() => onClick(image)}>
      <img
        ref={imgRef}
        alt={image.filename}
        className={loaded ? 'loaded' : ''}
        onLoad={() => setLoaded(true)}
        loading="lazy"
      />
      <div className="gallery-item-overlay" title={image.filename}>
        <span className="gallery-item-info">
          {image.filename.split(/[/\\]/).pop()}
          {image.size ? ` · ${formatFileSize(image.size)}` : ''}
        </span>
      </div>
      {image.type === 'video' && (
        <div className="gallery-item-video-icon">▶</div>
      )}
      {isAdmin && (
        <div className="gallery-item-actions">
          <button className="gallery-item-action-btn" onClick={handleBlock} title={image.blocked ? t('gallery.unblock') : t('gallery.block')}>
            {image.blocked ? '🙈' : '👁'}
          </button>
          <button className="gallery-item-action-btn delete-btn" onClick={handleDelete} title={t('gallery.delete')}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

function SkeletonItem() {
  const height = 150 + Math.random() * 200;
  return <div className="gallery-skeleton" style={{ height }} />;
}

export default function Gallery({ images, loading, hasMore, onLoadMore, onImageClick, onDelete, onBlockChanged }) {
  const { isAdmin } = useAuth();
  const { t } = useTranslation();
  const observerRef = useRef(null);

  const loadMoreRef = useCallback(
    (node) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && hasMore) {
          onLoadMore();
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, onLoadMore]
  );

  if (images.length === 0 && !loading) {
    return (
      <div className="gallery-empty">
        <div className="gallery-empty-icon">📂</div>
        <div className="gallery-empty-text">{t('gallery.emptyText')}</div>
        <p className="gallery-empty-hint">{t('gallery.emptyHint')}</p>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <div className="gallery-masonry">
        {images.map((image) => (
          <GalleryItem
            key={image.filename}
            image={image}
            onClick={onImageClick}
            onDelete={onDelete}
            onBlockChanged={onBlockChanged}
            isAdmin={isAdmin}
          />
        ))}
        {loading &&
          Array.from({ length: 10 }).map((_, i) => <SkeletonItem key={`skel-${i}`} />)}
      </div>
      {hasMore && (
        <div className="load-more-container">
          <div ref={loadMoreRef} className="load-more-trigger" />
          {loading && <div className="spinner" />}
        </div>
      )}
    </div>
  );
}
