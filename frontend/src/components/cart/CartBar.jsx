import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { ArrowRightIcon, CartIcon } from '../ui/Icons.jsx';
import './CartBar.css';

/** Floating "view cart" pill shown on the menu while the cart has items (totals come from the API). */
export default function CartBar() {
  const { cart, itemCount } = useCart();
  const { t, formatPrice } = useI18n();
  if (!itemCount) return null;

  return (
    <Link to="/cart" className="cart-bar glass">
      <span className="cart-bar__icon">
        <CartIcon size={20} />
        <span className="cart-bar__count">{itemCount}</span>
      </span>
      <span className="cart-bar__label">
        {t('cart.bar')}
        <small>{t('common.items', { count: itemCount })}</small>
      </span>
      <strong className="cart-bar__total">{formatPrice(cart.total)}</strong>
      <ArrowRightIcon size={18} />
    </Link>
  );
}
