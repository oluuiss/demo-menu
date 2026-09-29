import PageHeader from '../components/layout/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';

export default function NotFoundPage() {
  const { t } = useI18n();
  return (
    <PageHeader eyebrow={t('notFound.eyebrow')} title={t('notFound.title')} lead={t('notFound.lead')}>
      <div style={{ marginTop: 28, marginBottom: 48 }}>
        <Button to="/">{t('notFound.cta')}</Button>
      </div>
    </PageHeader>
  );
}
