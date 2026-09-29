import { Link } from 'react-router-dom';
import Logo from '../ui/Logo.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './Footer.css';

const COLUMNS = [
  {
    title: 'footer.navigate',
    links: [
      { to: '/', label: 'nav.home' },
      { to: '/menu', label: 'nav.menu' },
      { to: '/restaurants', label: 'nav.restaurants' },
      { to: '/reserve', label: 'nav.reserve' },
    ],
  },
  {
    title: 'footer.account',
    links: [
      { to: '/login', label: 'nav.signIn' },
      { to: '/orders', label: 'nav.myOrders' },
      { to: '/settings', label: 'nav.settings' },
    ],
  },
];

const EMAIL = 'luispyim@gmail.com';
const PHONE = '+55 11 94784-9239';

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__card glass-lite">
          <div className="footer__grid">
            <div className="footer__brand">
              <Logo />
              <p>{t('footer.tagline')}</p>
            </div>

            {COLUMNS.map((col) => (
              <nav key={col.title} className="footer__col" aria-label={t(col.title)}>
                <h3>{t(col.title)}</h3>
                <ul>
                  {col.links.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to}>{t(link.label)}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            <div className="footer__col">
              <h3>{t('footer.service')}</h3>
              <ul>
                <li>
                  <span className="footer__term">{t('footer.email')}:</span>{' '}
                  <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
                </li>
                <li>
                  <span className="footer__term">{t('footer.phone')}:</span>{' '}
                  <a href={`tel:${PHONE.replace(/[^\d+]/g, '')}`}>{PHONE}</a>
                </li>
                <li className="footer__muted">{t('footer.hours')}</li>
              </ul>
            </div>
          </div>

          <div className="footer__bottom">
            <p>{t('footer.rights', { year: new Date().getFullYear() })}</p>
            <p>
              {t('footer.createdBy')}{' '}
              <a href="https://oluuiss.com/" target="_blank" rel="noreferrer" className="footer__author">
                @oluuiss
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
