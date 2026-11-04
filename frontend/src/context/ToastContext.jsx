import { createContext, useCallback, useContext, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const ToastContext = createContext(null);

const ICONES = { success: 'bi-check-circle-fill', danger: 'bi-exclamation-triangle-fill', warning: 'bi-exclamation-circle-fill', info: 'bi-info-circle-fill' };

// Notifications globales (retours utilisateur : succès, erreurs, produit épuisé...)
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((message, variant = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, variant }]);
  }, []);

  const fermer = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <ToastContainer position="bottom-end" className="p-3 position-fixed" style={{ zIndex: 2000 }}>
        {toasts.map((t) => (
          <Toast key={t.id} onClose={() => fermer(t.id)} delay={4000} autohide bg={t.variant} className="text-white">
            <Toast.Body className="d-flex align-items-start gap-2" role={t.variant === 'danger' ? 'alert' : 'status'}>
              <i className={`bi ${ICONES[t.variant] || ICONES.info}`} aria-hidden="true"></i>
              <span className={t.variant === 'warning' ? 'text-dark flex-grow-1' : 'flex-grow-1'}>{t.message}</span>
              <button type="button" className="btn-close btn-close-white" aria-label="Fermer" onClick={() => fermer(t.id)} />
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
