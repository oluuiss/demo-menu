import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import MenuPage from './pages/MenuPage.jsx';
import RestaurantsPage from './pages/RestaurantsPage.jsx';
import ReservePage from './pages/ReservePage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import OrderDetailPage from './pages/OrderDetailPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

const protect = (element) => <ProtectedRoute>{element}</ProtectedRoute>;

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="restaurants" element={<RestaurantsPage />} />
        <Route path="reserve" element={<ReservePage />} />
        <Route path="cart" element={protect(<CartPage />)} />
        <Route path="checkout" element={protect(<CheckoutPage />)} />
        <Route path="orders" element={protect(<OrdersPage />)} />
        <Route path="orders/:number" element={protect(<OrderDetailPage />)} />
        <Route path="settings" element={protect(<SettingsPage />)} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Auth pages use a focused layout without the full site chrome */}
      <Route path="login" element={<LoginPage />} />
      <Route path="forgot-password" element={<ForgotPasswordPage />} />

      {/* Previous Portuguese URLs */}
      <Route path="cardapio" element={<Navigate to="/menu" replace />} />
      <Route path="restaurantes" element={<Navigate to="/restaurants" replace />} />
      <Route path="recuperar-senha" element={<Navigate to="/forgot-password" replace />} />
      <Route path="minha-conta" element={<Navigate to="/settings" replace />} />
    </Routes>
  );
}
