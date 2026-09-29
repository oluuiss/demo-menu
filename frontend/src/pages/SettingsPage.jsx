import PageHeader from '../components/layout/PageHeader.jsx';
import TextField from '../components/ui/TextField.jsx';
import Button from '../components/ui/Button.jsx';
import Flag from '../components/ui/Flag.jsx';
import { LockIcon, ShieldIcon } from '../components/ui/Icons.jsx';
import { profileApi } from '../api/endpoints.js';
import { errorMessage } from '../api/client.js';
import { useAsync } from '../hooks/useAsync.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import './SettingsPage.css';

/**
 * Read-only profile. The backend exposes no update endpoint (public demo), and the ID document
 * shown follows the country of the selected language.
 */
export default function SettingsPage() {
  const { t, language, formatDate } = useI18n();
  const profile = useAsync(() => profileApi.get(), [language]);
  const p = profile.data;

  return (
    <>
      <PageHeader eyebrow={t('settings.eyebrow')} title={t('settings.title')} />
      <section className="section">
        <div className="container settings">
          <div className="alert alert--info settings__notice">
            <ShieldIcon size={18} />
            {t('settings.readOnly')}
          </div>

          {profile.status === 'error' && (
            <div className="state-message" role="alert">
              {errorMessage(profile.error, t)}
              <div>
                <Button variant="glass" onClick={profile.reload}>
                  {t('common.retry')}
                </Button>
              </div>
            </div>
          )}

          {!p && profile.status === 'loading' && <div className="skeleton" style={{ height: 360 }} />}

          {p && (
            <div className="settings__grid">
              <aside className="settings__photo glass panel">
                <h2 className="settings__heading">{t('settings.photo')}</h2>
                <div className="settings__avatar">
                  <img src={p.avatarUrl} alt={p.name} width="160" height="160" />
                  <span className="settings__avatar-lock" title={t('settings.photoLocked')}>
                    <LockIcon size={16} />
                  </span>
                </div>
                <strong className="settings__name">{p.name}</strong>
                <span className="muted">{p.email}</span>
                <p className="settings__photo-note">{t('settings.photoLocked')}</p>
              </aside>

              <div className="settings__form glass panel">
                <h2 className="settings__heading">{t('settings.personal')}</h2>
                <div className="settings__fields">
                  <TextField locked label={t('settings.name')} value={p.name} className="settings__full" />
                  <TextField locked label={t('settings.email')} value={p.email} />
                  <TextField locked label={t('settings.phone')} value={p.phone} />
                  <TextField
                    locked
                    label={t('settings.birthDate')}
                    value={formatDate(p.birthDate, { day: '2-digit', month: 'long', year: 'numeric' })}
                  />
                  {p.document && (
                    <TextField
                      locked
                      label={t(`settings.documentTypes.${p.document.type}`)}
                      value={p.document.number}
                      hint={
                        <span className="settings__doc-hint">
                          <Flag country={p.document.country} size={18} />
                          {t('settings.documentFor', { country: t(`settings.countries.${p.document.country}`) })}
                        </span>
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
