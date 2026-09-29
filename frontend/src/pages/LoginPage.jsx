import { useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import TextField from '../components/ui/TextField.jsx';
import Button from '../components/ui/Button.jsx';
import { AlertIcon } from '../components/ui/Icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { errorMessage } from '../api/client.js';

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from ?? '/';

  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  if (!loading && user && !submitting) return <Navigate to={redirectTo} replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((errs) => ({ ...errs, [name]: undefined }));
    if (formError) setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clientErrors = {};
    if (!values.email.trim()) clientErrors.email = t('auth.emailRequired');
    if (!values.password) clientErrors.password = t('auth.passwordRequired');
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) {
      (clientErrors.email ? emailRef : passwordRef).current?.focus();
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await login(values.email.trim(), values.password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setErrors(err.fields ?? {});
      setFormError(errorMessage(err, t));
      setValues((v) => ({ ...v, password: '' }));
      passwordRef.current?.focus();
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title={t('auth.title')} subtitle={t('auth.subtitle')}>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {formError && (
          <div className="alert alert--error" role="alert">
            <AlertIcon size={18} />
            {formError}
          </div>
        )}

        <TextField
          ref={emailRef}
          label={t('auth.email')}
          name="email"
          type="text"
          inputMode="email"
          autoComplete="username"
          placeholder={t('auth.emailPlaceholder')}
          value={values.email}
          onChange={handleChange}
          error={errors.email}
          autoFocus
        />

        <TextField
          ref={passwordRef}
          label={t('auth.password')}
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder={t('auth.passwordPlaceholder')}
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />

        <div className="auth-form__row">
          <Link to="/forgot-password" className="auth-form__link">
            {t('auth.forgot')}
          </Link>
        </div>

        <Button type="submit" size="lg" block loading={submitting}>
          {submitting ? t('auth.submitting') : t('auth.submit')}
        </Button>
      </form>

      <p className="auth-hint">
        {t('auth.demoHint', { email: '\u0000e', password: '\u0000p' })
          .split(/(\u0000[ep])/)
          .map((part, i) =>
            part === '\u0000e' ? <code key={i}>usuario@demo</code> : part === '\u0000p' ? <code key={i}>usuario</code> : part,
          )}
      </p>
    </AuthLayout>
  );
}
