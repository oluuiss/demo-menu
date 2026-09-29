import { useSearchParams } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import DirectionsPanel from '../components/reservation/DirectionsPanel.jsx';
import BookingPanel from '../components/reservation/BookingPanel.jsx';
import { ArrowRightIcon, CalendarIcon, MapPinIcon } from '../components/ui/Icons.jsx';
import { reservationsApi } from '../api/endpoints.js';
import { errorMessage } from '../api/client.js';
import { useAsync } from '../hooks/useAsync.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import './ReservePage.css';

const VIEWS = [
  { value: 'directions', title: 'reserve.optionDirections', text: 'reserve.optionDirectionsText', Icon: MapPinIcon },
  { value: 'book', title: 'reserve.optionBook', text: 'reserve.optionBookText', Icon: CalendarIcon },
];

export default function ReservePage() {
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const view = params.get('view');
  const options = useAsync(() => reservationsApi.options(), []);

  return (
    <>
      <PageHeader eyebrow={t('reserve.eyebrow')} title={t('reserve.title')} lead={t('reserve.lead')} />
      <section className="section reserve">
        <div className="container">
          <div className="reserve__choices" role="tablist" aria-label={t('reserve.eyebrow')}>
            {VIEWS.map(({ value, title, text, Icon }) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={view === value}
                className={`reserve__choice glass ${view === value ? 'is-active' : ''} ${view && view !== value ? 'is-dimmed' : ''}`}
                onClick={() => setParams({ view: value })}
              >
                <span className="reserve__choice-icon">
                  <Icon size={24} />
                </span>
                <span className="reserve__choice-text">
                  <strong>{t(title)}</strong>
                  <span>{t(text)}</span>
                </span>
                <ArrowRightIcon size={20} className="reserve__choice-arrow" />
              </button>
            ))}
          </div>

          {view && options.status === 'error' && (
            <div className="state-message" role="alert">
              {errorMessage(options.error, t)}
              <div>
                <Button variant="glass" onClick={options.reload}>
                  {t('common.retry')}
                </Button>
              </div>
            </div>
          )}
          {view && !options.data && options.status === 'loading' && <div className="skeleton" style={{ height: 360 }} />}

          {options.data && view === 'directions' && <DirectionsPanel restaurant={options.data.restaurant} />}
          {options.data && view === 'book' && <BookingPanel options={options.data} />}
        </div>
      </section>
    </>
  );
}
