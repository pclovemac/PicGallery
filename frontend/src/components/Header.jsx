import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';

export default function Header({ totalImages, totalVideos, sort, filter, year, availableYears, onSortChange, onFilterChange, onYearChange, onSettingsClick, onLoginClick, onToggleSidebar, onRefresh }) {
  const { isAdmin, logout } = useAuth();
  const { t, language, setLanguage } = useTranslation();

  return (
    <>
      <header className="header">
        <div className="header-brand">
        <button className="btn-icon hamburger-btn" onClick={onToggleSidebar} aria-label="Toggle Sidebar">
          ☰
        </button>
        <span className="header-logo">🖼️</span>
        <h1 className="header-title">PicGallery</h1>
        {(totalImages > 0 || totalVideos > 0) && (
          <span className="header-stats">
            {totalImages > 0 && `${totalImages} ${t('header.photos')} `}
            {totalVideos > 0 && `${totalVideos} ${t('header.videos')}`}
          </span>
        )}
      </div>

      <div className="header-controls">
        <div className="sort-controls">
          <button
            className={`sort-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => onFilterChange('all')}
          >
            {t('header.all')}
          </button>
          <button
            className={`sort-btn ${filter === 'image' ? 'active' : ''}`}
            onClick={() => onFilterChange('image')}
          >
            {t('header.imageOnly')}
          </button>
          <button
            className={`sort-btn ${filter === 'video' ? 'active' : ''}`}
            onClick={() => onFilterChange('video')}
          >
            {t('header.videoOnly')}
          </button>
        </div>



        <div className="sort-controls">
          <button
            className={`sort-btn ${sort === 'newest' ? 'active' : ''}`}
            onClick={() => onSortChange('newest')}
          >
            {t('header.sortNewest')}
          </button>
          <button
            className={`sort-btn ${sort === 'oldest' ? 'active' : ''}`}
            onClick={() => onSortChange('oldest')}
          >
            {t('header.sortOldest')}
          </button>
          <button
            className={`sort-btn ${sort === 'name' ? 'active' : ''}`}
            onClick={() => onSortChange('name')}
          >
            {t('header.sortName')}
          </button>
        </div>

        {isAdmin ? (
          <>
            <button className="btn btn-ghost" onClick={onRefresh} title={t('header.refresh')}>
              🔄 {t('header.refresh')}
            </button>
            <button className="btn btn-ghost" onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')} title="Toggle Language">
              🌐 {language === 'zh' ? 'En' : '中'}
            </button>
            <button className="btn btn-ghost" onClick={onSettingsClick} title={t('header.settings')}>
              {t('header.settings')}
            </button>
            <button className="btn btn-ghost" onClick={logout} title={t('header.adminMode')}>
              {t('header.adminMode')}
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-icon btn-ghost" onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')} title="Toggle Language">
              🌐
            </button>
            <button
              className="btn btn-icon btn-ghost"
              onClick={onLoginClick}
              title="Login"
            >
              🔒
            </button>
          </>
        )}
      </div>
      </header>

      {/* 二级菜单：年份导航栏 */}
      {availableYears && availableYears.length > 0 && (
        <div className="sub-header">
          <div className="year-menu">
            <button
              className={`sort-btn ${year === 'all' ? 'active' : ''}`}
              onClick={() => onYearChange('all')}
            >
              {t('header.allYears')}
            </button>
            {availableYears.map(y => (
              <button
                key={y}
                className={`sort-btn ${year == y ? 'active' : ''}`}
                onClick={() => onYearChange(y.toString())}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
