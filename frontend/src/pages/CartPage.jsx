import { useState } from 'react';
import PageHeader from '../components/layout/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import QuantityStepper from '../components/ui/QuantityStepper.jsx';
import OrderSummary from '../components/cart/OrderSummary.jsx';
import { ArrowRightIcon, CartIcon, TrashIcon, TruckIcon } from '../components/ui/Icons.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { errorMessage } from '../api/client.js';
import './CartPage.css';

export default function CartPage() {
  const { t, formatPrice } = useI18n();
  const { cart, updateItem, removeItem } = useCart();
  const [pending, setPending] = useState(null);
  const [error, setError] = useState('');

  const run = async (menuItemId, action) => {
    setPending(menuItemId);
    setError('');
    try {
      await action();
    } catch (err) {
      setError(errorMessage(err, t));
    } finally {
      setPending(null);
    }
  };

  const empty = cart && cart.items.length === 0;
  const threshold = Number(cart?.freeDeliveryThreshold ?? 0);
  const remaining = Number(cart?.remainingForFreeDelivery ?? 0);
  const progress = threshold ? Math.min(100, ((threshold - remaining) / threshold) * 100) : 0;

  return (
    <>
      <PageHeader eyebrow={t('cart.eyebrow')} title={t('cart.title')} lead={t('cart.lead')} />
      <section className="section">
        <div className="container">
          {!cart ? (
            <div className="skeleton" style={{ height: 240 }} />
          ) : empty ? (
            <div className="state-message cart-empty">
              <CartIcon size={36} />
              <strong>{t('cart.empty')}</strong>
              {t('cart.emptyHint')}
              <div>
                <Button to="/menu">{t('cart.browse')}</Button>
              </div>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-lines glass panel">
                {error && (
                  <div className="alert alert--error" role="alert">
                    {error}
                  </div>
                )}
                <ul>
                  {cart.items.map((line) => (
                    <li key={line.menuItemId} className={`cart-line ${pending === line.menuItemId ? 'is-pending' : ''}`}>
                      <div className="cart-line__media">{line.imageUrl && <img src={line.imageUrl} alt="" />}</div>
                      <div className="cart-line__info">
                        <strong>{line.name}</strong>
                        <span className="muted">
                          {formatPrice(line.unitPrice)} {t('cart.each')}
                        </span>
                      </div>
                      <QuantityStepper
                        size="sm"
                        value={line.quantity}
                        max={cart.maxQuantityPerItem}
                        disabled={pending === line.menuItemId}
                        onChange={(q) => run(line.menuItemId, () => updateItem(line.menuItemId, q))}
                      />
                      <strong className="cart-line__total">{formatPrice(line.lineTotal)}</strong>
                      <button
                        type="button"
                        className="cart-line__remove"
                        onClick={() => run(line.menuItemId, () => removeItem(line.menuItemId))}
                        aria-label={t('cart.removeItem', { name: line.name })}
                        title={t('cart.remove')}
                      >
                        <TrashIcon size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
                <Button to="/menu" variant="ghost">
                  {t('cart.continue')}
                </Button>
              </div>

              <aside className="cart-summary glass panel">
                <h2>{t('cart.summary')}</h2>
                <div className="cart-summary__delivery">
                  <TruckIcon size={18} />
                  <span>
                    {remaining > 0
                      ? t('cart.freeDeliveryHint', { amount: formatPrice(remaining) })
                      : t('cart.freeDeliveryUnlocked')}
                  </span>
                </div>
                <div className="cart-summary__progress" aria-hidden="true">
                  <span style={{ width: `${progress}%` }} />
                </div>
                <OrderSummary subtotal={cart.subtotal} deliveryFee={cart.deliveryFee} total={cart.total} />
                <Button to="/checkout" size="lg" block icon={<ArrowRightIcon size={18} />} className="cart-summary__cta">
                  {t('cart.checkout')}
                </Button>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
