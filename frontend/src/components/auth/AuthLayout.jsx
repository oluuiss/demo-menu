import { Link } from 'react-router-dom';
import Logo from '../ui/Logo.jsx';
import LanguageSwitcher from '../layout/LanguageSwitcher.jsx';
import { ArrowLeftIcon } from '../ui/Icons.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './AuthLayout.css';

/** Focused auth layout: glass form card over the brand photo. */
export default function AuthLayout({ title, subtitle, children }) {
  const { t } = useI18n();
  return (
    <div className="auth">
      <div className="auth__bg" aria-hidden="true" />
      <header className="auth__top">
        <Logo />
        <div className="auth__top-actions">
          <LanguageSwitcher />
          <Link to="/" className="auth__back">
            <ArrowLeftIcon size={16} />
            <span>{t('auth.backToSite')}</span>
          </Link>
        </div>
      </header>

      <main className="auth__main">
        <div className="auth__card glass">
          <h1 className="auth__title">{title}</h1>
          {subtitle && <p className="auth__subtitle">{subtitle}</p>}
          {children}
        </div>
        <blockquote className="auth__quote">{t('auth.quote')}</blockquote>
      </main>
    </div>
  );
}
