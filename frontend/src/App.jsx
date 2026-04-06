import { useState, useCallback, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useTranslation } from './context/LanguageContext';
import Header from './components/Header';
import Gallery from './components/Gallery';
import ImageViewer from './components/ImageViewer';
import LoginModal from './components/LoginModal';
import AdminPanel from './components/AdminPanel';
import UploadZone from './components/UploadZone';
import Sidebar from './components/Sidebar';
import YearNav from './components/YearNav';
import { fetchImages, deleteImage } from './api';

function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`toast toast-${t.type} ${t.removing ? 'removing' : ''}`}
          onAnimationEnd={() => t.removing && onRemove(t.id)}
        >
          <span>{t.type === 'success' ? '✅' : '❌'}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

function AppContent() {
  const { isAdmin, login } = useAuth();
  const { t } = useTranslation();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalImages, setTotalImages] = useState(0);
  const [totalVideos, setTotalVideos] = useState(0);
  const [sort, setSort] = useState('newest');
  const [filter, setFilter] = useState('all');
  const [year, setYear] = useState('all');
  const [availableYears, setAvailableYears] = useState([]);
  const [folder, setFolder] = useState('all');
  const [availableFolders, setAvailableFolders] = useState([]);
  const [viewerImage, setViewerImage] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const addToast = useCallback((message, type = 'success') => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type, removing: false }]);
    setTimeout(() => {
      setToasts(prev =>
        prev.map(t => (t.id === id ? { ...t, removing: true } : t))
      );
    }, 3000);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3300);
  }, []);

  const loadImages = useCallback(async (pageNum, sortOrder, filterType, yearFilter, folderFilter, append = false) => {
    setLoading(true);
    try {
      const data = await fetchImages(pageNum, 50, sortOrder, filterType, yearFilter, folderFilter);
      setImages(prev => append ? [...prev, ...data.images] : data.images);
      setTotalPages(data.pagination.totalPages);
      setTotalImages(data.pagination.imageCount);
      setTotalVideos(data.pagination.videoCount);
      setAvailableYears(data.pagination.availableYears || []);
      setAvailableFolders(data.pagination.availableFolders || []);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    setPage(1);
    loadImages(1, sort, filter, year, folder, false);
  }, [sort, filter, year, folder, loadImages]);

  const handleLoadMore = useCallback(() => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadImages(nextPage, sort, filter, year, folder, true);
    }
  }, [page, totalPages, sort, filter, year, folder, loadImages]);

  const handleSortChange = useCallback((newSort) => {
    setSort(newSort);
  }, []);

  const handleDelete = useCallback(async (filename) => {
    try {
      await deleteImage(filename);
      setImages(prev => prev.filter(img => img.filename !== filename));
      setTotalImages(prev => prev - 1);
      addToast(t('app.deleted', { filename }), 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  }, [addToast, t]);

  const handleBlockChanged = useCallback((filename, blocked) => {
    setImages(prev => prev.map(img => img.filename === filename ? { ...img, blocked } : img));
  }, []);

  const handleUploaded = useCallback(() => {
    setPage(1);
    loadImages(1, sort, filter, year, folder, false);
  }, [sort, filter, year, folder, loadImages]);

  const handleRefresh = useCallback(() => {
    setPage(1);
    loadImages(1, sort, filter, year, folder, false);
  }, [sort, filter, year, folder, loadImages]);

  return (
    <div className="app-container">
      <Header
        totalImages={totalImages}
        totalVideos={totalVideos}
        sort={sort}
        filter={filter}
        onSortChange={setSort}
        onFilterChange={setFilter}
        onSettingsClick={() => setShowAdminPanel(true)}
        onLoginClick={() => setShowLogin(true)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onRefresh={handleRefresh}
      />

      <div className="main-layout">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          folder={folder}
          availableFolders={availableFolders}
          onFolderChange={(newFolder) => {
            setFolder(newFolder);
            if (window.innerWidth <= 768) {
              setSidebarOpen(false);
            }
          }}
        />

        <main className="gallery-content">
          <YearNav 
            year={year} 
            availableYears={availableYears} 
            onYearChange={setYear} 
          />
          <Gallery
            images={images}
            loading={loading}
            hasMore={page < totalPages}
            onLoadMore={handleLoadMore}
            onImageClick={setViewerImage}
            onDelete={handleDelete}
            onBlockChanged={handleBlockChanged}
          />
        </main>
      </div>

      {viewerImage && (
        <ImageViewer
          image={viewerImage}
          images={images}
          onClose={() => setViewerImage(null)}
          onNavigate={setViewerImage}
        />
      )}

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLogin={login}
        />
      )}

      {showAdminPanel && (
        <AdminPanel
          onClose={() => setShowAdminPanel(false)}
          onToast={addToast}
          onSettingsChanged={handleUploaded}
        />
      )}

      {isAdmin && (
        <UploadZone onUploaded={handleUploaded} onToast={addToast} />
      )}

      <ToastContainer
        toasts={toasts}
        onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
