import { useI18n } from '../../i18n/I18nContext.jsx';
import { CheckIcon, ChefIcon, HomeIcon, StoreIcon, TruckIcon } from '../ui/Icons.jsx';
import './OrderTimeline.css';

const ICONS = {
  AWAITING_CONFIRMATION: StoreIcon,
  PREPARING: ChefIcon,
  OUT_FOR_DELIVERY: TruckIcon,
  DELIVERED: HomeIcon,
};

/** Vertical timeline of the 4 order statuses, as scheduled by the backend. */
export default function OrderTimeline({ timeline }) {
  const { t, formatTime } = useI18n();

  return (
    <ol className="timeline">
      {timeline.map((step) => {
        const Icon = step.state === 'DONE' ? CheckIcon : ICONS[step.status];
        return (
          <li key={step.status} className={`timeline__step is-${step.state.toLowerCase()}`}>
            <span className="timeline__node" aria-hidden="true">
              <Icon size={18} />
            </span>
            <div className="timeline__text">
              <strong>{t(`orders.statuses.${step.status}`)}</strong>
              {step.state === 'CURRENT' && <span>{t(`orders.statusHints.${step.status}`)}</span>}
            </div>
            <time className="timeline__time" dateTime={step.startsAt}>
              {step.state === 'UPCOMING' ? '~' : ''}
              {formatTime(step.startsAt)}
            </time>
          </li>
        );
      })}
    </ol>
  );
}
