import { useTranslation } from '../context/LanguageContext';

export default function Sidebar({ isOpen, onClose, folder, availableFolders, onFolderChange }) {
  const { t } = useTranslation();

  return (
    <>
      {/* 跨屏移动端遮罩层 */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      ></div>

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          <ul className="folder-list">
            <li 
              className={`folder-item ${folder === 'all' ? 'active' : ''}`}
              onClick={() => onFolderChange('all')}
            >
              {t('header.allFolders')}
            </li>
            {availableFolders && availableFolders.map(f => (
              <li 
                key={f}
                className={`folder-item ${folder === f ? 'active' : ''}`}
                onClick={() => onFolderChange(f)}
              >
                {f}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}
