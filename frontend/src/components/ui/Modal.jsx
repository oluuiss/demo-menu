import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { CloseIcon } from './Icons.jsx';
import './Modal.css';

/** Glass dialog. Centered on desktop, bottom sheet on phones. Closes on Escape / backdrop. */
export default function Modal({ open, onClose, labelledBy, children, className = '' }) {
  const { t } = useI18n();
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        className={`modal__dialog glass ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
      >
        <button type="button" className="modal__close" onClick={onClose} aria-label={t('common.close')}>
          <CloseIcon size={18} />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
