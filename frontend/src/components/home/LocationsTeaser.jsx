import Button from '../ui/Button.jsx';
import { restaurants } from '../../data/restaurants.js';
import { useReveal } from '../../hooks/useReveal.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './LocationsTeaser.css';

export default function LocationsTeaser() {
  const { t } = useI18n();
  const ref = useReveal();
  const cities = [...new Set(restaurants.map((r) => r.city))];

  return (
    <section className="section">
      <div className="container">
        <div className="locations-teaser glass reveal" ref={ref}>
          <div>
            <span className="eyebrow">{t('locationsTeaser.eyebrow')}</span>
            <h2>{t('locationsTeaser.title', { count: restaurants.length })}</h2>
            <p>{t('locationsTeaser.text')}</p>
            <ul className="locations-teaser__cities">
              {cities.map((city) => (
                <li key={city}>{city}</li>
              ))}
            </ul>
          </div>
          <div className="locations-teaser__actions">
            <Button size="lg" to="/restaurants">
              {t('locationsTeaser.cta')}
            </Button>
            <Button size="lg" variant="glass" to="/reserve">
              {t('nav.reserve')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
