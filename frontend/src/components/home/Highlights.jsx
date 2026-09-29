import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button.jsx';
import MenuGrid from '../menu/MenuGrid.jsx';
import { menuApi } from '../../api/endpoints.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useReveal } from '../../hooks/useReveal.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

/** "House favorites": featured dishes loaded (and translated) by the backend. */
export default function Highlights() {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const menu = useAsync(() => menuApi.list({ featured: true }), [language]);
  const ref = useReveal();

  return (
    <section className="section" id="destaques">
      <div className="container reveal" ref={ref}>
        <div className="section__head">
          <div>
            <span className="eyebrow">{t('highlights.eyebrow')}</span>
            <h2 className="section__title">{t('highlights.title')}</h2>
            <p className="section__lead">{t('highlights.lead')}</p>
          </div>
          <Button variant="glass" to="/menu">
            {t('highlights.fullMenu')}
          </Button>
        </div>
        <MenuGrid
          items={menu.data ?? []}
          status={menu.status}
          error={menu.error}
          onRetry={menu.reload}
          onSelect={(item) => navigate(`/menu?item=${item.id}`)}
        />
      </div>
    </section>
  );
}
