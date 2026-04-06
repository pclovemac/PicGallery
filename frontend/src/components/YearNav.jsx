import { useTranslation } from '../context/LanguageContext';

export default function YearNav({ year, availableYears, onYearChange }) {
  const { t } = useTranslation();

  if (!availableYears || availableYears.length === 0) {
    return null;
  }

  return (
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
  );
}
