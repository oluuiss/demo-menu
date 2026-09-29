import { Link } from 'react-router-dom';
import './Button.css';

/**
 * Button that renders as <Link> when `to` is set, <a> when `href` is set, otherwise <button>.
 * variant: primary (ember liquid glass) | glass (clear glass) | ghost | danger
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  icon,
  to,
  href,
  className = '',
  children,
  ...rest
}) {
  const classes = ['btn', `btn--${variant}`, `btn--${size}`, block && 'btn--block', className]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {loading ? <span className="btn__spinner" aria-hidden="true" /> : icon}
      {children && <span>{children}</span>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <button
      type="button"
      className={classes}
      {...rest}
      disabled={loading || rest.disabled}
      aria-busy={loading || undefined}
    >
      {content}
    </button>
  );
}
