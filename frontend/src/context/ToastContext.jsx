import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon } from '../components/ui/Icons.jsx';
import './Toast.css';

const ToastContext = createContext(null);

/** Lightweight notifications: showToast({ message, action: { label, to } }). */
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const showToast = useCallback((next) => {
    clearTimeout(timer.current);
    setToast({ ...next, id: Date.now() });
    timer.current = setTimeout(() => setToast(null), 3800);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toast && (
          <div key={toast.id} className="toast glass">
            <span className="toast__icon" aria-hidden="true">
              <CheckIcon />
            </span>
            <span className="toast__message">{toast.message}</span>
            {toast.action && (
              <Link className="toast__action" to={toast.action.to} onClick={() => setToast(null)}>
                {toast.action.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
