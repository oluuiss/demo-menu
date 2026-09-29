import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import QuantityStepper from '../ui/QuantityStepper.jsx';
import { CartIcon } from '../ui/Icons.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { errorMessage } from '../../api/client.js';
import './MenuItemModal.css';

/** Item detail: photo, description, quantity and "add to cart" (the backend updates the cart). */
export default function MenuItemModal({ item, onClose }) {
  const { t, formatPrice } = useI18n();
  const { user } = useAuth();
  const { cart, addItem } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setQuantity(1);
    setError('');
  }, [item?.id]);

  if (!item) return null;

  const max = cart?.maxQuantityPerItem ?? 20;

  const handleAdd = async () => {
    if (!user) {
      navigate('/login', { state: { from: `${location.pathname}?item=${item.id}` } });
      return;
    }
    setAdding(true);
    setError('');
    try {
      await addItem(item.id, quantity);
      onClose();
      showToast({ message: t('menu.added', { name: item.name }), action: { label: t('menu.viewCart'), to: '/cart' } });
    } catch (err) {
      setError(errorMessage(err, t));
    } finally {
      setAdding(false);
    }
  };

  return (
    <Modal open onClose={onClose} labelledBy="menu-item-title" className="item-modal">
      <div className="item-modal__media">
        {item.imageUrl && <img src={item.imageUrl.replace('w=800', 'w=1200')} alt="" />}
      </div>
      <div className="item-modal__body">
        <span className="eyebrow">{t(`categories.${item.category}`)}</span>
        <h2 id="menu-item-title">{item.name}</h2>
        <p className="item-modal__desc">{item.description}</p>

        <div className="item-modal__price">
          <span className="muted">{t('menu.unitPrice')}</span>
          <strong>{formatPrice(item.price)}</strong>
        </div>

        {error && (
          <div className="alert alert--error" role="alert">
            {error}
          </div>
        )}

        <div className="item-modal__actions">
          {user && <QuantityStepper value={quantity} onChange={setQuantity} max={max} />}
          <Button size="lg" onClick={handleAdd} loading={adding} icon={<CartIcon size={18} />} className="item-modal__add">
            {!user ? t('menu.signInToOrder') : adding ? t('menu.adding') : t('menu.addToCart')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
