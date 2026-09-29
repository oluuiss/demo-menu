import { useMemo, useState } from 'react';
import PageHeader from '../components/layout/PageHeader.jsx';
import CategoryTabs from '../components/menu/CategoryTabs.jsx';
import RestaurantCard from '../components/restaurants/RestaurantCard.jsx';
import { restaurants } from '../data/restaurants.js';
import { useI18n } from '../i18n/I18nContext.jsx';

const ALL = 'ALL';

export default function RestaurantsPage() {
  const { t } = useI18n();
  const [city, setCity] = useState(ALL);
  const options = useMemo(
    () => [
      { value: ALL, label: t('restaurants.allCities') },
      ...[...new Set(restaurants.map((r) => r.city))].map((c) => ({ value: c, label: c })),
    ],
    [t],
  );
  const visible = city === ALL ? restaurants : restaurants.filter((r) => r.city === city);

  return (
    <>
      <PageHeader eyebrow={t('restaurants.eyebrow')} title={t('restaurants.title')} lead={t('restaurants.lead')} />
      <section className="section">
        <div className="container">
          <div style={{ marginBottom: 24 }}>
            <CategoryTabs options={options} active={city} onChange={setCity} label={t('restaurants.eyebrow')} />
          </div>
          <div className="restaurant-grid">
            {visible.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
