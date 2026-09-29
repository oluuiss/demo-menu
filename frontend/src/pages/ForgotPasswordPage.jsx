import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import TextField from '../components/ui/TextField.jsx';
import Button from '../components/ui/Button.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';

/**
 * Password recovery screen. E-mail delivery is not implemented in the demo backend,
 * so this only validates the input and shows a confirmation message.
 */
export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+$/.test(email.trim())) {
      setError(t('forgot.invalidEmail'));
      return;
    }
    setSent(true);
  };

  return (
    <AuthLayout title={t('forgot.title')} subtitle={t('forgot.subtitle')}>
      {sent ? (
        <div className="auth-form">
          <div className="alert alert--success" role="status">
            {t('forgot.sent', { email: email.trim() })}
          </div>
          <Button to="/login" size="lg" block>
            {t('forgot.backToLogin')}
          </Button>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <TextField
            label={t('forgot.email')}
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            error={error}
            autoFocus
          />
          <Button type="submit" size="lg" block>
            {t('forgot.send')}
          </Button>
          <div className="auth-form__row" style={{ justifyContent: 'center' }}>
            <Link to="/login" className="auth-form__link">
              {t('forgot.remember')}
            </Link>
          </div>
        </form>
      )}
      <p className="auth-hint">{t('forgot.noEmail')}</p>
    </AuthLayout>
  );
}
