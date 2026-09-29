import { apiRequest } from './client.js';

export const authApi = {
  login: (email, password) => apiRequest('/auth/login', { method: 'POST', body: { email, password } }),
  me: () => apiRequest('/auth/me'),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
};

export const profileApi = {
  get: () => apiRequest('/profile'),
};

export const menuApi = {
  list: ({ featured = false } = {}) => apiRequest(featured ? '/menu?featured=true' : '/menu'),
};

export const cartApi = {
  get: () => apiRequest('/cart'),
  add: (menuItemId, quantity) => apiRequest('/cart/items', { method: 'POST', body: { menuItemId, quantity } }),
  update: (menuItemId, quantity) => apiRequest(`/cart/items/${menuItemId}`, { method: 'PUT', body: { quantity } }),
  remove: (menuItemId) => apiRequest(`/cart/items/${menuItemId}`, { method: 'DELETE' }),
};

export const ordersApi = {
  checkout: (payment) => apiRequest('/orders/checkout', { method: 'POST', body: payment }),
  list: () => apiRequest('/orders'),
  get: (number) => apiRequest(`/orders/${encodeURIComponent(number)}`),
};

export const reservationsApi = {
  options: () => apiRequest('/reservations/options'),
  availability: ({ date, time, partySize }) =>
    apiRequest(`/reservations/availability?${new URLSearchParams({ date, time, partySize })}`),
  create: (reservation) => apiRequest('/reservations', { method: 'POST', body: reservation }),
  mine: () => apiRequest('/reservations/mine'),
  cancel: (code) => apiRequest(`/reservations/${encodeURIComponent(code)}`, { method: 'DELETE' }),
};
