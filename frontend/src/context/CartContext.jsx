import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cartApi } from '../api/endpoints.js';
import { useAuth } from './AuthContext.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';

const CartContext = createContext(null);

/**
 * Mirrors the server-side cart. Every change goes through the API and the UI renders the
 * cart (lines, subtotal, delivery fee, total) exactly as the backend calculated it.
 */
export function CartProvider({ children }) {
  const { user } = useAuth();
  const { language } = useI18n();
  const [cart, setCart] = useState(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setCart(null);
      return null;
    }
    const data = await cartApi.get();
    setCart(data);
    return data;
  }, [user]);

  // Reload on login/logout and when the language changes (item names are localized by the API).
  useEffect(() => {
    refresh().catch(() => setCart(null));
  }, [refresh, language]);

  const apply = useCallback(async (request) => {
    const data = await request;
    setCart(data);
    return data;
  }, []);

  const value = useMemo(
    () => ({
      cart,
      itemCount: cart?.itemCount ?? 0,
      refresh,
      addItem: (menuItemId, quantity) => apply(cartApi.add(menuItemId, quantity)),
      updateItem: (menuItemId, quantity) => apply(cartApi.update(menuItemId, quantity)),
      removeItem: (menuItemId) => apply(cartApi.remove(menuItemId)),
    }),
    [cart, refresh, apply],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
