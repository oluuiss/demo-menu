import { useI18n } from '../../i18n/I18nContext.jsx';
import './StatusBadge.css';

export default function StatusBadge({ status }) {
  const { t } = useI18n();
  return (
    <span className={`status-badge status-badge--${status.toLowerCase()}`}>
      <span className="status-badge__dot" aria-hidden="true" />
      {t(`orders.statuses.${status}`)}
    </span>
  );
}
