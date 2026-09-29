import Button from '../ui/Button.jsx';
import { ArrowRightIcon } from '../ui/Icons.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './Hero.css';

export default function Hero() {
  const { t } = useI18n();

  return (
    <section className="hero">
      <div className="hero__bg" aria-hidden="true" />
      <div className="container hero__content">
        <span className="hero__eyebrow glass">{t('hero.eyebrow')}</span>
        <h1 className="hero__title">
          {t('hero.title1')}
          <br />
          <em>{t('hero.title2')}</em>
        </h1>
        <p className="hero__lead">{t('hero.lead')}</p>
        <div className="hero__cta">
          <Button size="lg" to="/menu" icon={<ArrowRightIcon size={18} />} className="hero__primary">
            {t('hero.ctaMenu')}
          </Button>
          <Button size="lg" variant="glass" to="/reserve">
            {t('hero.ctaReserve')}
          </Button>
        </div>
      </div>
      <a className="hero__scroll" href="#destaques" aria-label={t('hero.scroll')}>
        <span />
      </a>
    </section>
  );
}
