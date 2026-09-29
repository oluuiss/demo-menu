import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader.jsx';
import CategoryTabs from '../components/menu/CategoryTabs.jsx';
import MenuGrid from '../components/menu/MenuGrid.jsx';
import MenuItemModal from '../components/menu/MenuItemModal.jsx';
import CartBar from '../components/cart/CartBar.jsx';
import { SearchIcon } from '../components/ui/Icons.jsx';
import { menuApi } from '../api/endpoints.js';
import { useAsync } from '../hooks/useAsync.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import './MenuPage.css';

const ALL = 'ALL';

export default function MenuPage() {
  const { t, language } = useI18n();
  const menu = useAsync(() => menuApi.list(), [language]);
  const [params, setParams] = useSearchParams();
  const [category, setCategory] = useState(ALL);
  const [query, setQuery] = useState('');

  const items = useMemo(() => menu.data ?? [], [menu.data]);
  const categories = useMemo(
    () => [ALL, ...new Set(items.map((i) => i.category))].map((value) => ({ value, label: t(`categories.${value}`) })),
    [items, t],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return items.filter(
      (item) =>
        (category === ALL || item.category === category) &&
        (!q || item.name.toLocaleLowerCase().includes(q) || item.description.toLocaleLowerCase().includes(q)),
    );
  }, [items, category, query]);

  // The open item lives in the URL (?item=ID) so it can be linked to from the home page.
  const selected = items.find((i) => String(i.id) === params.get('item')) ?? null;
  const openItem = (item) => setParams({ item: item.id }, { replace: false });
  const closeItem = () => setParams({}, { replace: true });

  return (
    <>
      <PageHeader eyebrow={t('menu.eyebrow')} title={t('menu.title')} lead={t('menu.lead')} />
      <section className="section menu-page">
        <div className="container">
          <div className="menu-toolbar glass">
            <CategoryTabs options={categories} active={category} onChange={setCategory} label={t('menu.eyebrow')} />
            <label className="menu-search">
              <SearchIcon size={18} />
              <span className="visually-hidden">{t('menu.searchLabel')}</span>
              <input type="search" placeholder={t('menu.search')} value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
          </div>
          <MenuGrid
            items={visible}
            status={menu.status}
            error={menu.error}
            onRetry={menu.reload}
            onSelect={openItem}
            skeletons={8}
            emptyText={query ? t('menu.noResults') : t('menu.empty')}
          />
        </div>
      </section>
      <MenuItemModal item={selected} onClose={closeItem} />
      <CartBar />
    </>
  );
}
