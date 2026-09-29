import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Logo from '../ui/Logo.jsx';
import Button from '../ui/Button.jsx';
import { CartIcon } from '../ui/Icons.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import ProfileMenu from './ProfileMenu.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './Header.css';

const NAV_LINKS = [
  { to: '/', key: 'nav.home', end: true },
  { to: '/menu', key: 'nav.menu' },
  { to: '/restaurants', key: 'nav.restaurants' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { t } = useI18n();
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the drawer on navigation, lock body scroll while open, close on Escape.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const cartButton = user && (
    <Link to="/cart" className="header__icon-btn" aria-label={`${t('nav.cart')} (${itemCount})`}>
      <CartIcon size={20} />
      {itemCount > 0 && (
        <span key={itemCount} className="header__badge">
          {itemCount}
        </span>
      )}
    </Link>
  );

  return (
    <header className={`header ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <a className="header__skip" href="#conteudo">
        {t('nav.skip')}
      </a>

      <div className="header__bar glass">
        <Logo />

        <nav className="header__nav" aria-label={t('nav.main')}>
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className="header__link">
              {t(link.key)}
            </NavLink>
          ))}
        </nav>

        <div className="header__actions">
          <div className="header__desktop-only">
            <LanguageSwitcher />
          </div>
          {cartButton}
          <Button to="/reserve" size="sm" className="header__desktop-only">
            {t('nav.reserve')}
          </Button>
          {user ? (
            <ProfileMenu />
          ) : (
            <Button to="/login" variant="glass" size="sm" className="header__signin">
              {t('nav.signIn')}
            </Button>
          )}
          <button
            type="button"
            className={`header__burger ${open ? 'is-open' : ''}`}
            aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={open}
            aria-controls="mobile-drawer"
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile / tablet drawer (sibling of the blurred bar so it can blur the page itself) */}
      <div id="mobile-drawer" className={`drawer glass ${open ? 'is-open' : ''}`} aria-hidden={!open} inert={!open}>
        <nav className="drawer__links" aria-label={t('nav.main')}>
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className="drawer__link">
              {t(link.key)}
            </NavLink>
          ))}
          {user && (
            <>
              <NavLink to="/orders" className="drawer__link">
                {t('nav.myOrders')}
              </NavLink>
              <NavLink to="/settings" className="drawer__link">
                {t('nav.settings')}
              </NavLink>
            </>
          )}
        </nav>
        <div className="drawer__section">
          <span className="drawer__label">{t('lang.label')}</span>
          <LanguageSwitcher expanded />
        </div>
        <div className="drawer__actions">
          <Button to="/reserve" size="lg" block>
            {t('nav.reserve')}
          </Button>
          {user ? (
            <Button variant="glass" size="lg" block onClick={logout}>
              {t('nav.signOut')}
            </Button>
          ) : (
            <Button to="/login" variant="glass" size="lg" block>
              {t('nav.signIn')}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
