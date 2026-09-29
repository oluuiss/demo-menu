import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setApiLanguage } from '../api/client.js';
import pt from './locales/pt.js';
import en from './locales/en.js';
import de from './locales/de.js';

/** Supported languages. `country` drives the flag and country-specific data (e.g. ID documents). */
export const LANGUAGES = [
  { code: 'en', locale: 'en-US', country: 'US' },
  { code: 'de', locale: 'de-DE', country: 'DE' },
  { code: 'pt', locale: 'pt-BR', country: 'BR' },
];

const DICTIONARIES = { pt, en, de };
const STORAGE_KEY = 'brasa.language';

function initialLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && DICTIONARIES[saved]) return saved;
  } catch {
    /* storage unavailable */
  }
  const browser = (navigator.language || 'pt').slice(0, 2);
  return DICTIONARIES[browser] ? browser : 'pt';
}

function lookup(dict, key) {
  return key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), dict);
}

function interpolate(text, vars) {
  return text.replace(/\{(\w+)\}/g, (match, name) => (vars[name] !== undefined ? String(vars[name]) : match));
}

const I18nContext = createContext(null);

// Keep API requests in sync from the very first render.
setApiLanguage(LANGUAGES.find((l) => l.code === initialLanguage()).locale);

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(initialLanguage);
  const meta = LANGUAGES.find((l) => l.code === language);

  useEffect(() => {
    setApiLanguage(meta.locale);
    document.documentElement.lang = meta.locale;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      /* storage unavailable */
    }
  }, [language, meta.locale]);

  const setLanguage = useCallback((code) => {
    if (DICTIONARIES[code]) {
      // Update the API language synchronously so refetches triggered by this change use it.
      setApiLanguage(LANGUAGES.find((l) => l.code === code).locale);
      setLanguageState(code);
    }
  }, []);

  const value = useMemo(() => {
    const dict = DICTIONARIES[language];
    const currency = new Intl.NumberFormat(meta.locale, { style: 'currency', currency: 'BRL' });

    /** t('a.b', { count, name }) — supports {var} interpolation and { one, other } plurals. */
    const t = (key, vars = {}) => {
      let entry = lookup(dict, key);
      if (entry === undefined) entry = lookup(pt, key);
      if (entry && typeof entry === 'object' && 'other' in entry) {
        entry = vars.count === 1 ? entry.one : entry.other;
      }
      if (typeof entry !== 'string') return entry ?? key;
      return interpolate(entry, vars);
    };

    return {
      language,
      locale: meta.locale,
      country: meta.country,
      setLanguage,
      t,
      formatPrice: (value) => currency.format(Number(value)),
      formatDate: (value, options = { day: '2-digit', month: 'short', year: 'numeric' }) =>
        new Intl.DateTimeFormat(meta.locale, options).format(toDate(value)),
      formatTime: (value) =>
        new Intl.DateTimeFormat(meta.locale, { hour: '2-digit', minute: '2-digit' }).format(toDate(value)),
    };
  }, [language, meta, setLanguage]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Accepts Date, ISO instants and plain "YYYY-MM-DD" dates (parsed as local dates, not UTC). */
function toDate(value) {
  if (value instanceof Date) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(value);
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
