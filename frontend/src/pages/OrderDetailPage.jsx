import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/orders/StatusBadge.jsx';
import OrderTimeline from '../components/orders/OrderTimeline.jsx';
import OrderSummary from '../components/cart/OrderSummary.jsx';
import { ArrowLeftIcon, CardIcon, CheckIcon, ClockIcon, MapPinIcon } from '../components/ui/Icons.jsx';
import { ordersApi } from '../api/endpoints.js';
import { errorMessage } from '../api/client.js';
import { useAsync } from '../hooks/useAsync.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import './OrderDetailPage.css';

const POLL_MS = 4000;

export default function OrderDetailPage() {
  const { number } = useParams();
  const location = useLocation();
  const { t, language, formatDate, formatTime, formatPrice } = useI18n();
  const order = useAsync(() => ordersApi.get(number), [number, language]);
  const [now, setNow] = useState(Date.now());

  const data = order.data;
  // Offset between the server clock and ours, so countdowns match the backend's schedule.
  const skew = data ? new Date(data.serverTime).getTime() - Date.now() : 0;
  const nextAt = data?.nextStatusAt ? new Date(data.nextStatusAt).getTime() : null;

  // Tick every second for the countdown; poll the backend while the order is still open,
  // and immediately when the next transition is due.
  useEffect(() => {
    if (!data || data.status === 'DELIVERED') return undefined;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const poll = setInterval(order.reload, POLL_MS);
    return () => {
      clearInterval(tick);
      clearInterval(poll);
    };
  }, [data, order.reload]);

  useEffect(() => {
    if (nextAt && now + skew >= nextAt + 300) order.reload();
  }, [now, nextAt, skew, order.reload]);

  if (order.status === 'loading' && !data) {
    return (
      <>
        <PageHeader eyebrow={t('orders.order')} title={number} />
        <section className="section">
          <div className="container">
            <div className="skeleton" style={{ height: 320 }} />
          </div>
        </section>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <PageHeader eyebrow={t('orders.order')} title={number} />
        <section className="section">
          <div className="container">
            <div className="state-message" role="alert">
              {errorMessage(order.error, t)}
              <div>
                <Button to="/orders" variant="glass">
                  {t('orders.backToOrders')}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  const stepIndex = data.timeline.findIndex((s) => s.state === 'CURRENT');
  const doneCount = data.status === 'DELIVERED' ? data.timeline.length : stepIndex;
  const progress = (doneCount / (data.timeline.length - 1)) * 100;
  const remainingMs = nextAt ? Math.max(0, nextAt - (now + skew)) : 0;
  const countdown = `${Math.floor(remainingMs / 60000)}:${String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, '0')}`;

  return (
    <>
      <PageHeader eyebrow={t('orders.order')} title={data.number}>
        <p className="order-detail__meta muted">
          {t('orders.placedAt', { date: `${formatDate(data.paidAt)} · ${formatTime(data.paidAt)}` })}
        </p>
      </PageHeader>
      <section className="section">
        <div className="container order-detail">
          {location.state?.justPaid && (
            <div className="alert alert--success order-detail__banner" role="status">
              <CheckIcon size={18} /> {t('orders.paidBanner')}
            </div>
          )}

          <div className="order-status glass panel">
            <div className="order-status__head">
              <div>
                <span className="eyebrow">{t('orders.status')}</span>
                <h2>{t(`orders.statuses.${data.status}`)}</h2>
                <p className="muted">{t(`orders.statusHints.${data.status}`)}</p>
              </div>
              <StatusBadge status={data.status} />
            </div>

            <div className="order-status__bar" aria-hidden="true">
              <span style={{ width: `${Math.min(100, progress)}%` }} />
            </div>

            <div className="order-status__eta">
              <ClockIcon size={16} />
              {data.status === 'DELIVERED'
                ? t('orders.deliveredAt', { time: formatTime(data.estimatedDeliveryAt) })
                : (
                  <>
                    <span>{t('orders.estimated', { time: formatTime(data.estimatedDeliveryAt) })}</span>
                    <span className="order-status__countdown">{t('orders.nextUpdate', { time: countdown })}</span>
                  </>
                )}
            </div>

            <h3 className="order-detail__subtitle">{t('orders.progress')}</h3>
            <OrderTimeline timeline={data.timeline} />
          </div>

          <aside className="order-side">
            <div className="glass panel">
              <h3 className="order-detail__subtitle">{t('orders.items')}</h3>
              <ul className="order-items">
                {data.items.map((item) => (
                  <li key={item.menuItemId}>
                    <div className="order-items__media">{item.imageUrl && <img src={item.imageUrl} alt="" />}</div>
                    <div className="order-items__info">
                      <strong>{item.name}</strong>
                      <span className="muted">
                        {t('orders.quantity')}: {item.quantity} × {formatPrice(item.unitPrice)}
                      </span>
                    </div>
                    <span className="order-items__total">{formatPrice(item.lineTotal)}</span>
                  </li>
                ))}
              </ul>
              <OrderSummary subtotal={data.subtotal} deliveryFee={data.deliveryFee} total={data.total} />
            </div>

            <div className="glass panel order-facts">
              <div>
                <MapPinIcon size={18} />
                <span>
                  <small>{t('orders.address')}</small>
                  {data.deliveryAddress}
                </span>
              </div>
              <div>
                <CardIcon size={18} />
                <span>
                  <small>{t('checkout.payment')}</small>
                  {t('orders.paidWith', { brand: data.payment.brand, last4: data.payment.last4 })}
                </span>
              </div>
            </div>

            <Button to="/orders" variant="ghost" icon={<ArrowLeftIcon size={16} />}>
              {t('orders.backToOrders')}
            </Button>
          </aside>
        </div>
      </section>
    </>
  );
}
