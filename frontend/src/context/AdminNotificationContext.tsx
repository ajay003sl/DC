import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface NotificationData {
  type: 'success' | 'error';
  title: string;
  message?: string;
  onConfirm?: () => void;
}

interface AdminNotificationContextType {
  showSuccess: (title: string, message?: string, onConfirm?: () => void) => void;
  showError: (title: string, message?: string) => void;
  closeNotification: () => void;
}

const AdminNotificationContext = createContext<AdminNotificationContextType | undefined>(undefined);

export const AdminNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if router state passed a notification on redirect
  useEffect(() => {
    if (location.state && (location.state as any).notification) {
      const incoming = (location.state as any).notification as NotificationData;
      setNotification(incoming);
      // Clean up state without refreshing
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  // Auto-dismiss success notification after 4.5 seconds
  useEffect(() => {
    if (notification && notification.type === 'success') {
      const timer = setTimeout(() => {
        if (notification.onConfirm) {
          notification.onConfirm();
        }
        setNotification(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showSuccess = (title: string, message?: string, onConfirm?: () => void) => {
    setNotification({ type: 'success', title, message, onConfirm });
  };

  const showError = (title: string, message?: string) => {
    setNotification({ type: 'error', title, message });
  };

  const closeNotification = () => {
    if (notification?.onConfirm) {
      notification.onConfirm();
    }
    setNotification(null);
  };

  return (
    <AdminNotificationContext.Provider value={{ showSuccess, showError, closeNotification }}>
      {children}

      {/* Luxury Animated Notification Modal Popup */}
      {notification && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          {/* Backdrop Click */}
          <div className="fixed inset-0" onClick={closeNotification} />

          {/* Modal Card */}
          <div
            className={`relative w-full max-w-md bg-white border shadow-2xl p-6 sm:p-8 text-center z-10 animate-scaleUp ${
              notification.type === 'success' ? 'border-emerald-200' : 'border-rose-200'
            }`}
          >
            {/* Top Close Button */}
            <button
              onClick={closeNotification}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-black transition-colors"
              aria-label="Close popup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon Circle */}
            <div
              className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                notification.type === 'success'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-rose-50 text-rose-600 border border-rose-200'
              }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-9 h-9 stroke-[2]" />
              ) : (
                <AlertTriangle className="w-9 h-9 stroke-[2]" />
              )}
            </div>

            {/* Title */}
            <h3 className="font-serif text-2xl font-medium text-[#1A1A1A] mb-2 leading-snug">
              {notification.title}
            </h3>

            {/* Message Body */}
            {notification.message && (
              <p className="text-xs sm:text-sm text-[#5A524C] leading-relaxed mb-6 whitespace-pre-line">
                {notification.message}
              </p>
            )}

            {/* Action Button */}
            <button
              type="button"
              onClick={closeNotification}
              className={`w-full py-3 px-6 text-xs uppercase tracking-[0.14em] font-semibold text-white transition-all shadow-sm ${
                notification.type === 'success'
                  ? 'bg-[#1A1A1A] hover:bg-black'
                  : 'bg-rose-700 hover:bg-rose-800'
              }`}
            >
              {notification.type === 'success' ? 'Continue' : 'Dismiss'}
            </button>

            {notification.type === 'success' && (
              <p className="text-[10px] text-[#8C827A] mt-2.5">
                Automatically closes in a few seconds...
              </p>
            )}
          </div>
        </div>
      )}
    </AdminNotificationContext.Provider>
  );
};

export const useAdminNotification = (): AdminNotificationContextType => {
  const context = useContext(AdminNotificationContext);
  if (!context) {
    throw new Error('useAdminNotification must be used within an AdminNotificationProvider');
  }
  return context;
};
