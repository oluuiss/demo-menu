import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FloorPlan from './FloorPlan.jsx';
import Button from '../ui/Button.jsx';
import { AlertIcon, CalendarIcon, CheckIcon, ClockIcon, PhoneIcon, UsersIcon } from '../ui/Icons.jsx';
import { reservationsApi } from '../../api/endpoints.js';
import { errorMessage } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

const LARGE = 'large';

const toIsoDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (iso, days) => {
  const [y, m, d] = iso.split('-').map(Number);
  return toIsoDate(new Date(y, m - 1, d + days));
};
const slotKey = (slot) => slot.slice(0, 5);

/** Slots still bookable on `date` (slots in the past are hidden for today). */
function slotsFor(date, options) {
  const now = new Date();
  if (date !== toIsoDate(now)) return options.timeSlots.map(slotKey);
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  return options.timeSlots.map(slotKey).filter((s) => {
    const [h, m] = s.split(':').map(Number);
    return h * 60 + m > minutesNow;
  });
}

export default function BookingPanel({ options }) {
  const { t, language, formatDate, formatTime } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const portrait = useMediaQuery('(max-width: 640px)');

  const initialDate = slotsFor(options.firstDate, options).length ? options.firstDate : addDays(options.firstDate, 1);
  const [date, setDate] = useState(initialDate);
  const slots = useMemo(() => slotsFor(date, options), [date, options]);
  const [time, setTime] = useState(() => {
    const s = slotsFor(initialDate, options);
    return s.includes('20:00') ? '20:00' : s[0];
  });
  const [party, setParty] = useState(2);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(null);
  const [mineVersion, setMineVersion] = useState(0);

  // Keep the chosen time valid when the date changes.
  useEffect(() => {
    if (!slots.includes(time)) setTime(slots[0]);
  }, [slots, time]);

  const isLarge = party === LARGE;
  const availability = useAsync(
    () => (isLarge || !time ? Promise.resolve(null) : reservationsApi.availability({ date, time, partySize: party })),
    [date, time, party, language],
  );
  const mine = useAsync(() => (user ? reservationsApi.mine() : Promise.resolve([])), [user, mineVersion]);

  useEffect(() => {
    setSelected(null);
    setError('');
  }, [date, time, party]);

  const slotLabel = (slot) => {
    const [h, m] = slot.split(':').map(Number);
    return formatTime(new Date(2000, 0, 1, h, m));
  };

  const confirm = async () => {
    if (!user) {
      navigate('/login', { state: { from: '/reserve?view=book' } });
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const result = await reservationsApi.create({ tableId: selected.id, date, time, partySize: party });
      setConfirmed(result);
      setSelected(null);
      availability.reload();
      setMineVersion((v) => v + 1);
    } catch (err) {
      setError(errorMessage(err, t));
      if (err.status === 409) {
        setSelected(null);
        availability.reload();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = async (code) => {
    try {
      await reservationsApi.cancel(code);
    } finally {
      setMineVersion((v) => v + 1);
      availability.reload();
    }
  };

  const tel = `tel:${options.restaurant.phone.replace(/[^\d+]/g, '')}`;
  const partyOptions = [...Array.from({ length: options.maxPartySize }, (_, i) => i + 1), LARGE];

  if (confirmed) {
    return (
      <div className="booking-success glass panel" role="status">
        <span className="booking-success__icon">
          <CheckIcon size={28} />
        </span>
        <h2>{t('reserve.successTitle')}</h2>
        <p>
          {t('reserve.successText', {
            table: confirmed.tableCode,
            guests: t('common.guests', { count: confirmed.partySize }),
            date: formatDate(confirmed.date, { weekday: 'long', day: 'numeric', month: 'long' }),
            time: slotLabel(confirmed.time),
          })}
        </p>
        <p className="booking-success__code">
          {t('reserve.code')}: <strong>{confirmed.code}</strong>
        </p>
        <p className="muted">
          {confirmed.restaurant.name} · {confirmed.restaurant.address}
        </p>
        <Button variant="glass" onClick={() => setConfirmed(null)}>
          {t('reserve.another')}
        </Button>
      </div>
    );
  }

  return (
    <div className="booking">
      <div className="booking__controls glass">
        <label className="booking__control">
          <span>
            <CalendarIcon size={16} /> {t('reserve.date')}
          </span>
          <input
            type="date"
            className="select booking__date"
            value={date}
            min={options.firstDate}
            max={options.lastDate}
            onChange={(e) => e.target.value && setDate(e.target.value)}
          />
        </label>
        <label className="booking__control">
          <span>
            <ClockIcon size={16} /> {t('reserve.time')}
          </span>
          <select className="select" value={time ?? ''} onChange={(e) => setTime(e.target.value)} disabled={!slots.length}>
            {slots.map((slot) => (
              <option key={slot} value={slot}>
                {slotLabel(slot)}
              </option>
            ))}
          </select>
        </label>
        <div className="booking__control booking__control--party">
          <span id="party-label">
            <UsersIcon size={16} /> {t('reserve.party')}
          </span>
          <div className="party-picker" role="radiogroup" aria-labelledby="party-label">
            {partyOptions.map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={party === value}
                className={`party-picker__btn ${party === value ? 'is-active' : ''}`}
                onClick={() => setParty(value)}
              >
                {value === LARGE ? t('reserve.largeParty') : value}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLarge ? (
        <div className="booking-large glass panel">
          <span className="booking-large__icon">
            <UsersIcon size={26} />
          </span>
          <h2>{t('reserve.largePartyTitle')}</h2>
          <p className="muted">{t('reserve.largePartyText', { max: options.maxPartySize })}</p>
          <Button href={tel} size="lg" icon={<PhoneIcon size={18} />}>
            {t('reserve.callRestaurant', { phone: options.restaurant.phone })}
          </Button>
        </div>
      ) : (
        <div className="booking__grid">
          <div className="booking__plan glass panel">
            <div className="booking__plan-head">
              <div>
                <h2>{t('reserve.floorPlan')}</h2>
                <p className="muted">{t('reserve.floorPlanHint')}</p>
              </div>
              {availability.data && (
                <span className="booking__count">
                  {t('reserve.availableCount', { count: availability.data.availableCount })}
                </span>
              )}
            </div>

            {availability.status === 'error' ? (
              <div className="alert alert--error" role="alert">
                <AlertIcon size={18} />
                {errorMessage(availability.error, t) || t('reserve.loadError')}
              </div>
            ) : availability.data ? (
              <div className={`booking__floor ${availability.status === 'loading' ? 'is-loading' : ''}`}>
                <FloorPlan
                  tables={availability.data.tables}
                  selectedId={selected?.id}
                  onSelect={setSelected}
                  portrait={portrait}
                />
              </div>
            ) : (
              <div className="skeleton" style={{ aspectRatio: portrait ? '420 / 600' : '600 / 420' }} />
            )}

            <ul className="floor-legend">
              {['AVAILABLE', 'SELECTED', 'OCCUPIED', 'UNSUITABLE'].map((state) => (
                <li key={state}>
                  <span className={`floor-legend__swatch floor-legend__swatch--${state.toLowerCase()}`} />
                  {t(`reserve.legend.${state}`)}
                </li>
              ))}
            </ul>
            {availability.data?.availableCount === 0 && <p className="booking__none">{t('reserve.noneAvailable')}</p>}
          </div>

          <aside className="booking__summary glass panel">
            <h2>{t('reserve.yourReservation')}</h2>
            <dl className="booking__facts">
              <div>
                <dt>{t('reserve.date')}</dt>
                <dd>{formatDate(date, { weekday: 'short', day: 'numeric', month: 'short' })}</dd>
              </div>
              <div>
                <dt>{t('reserve.time')}</dt>
                <dd>{time ? slotLabel(time) : '—'}</dd>
              </div>
              <div>
                <dt>{t('reserve.party')}</dt>
                <dd>{t('common.guests', { count: party })}</dd>
              </div>
              <div>
                <dt>{t('reserve.tableLabel')}</dt>
                <dd>
                  {selected ? (
                    <>
                      {selected.code} · {t('common.seats', { count: selected.seats })}
                      <small>{t(`reserve.zones.${selected.zone}`)}</small>
                    </>
                  ) : (
                    <span className="muted">{t('reserve.selectTable')}</span>
                  )}
                </dd>
              </div>
            </dl>
            {error && (
              <div className="alert alert--error" role="alert">
                <AlertIcon size={18} />
                {error}
              </div>
            )}
            <Button size="lg" block disabled={!selected} loading={submitting} onClick={confirm}>
              {submitting ? t('reserve.confirming') : user ? t('reserve.confirm') : t('reserve.loginToConfirm')}
            </Button>
          </aside>
        </div>
      )}

      {user && mine.data?.length > 0 && (
        <div className="booking-upcoming glass panel">
          <h2>{t('reserve.upcoming')}</h2>
          <ul>
            {mine.data.map((r) => (
              <li key={r.code}>
                <div>
                  <strong>
                    {formatDate(r.date, { weekday: 'short', day: 'numeric', month: 'short' })} · {slotLabel(r.time)}
                  </strong>
                  <span className="muted">
                    {t('reserve.table', { code: r.tableCode })} · {t('common.guests', { count: r.partySize })} · {r.code}
                  </span>
                </div>
                <Button variant="danger" size="sm" onClick={() => cancel(r.code)}>
                  {t('reserve.cancelReservation')}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
