import { LANGUAGES, useI18n } from '../../i18n/I18nContext.jsx';
import Flag from '../ui/Flag.jsx';
import './LanguageSwitcher.css';

/** Three flag buttons (US, DE, BR). `expanded` also shows the language names (mobile drawer). */
export default function LanguageSwitcher({ expanded = false }) {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className={`lang-switch ${expanded ? 'lang-switch--expanded' : ''}`} role="group" aria-label={t('lang.label')}>
      {LANGUAGES.map((lang) => {
        const active = lang.code === language;
        return (
          <button
            key={lang.code}
            type="button"
            className={`lang-switch__btn ${active ? 'is-active' : ''}`}
            onClick={() => setLanguage(lang.code)}
            aria-pressed={active}
            aria-label={t(`lang.${lang.code}`)}
            title={t(`lang.${lang.code}`)}
            lang={lang.locale}
          >
            <Flag country={lang.country} size={expanded ? 24 : 21} />
            {expanded && <span>{t(`lang.${lang.code}`)}</span>}
          </button>
        );
      })}
    </div>
  );
}
