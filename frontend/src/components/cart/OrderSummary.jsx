import { useI18n } from '../../i18n/I18nContext.jsx';
import './OrderSummary.css';

/** Subtotal / delivery / total block. Values always come from the backend. */
export default function OrderSummary({ subtotal, deliveryFee, total, children }) {
  const { t, formatPrice } = useI18n();
  const free = Number(deliveryFee) === 0;
  return (
    <dl className="order-summary">
      <div>
        <dt>{t('cart.subtotal')}</dt>
        <dd>{formatPrice(subtotal)}</dd>
      </div>
      <div>
        <dt>{t('cart.delivery')}</dt>
        <dd className={free ? 'order-summary__free' : ''}>{free ? t('cart.free') : formatPrice(deliveryFee)}</dd>
      </div>
      {children}
      <div className="order-summary__total">
        <dt>{t('cart.total')}</dt>
        <dd>{formatPrice(total)}</dd>
      </div>
    </dl>
  );
}
