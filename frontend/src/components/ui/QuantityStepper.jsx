import { useI18n } from '../../i18n/I18nContext.jsx';
import { MinusIcon, PlusIcon } from './Icons.jsx';
import './QuantityStepper.css';

export default function QuantityStepper({ value, onChange, min = 1, max = 20, disabled = false, size = 'md' }) {
  const { t } = useI18n();
  return (
    <div className={`stepper stepper--${size}`} role="group" aria-label={t('menu.quantity')}>
      <button
        type="button"
        className="stepper__btn"
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= min}
        aria-label={t('cart.decrease')}
      >
        <MinusIcon size={16} />
      </button>
      <output className="stepper__value" aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        className="stepper__btn"
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
        aria-label={t('cart.increase')}
      >
        <PlusIcon size={16} />
      </button>
    </div>
  );
}
