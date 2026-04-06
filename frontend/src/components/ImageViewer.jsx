import { useState, useEffect, useCallback } from 'react';

export default function ImageViewer({ image, images, onClose, onNavigate }) {
  const [isClosing, setIsClosing] = useState(false);
  const currentIndex = images.findIndex(img => img.filename === image.filename);

  const close = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 250);
  }, [onClose]);

  const goTo = useCallback(
    (direction) => {
      const nextIndex = currentIndex + direction;
      if (nextIndex >= 0 && nextIndex < images.length) {
        onNavigate(images[nextIndex]);
      }
    },
    [currentIndex, images, onNavigate]
  );

  useEffect(() => {
    const handleKey = (e) => {
      switch (e.key) {
        case 'Escape':
          close();
          break;
        case 'ArrowLeft':
          goTo(-1);
          break;
        case 'ArrowRight':
          goTo(1);
          break;
      }
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [close, goTo]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) close();
  };

  return (
    <div
      className={`viewer-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleOverlayClick}
    >
      <button className="viewer-close" onClick={close} title="关闭 (Esc)">
        ✕
      </button>

      {currentIndex > 0 && (
        <button
          className="viewer-nav viewer-nav-prev"
          onClick={() => goTo(-1)}
          title="上一张 (←)"
        >
          ‹
        </button>
      )}

      {currentIndex < images.length - 1 && (
        <button
          className="viewer-nav viewer-nav-next"
          onClick={() => goTo(1)}
          title="下一张 (→)"
        >
          ›
        </button>
      )}

      <div className="viewer-image-container">
        {image.type === 'video' ? (
          <video 
            className="viewer-image" 
            src={image.url} 
            controls 
            autoPlay 
            onClick={(e) => e.stopPropagation()} 
          />
        ) : (
          <img className="viewer-image" src={image.url} alt={image.filename} />
        )}
      </div>

      <div className="viewer-info" title={image.filename}>
        {image.filename.split(/[/\\]/).pop()} · {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}
