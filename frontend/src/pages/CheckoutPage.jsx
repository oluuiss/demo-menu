import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import TextField from '../components/ui/TextField.jsx';
import OrderSummary from '../components/cart/OrderSummary.jsx';
import { AlertIcon, ArrowLeftIcon, LockIcon, MapPinIcon, ShieldIcon } from '../components/ui/Icons.jsx';
import { ordersApi } from '../api/endpoints.js';
import { errorMessage } from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import './CheckoutPage.css';

// Published test numbers for the mock gateway (see MockPaymentService on the backend).
const TEST_CARDS = [
  { number: '4242 4242 4242 4242', result: 'testApproved' },
  { number: '5555 5555 5555 4444', result: 'testApproved' },
  { number: '4000 0000 0000 0002', result: 'testDeclined' },
];

// Input masks only (formatting); validation and the charge itself happen on the backend.
const formatCardNumber = (v) => v.replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
const formatExpiry = (v) => {
  const digits = v.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};
const brandHint = (number) => {
  const d = number.replace(/\D/g, '');
  if (d.startsWith('4')) return 'VISA';
  if (/^(5[1-5]|2[2-7])/.test(d)) return 'MASTERCARD';
  if (/^3[47]/.test(d)) return 'AMEX';
  return '';
};

export default function CheckoutPage() {
  const { t, formatPrice } = useI18n();
  const { cart, refresh } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ cardholderName: '', cardNumber: '', expiry: '', cvv: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [processing, setProcessing] = useState(false);

  if (cart && cart.items.length === 0 && !processing) return <Navigate to="/cart" replace />;

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
    if (formError) setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setFormError('');
    setErrors({});
    try {
      // Small pause so the "processing" state is perceivable, like a real gateway round-trip.
      const [order] = await Promise.all([ordersApi.checkout(form), new Promise((r) => setTimeout(r, 900))]);
      await refresh();
      navigate(`/orders/${order.number}`, { replace: true, state: { justPaid: true } });
    } catch (err) {
      setErrors(err.fields ?? {});
      setFormError(errorMessage(err, t));
      setProcessing(false);
    }
  };

  const brand = brandHint(form.cardNumber);

  return (
    <>
      <PageHeader eyebrow={t('checkout.eyebrow')} title={t('checkout.title')} lead={t('checkout.lead')} />
      <section className="section">
        <div className="container checkout-layout">
          <form className="checkout-form glass panel" onSubmit={handleSubmit} noValidate>
            <fieldset disabled={processing}>
              <h2>
                <MapPinIcon size={20} /> {t('checkout.delivery')}
              </h2>
              <div className="checkout-address">
                <span className="muted">{t('checkout.deliveryTo')}</span>
                <strong>{cart?.deliveryAddress ?? '—'}</strong>
                <small>{t('checkout.deliveryNote')}</small>
              </div>

              <h2>
                <LockIcon size={20} /> {t('checkout.payment')}
              </h2>

              <div className={`card-preview ${brand ? `card-preview--${brand.toLowerCase()}` : ''}`} aria-hidden="true">
                <div className="card-preview__chip" />
                <span className="card-preview__brand">{brand}</span>
                <span className="card-preview__number">{form.cardNumber || '•••• •••• •••• ••••'}</span>
                <div className="card-preview__row">
                  <span>{form.cardholderName.toUpperCase() || t('checkout.cardPreviewName')}</span>
                  <span>{form.expiry || t('checkout.expiryPlaceholder')}</span>
                </div>
              </div>

              {formError && (
                <div className="alert alert--error" role="alert">
                  <AlertIcon size={18} />
                  {formError}
                </div>
              )}

              <div className="checkout-fields">
                <TextField
                  label={t('checkout.cardholder')}
                  placeholder={t('checkout.cardholderPlaceholder')}
                  autoComplete="cc-name"
                  value={form.cardholderName}
                  onChange={(e) => set('cardholderName', e.target.value)}
                  error={errors.cardholderName}
                  className="checkout-fields__full"
                />
                <TextField
                  label={t('checkout.cardNumber')}
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="0000 0000 0000 0000"
                  value={form.cardNumber}
                  onChange={(e) => set('cardNumber', formatCardNumber(e.target.value))}
                  error={errors.cardNumber}
                  className="checkout-fields__full"
                />
                <TextField
                  label={t('checkout.expiry')}
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder={t('checkout.expiryPlaceholder')}
                  value={form.expiry}
                  onChange={(e) => set('expiry', formatExpiry(e.target.value))}
                  error={errors.expiry}
                />
                <TextField
                  label={t('checkout.cvv')}
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="123"
                  value={form.cvv}
                  onChange={(e) => set('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                  error={errors.cvv}
                />
              </div>

              <div className="test-cards">
                <span>{t('checkout.testCards')}</span>
                {TEST_CARDS.map((card) => (
                  <button
                    key={card.number}
                    type="button"
                    className={`test-cards__card ${card.result === 'testDeclined' ? 'is-declined' : ''}`}
                    onClick={() => {
                      setForm((f) => ({
                        cardholderName: f.cardholderName || 'Luis Porto',
                        cardNumber: card.number,
                        expiry: f.expiry || '12/30',
                        cvv: f.cvv || '123',
                      }));
                      setErrors({});
                      setFormError('');
                    }}
                  >
                    <code>{card.number}</code>
                    <small>{t(`checkout.${card.result}`)}</small>
                  </button>
                ))}
              </div>

              <Button type="submit" size="lg" block loading={processing} className="checkout-pay">
                {processing ? t('checkout.processing') : t('checkout.pay', { amount: cart ? formatPrice(cart.total) : '' })}
              </Button>
              <p className="checkout-secure">
                <ShieldIcon size={16} /> {t('checkout.secure')}
              </p>
            </fieldset>
          </form>

          <aside className="checkout-summary glass panel">
            <h2>{t('checkout.summary')}</h2>
            {cart && (
              <>
                <ul className="checkout-items">
                  {cart.items.map((line) => (
                    <li key={line.menuItemId}>
                      <span className="checkout-items__qty">{line.quantity}×</span>
                      <span className="checkout-items__name">{line.name}</span>
                      <span>{formatPrice(line.lineTotal)}</span>
                    </li>
                  ))}
                </ul>
                <OrderSummary subtotal={cart.subtotal} deliveryFee={cart.deliveryFee} total={cart.total} />
              </>
            )}
            <Button to="/cart" variant="ghost" icon={<ArrowLeftIcon size={16} />} className="checkout-back">
              {t('checkout.backToCart')}
            </Button>
          </aside>
        </div>
      </section>
      {processing && (
        <div className="checkout-overlay" role="status">
          <div className="checkout-overlay__card glass">
            <span className="checkout-overlay__spinner" />
            {t('checkout.processing')}
          </div>
        </div>
      )}
    </>
  );
}

