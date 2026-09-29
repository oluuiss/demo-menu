import { useReveal } from '../../hooks/useReveal.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { FlameIcon, GlassIcon, KnifeIcon } from '../ui/Icons.jsx';
import './Experience.css';

const ICONS = [FlameIcon, KnifeIcon, GlassIcon];

export default function Experience() {
  const { t } = useI18n();
  const ref = useReveal();
  const items = t('experience.items');

  return (
    <section className="section experience">
      <div className="container experience__grid reveal" ref={ref}>
        <div className="experience__media" aria-hidden="true">
          <div className="experience__photo" />
          <div className="experience__stat glass">
            <strong>{t('experience.statValue')}</strong>
            <span>{t('experience.statLabel')}</span>
          </div>
        </div>

        <div className="experience__copy">
          <span className="eyebrow">{t('experience.eyebrow')}</span>
          <h2 className="section__title">{t('experience.title')}</h2>
          <p className="section__lead">{t('experience.lead')}</p>
          <ol className="experience__list">
            {items.map((item, index) => {
              const Icon = ICONS[index];
              return (
                <li key={item.title} className="experience__item">
                  <span className="experience__index">{String(index + 1).padStart(2, '0')}</span>
                  <div className="experience__text">
                    <h3>
                      <Icon size={18} />
                      {item.title}
                    </h3>
                    <p>{item.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
