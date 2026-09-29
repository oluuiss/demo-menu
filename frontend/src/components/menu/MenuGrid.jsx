import MenuCard, { MenuCardSkeleton } from './MenuCard.jsx';
import Button from '../ui/Button.jsx';
import { errorMessage } from '../../api/client.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

/** Renders menu items with loading, error and empty states. */
export default function MenuGrid({ items, status, error, onSelect, onRetry, skeletons = 4, emptyText }) {
  const { t } = useI18n();

  if (status === 'loading') {
    return (
      <div className="menu-grid" aria-busy="true" aria-label={t('menu.loading')}>
        {Array.from({ length: skeletons }, (_, i) => (
          <MenuCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="state-message" role="alert">
        <strong>{t('menu.loadError')}</strong>
        {errorMessage(error, t)}
        {onRetry && (
          <div>
            <Button variant="glass" onClick={onRetry}>
              {t('common.retry')}
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (items.length === 0) {
    return <div className="state-message">{emptyText ?? t('menu.empty')}</div>;
  }

  return (
    <div className="menu-grid">
      {items.map((item) => (
        <MenuCard key={item.id} item={item} onSelect={onSelect} />
      ))}
    </div>
  );
}
