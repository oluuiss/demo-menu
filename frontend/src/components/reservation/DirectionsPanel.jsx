import Button from '../ui/Button.jsx';
import { ClockIcon, MapPinIcon, PhoneIcon } from '../ui/Icons.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

/** "Getting here": restaurant address, embedded map and contact (data from the backend). */
export default function DirectionsPanel({ restaurant }) {
  const { t } = useI18n();
  const { latitude: lat, longitude: lng } = restaurant;
  const d = 0.008;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d},${lat - d / 1.6},${lng + d},${lat + d / 1.6}&layer=mapnik&marker=${lat},${lng}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${restaurant.address}, ${restaurant.city}`,
  )}`;
  const tel = `tel:${restaurant.phone.replace(/[^\d+]/g, '')}`;

  return (
    <div className="directions">
      <div className="directions__map glass">
        <iframe title={restaurant.name} src={mapSrc} loading="lazy" />
      </div>
      <div className="directions__info glass panel">
        <h2>{restaurant.name}</h2>
        <ul className="directions__facts">
          <li>
            <MapPinIcon />
            <span>
              <small>{t('reserve.address')}</small>
              {restaurant.address}
              <br />
              {restaurant.city}
            </span>
          </li>
          <li>
            <PhoneIcon />
            <span>
              <small>{t('reserve.phone')}</small>
              <a href={tel}>{restaurant.phone}</a>
            </span>
          </li>
          <li>
            <ClockIcon />
            <span>
              <small>{t('reserve.hours')}</small>
              {t('reserve.hoursValue')}
            </span>
          </li>
        </ul>
        <div className="directions__actions">
          <Button href={mapsUrl} target="_blank" rel="noreferrer" icon={<MapPinIcon size={18} />}>
            {t('reserve.openMaps')}
          </Button>
          <Button href={tel} variant="glass" icon={<PhoneIcon size={18} />}>
            {t('reserve.call')}
          </Button>
        </div>
      </div>
    </div>
  );
}
