import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/shared/Toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, subText = '', type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, subText, type, duration }]);
  }, []);

  const hideToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Convenience methods
  const success = useCallback((message, subText) => {
    showToast(message, subText, 'success');
  }, [showToast]);

  const error = useCallback((message, subText) => {
    showToast(message, subText, 'error', 4000);
  }, [showToast]);

  const warning = useCallback((message, subText) => {
    showToast(message, subText, 'warning');
  }, [showToast]);

  const info = useCallback((message, subText) => {
    showToast(message, subText, 'info');
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            subText={toast.subText}
            type={toast.type}
            duration={toast.duration}
            onClose={() => hideToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
