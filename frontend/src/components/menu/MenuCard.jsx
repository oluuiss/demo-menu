import { useI18n } from '../../i18n/I18nContext.jsx';
import { FlameIcon, PlusIcon } from '../ui/Icons.jsx';
import './MenuCard.css';

export default function MenuCard({ item, onSelect }) {
  const { t, formatPrice } = useI18n();
  return (
    <article className="menu-card glass-lite">
      <button type="button" className="menu-card__hit" onClick={() => onSelect(item)} aria-label={t('menu.view', { name: item.name })} />
      <div className="menu-card__media">
        {item.imageUrl && (
          <img src={item.imageUrl} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} />
        )}
        <span className="menu-card__tag">{t(`categories.${item.category}`)}</span>
        {item.featured && (
          <span className="menu-card__badge menu-card__badge--media">
            <FlameIcon size={12} />
            {t('menu.featured')}
          </span>
        )}
      </div>
      <div className="menu-card__body">
        <h3 className="menu-card__title">{item.name}</h3>
        <p className="menu-card__desc">{item.description}</p>
        <div className="menu-card__footer">
          <span className="menu-card__price">{formatPrice(item.price)}</span>
          {item.featured && (
            <span className="menu-card__badge menu-card__badge--inline" title={t('menu.featured')}>
              <FlameIcon size={12} />
              <span className="menu-card__badge-text">{t('menu.featured')}</span>
            </span>
          )}
          <span className="menu-card__add" aria-hidden="true">
            <PlusIcon size={18} />
          </span>
        </div>
      </div>
    </article>
  );
}

export function MenuCardSkeleton() {
  return (
    <div className="menu-card glass-lite" aria-hidden="true">
      <div className="menu-card__media skeleton" style={{ borderRadius: 0 }} />
      <div className="menu-card__body">
        <div className="skeleton skeleton-line" style={{ width: '60%' }} />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line" style={{ width: '80%' }} />
      </div>
    </div>
  );
}
