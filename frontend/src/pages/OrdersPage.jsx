import { Link } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/orders/StatusBadge.jsx';
import { ArrowRightIcon, BagIcon } from '../components/ui/Icons.jsx';
import { ordersApi } from '../api/endpoints.js';
import { errorMessage } from '../api/client.js';
import { useAsync } from '../hooks/useAsync.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import './OrdersPage.css';

export default function OrdersPage() {
  const { t, language, formatDate, formatTime, formatPrice } = useI18n();
  const orders = useAsync(() => ordersApi.list(), [language]);

  return (
    <>
      <PageHeader eyebrow={t('orders.eyebrow')} title={t('orders.title')} lead={t('orders.lead')} />
      <section className="section">
        <div className="container">
          {orders.status === 'loading' && <div className="skeleton" style={{ height: 180 }} />}
          {orders.status === 'error' && (
            <div className="state-message" role="alert">
              {errorMessage(orders.error, t)}
              <div>
                <Button variant="glass" onClick={orders.reload}>
                  {t('common.retry')}
                </Button>
              </div>
            </div>
          )}
          {orders.status === 'ready' && orders.data.length === 0 && (
            <div className="state-message">
              <BagIcon size={36} style={{ margin: '0 auto 12px' }} />
              <strong>{t('orders.empty')}</strong>
              <div>
                <Button to="/menu">{t('orders.emptyCta')}</Button>
              </div>
            </div>
          )}
          {orders.status === 'ready' && orders.data.length > 0 && (
            <ul className="orders-list">
              {orders.data.map((order) => (
                <li key={order.number}>
                  <Link to={`/orders/${order.number}`} className="order-card glass-lite">
                    <div className="order-card__head">
                      <div>
                        <span className="order-card__number">
                          {t('orders.order')} {order.number}
                        </span>
                        <span className="muted order-card__date">
                          {t('orders.placedAt', {
                            date: `${formatDate(order.paidAt)} · ${formatTime(order.paidAt)}`,
                          })}
                        </span>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="order-card__items">{order.itemNames.join(' · ')}</p>
                    <div className="order-card__foot">
                      <span className="muted">{t('common.items', { count: order.itemCount })}</span>
                      <strong>{formatPrice(order.total)}</strong>
                      <span className="order-card__cta">
                        {t('orders.details')} <ArrowRightIcon size={16} />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
