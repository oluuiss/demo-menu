import { useI18n } from '../../i18n/I18nContext.jsx';
import { ArrowRightIcon, ClockIcon, MapPinIcon } from '../ui/Icons.jsx';
import './RestaurantCard.css';

export default function RestaurantCard({ restaurant }) {
  const { t, formatTime } = useI18n();
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${restaurant.address}, ${restaurant.city} - ${restaurant.state}`,
  )}`;
  const time = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return formatTime(new Date(2000, 0, 1, h, m));
  };

  return (
    <article className="restaurant-card glass-lite">
      <span className="restaurant-card__city">
        {restaurant.city} · {restaurant.state}
      </span>
      <h3>{restaurant.name}</h3>
      <p className="restaurant-card__line">
        <MapPinIcon size={16} /> {restaurant.address}
      </p>
      <p className="restaurant-card__line muted">
        <ClockIcon size={16} />
        {t(`restaurants.hours.${restaurant.hours.days}`, {
          open: time(restaurant.hours.open),
          close: time(restaurant.hours.close),
        })}
      </p>
      <ul className="restaurant-card__features">
        {restaurant.features.map((feature) => (
          <li key={feature}>{t(`restaurants.features.${feature}`)}</li>
        ))}
      </ul>
      <a className="restaurant-card__link" href={mapsUrl} target="_blank" rel="noreferrer">
        {t('restaurants.directions')} <ArrowRightIcon size={16} />
      </a>
    </article>
  );
}
