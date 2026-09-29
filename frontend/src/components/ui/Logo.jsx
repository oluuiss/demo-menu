import { useId } from 'react';
import { Link } from 'react-router-dom';
import './Logo.css';

/** Brand mark: a flame rising from behind a mountain ridge. */
export function LogoMark({ size = 36, className = '' }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={`logo-mark ${className}`} width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-flame`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ec5f22" />
          <stop offset="1" stopColor="#ff9a4d" />
        </linearGradient>
        <linearGradient id={`${id}-core`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffc861" />
          <stop offset="1" stopColor="#fff1c9" />
        </linearGradient>
        <linearGradient id={`${id}-ridge`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbf4ec" />
          <stop offset="1" stopColor="#d9c9b8" />
        </linearGradient>
        <linearGradient id={`${id}-front`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9491a" />
          <stop offset="1" stopColor="#7d2a1e" />
        </linearGradient>
      </defs>
      {/* Flame (drawn first so the ridge overlaps its base) */}
      <path
        d="M24 3.5c1.5 5.2 8.3 8.6 8.3 15.4 0 5-3.7 8.6-8.3 8.6s-8.3-3.6-8.3-8.6c0-3.4 1.8-5.8 3.6-7.3.3 2.3 1.4 3.8 3.1 4.6C21.8 11.7 22.8 7.6 24 3.5z"
        fill={`url(#${id}-flame)`}
      />
      <path d="M24 15c.8 2.5 3.8 3.9 3.8 7.1a3.8 3.8 0 0 1-7.6 0c0-2 1.3-3.4 3.8-7.1z" fill={`url(#${id}-core)`} />
      {/* Main ridge with two peaks */}
      <path d="M2 43 L16.5 21 L23.5 30 L29.5 22.5 L46 43 Z" fill={`url(#${id}-ridge)`} />
      {/* Snow line / light edge */}
      <path d="M12.6 27 L16.5 21 L20.2 25.8 M26.6 26.2 L29.5 22.5 L33 27" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      {/* Warm foreground hills */}
      <path d="M9 43 L20 32.5 L25.5 37 L31 31.5 L40 43 Z" fill={`url(#${id}-front)`} />
    </svg>
  );
}

export default function Logo({ onClick, compact = false }) {
  return (
    <Link to="/" className="logo" aria-label="Brasa Grill" onClick={onClick}>
      <LogoMark />
      {!compact && (
        <span className="logo__text">
          Brasa<span>Grill</span>
        </span>
      )}
    </Link>
  );
}
