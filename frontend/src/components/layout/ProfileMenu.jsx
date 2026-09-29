import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { BagIcon, LogoutIcon, SettingsIcon } from '../ui/Icons.jsx';
import './ProfileMenu.css';

/** Avatar button with a dropdown: Settings, My orders, Sign out. */
export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => !rootRef.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <div className="profile-menu" ref={rootRef}>
      <button
        type="button"
        className={`profile-menu__avatar ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('nav.profileMenu')}
      >
        <img src={user.avatarUrl} alt="" width="40" height="40" />
      </button>

      {open && (
        <div className="profile-menu__dropdown" role="menu">
          <div className="profile-menu__head">
            <img src={user.avatarUrl} alt="" width="44" height="44" />
            <div>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>
          <Link to="/settings" role="menuitem" className="profile-menu__item">
            <SettingsIcon size={18} /> {t('nav.settings')}
          </Link>
          <Link to="/orders" role="menuitem" className="profile-menu__item">
            <BagIcon size={18} /> {t('nav.myOrders')}
          </Link>
          <div className="profile-menu__sep" />
          <button type="button" role="menuitem" className="profile-menu__item profile-menu__item--danger" onClick={handleLogout}>
            <LogoutIcon size={18} /> {t('nav.signOut')}
          </button>
        </div>
      )}
    </div>
  );
}
