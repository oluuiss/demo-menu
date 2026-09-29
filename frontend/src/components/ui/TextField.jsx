import { forwardRef, useId, useState } from 'react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { LockIcon } from './Icons.jsx';
import './TextField.css';

/**
 * Labelled input with error state. `type="password"` gets a show/hide toggle;
 * `locked` renders a read-only field with a lock icon.
 */
const TextField = forwardRef(function TextField(
  { label, error, hint, type = 'text', id, locked = false, className = '', ...rest },
  ref,
) {
  const { t } = useI18n();
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={`field ${error ? 'field--error' : ''} ${locked ? 'field--locked' : ''} ${className}`}>
      <label className="field__label" htmlFor={inputId}>
        {label}
      </label>
      <div className="field__control">
        <input
          ref={ref}
          id={inputId}
          className="field__input"
          type={isPassword && revealed ? 'text' : type}
          readOnly={locked || rest.readOnly}
          aria-readonly={locked || undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className="field__toggle"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? t('auth.hidePassword') : t('auth.showPassword')}
            aria-pressed={revealed}
          >
            {revealed ? t('auth.hide') : t('auth.show')}
          </button>
        )}
        {locked && (
          <span className="field__lock" title={t('settings.locked')}>
            <LockIcon size={16} />
          </span>
        )}
      </div>
      {error ? (
        <p className="field__error" id={errorId}>
          {error}
        </p>
      ) : (
        hint && <p className="field__hint">{hint}</p>
      )}
    </div>
  );
});

export default TextField;
