import React from 'react';
import { useCompliance } from '../context/ComplianceContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useCompliance();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        let bgStyle = 'bg-[#00236f] text-white border-[#1e3a8a]';
        let icon = 'info';

        if (toast.type === 'success') {
          bgStyle = 'bg-[#047857] text-white border-[#065f46]';
          icon = 'check_circle';
        } else if (toast.type === 'error') {
          bgStyle = 'bg-[#ba1a1a] text-white border-[#991b1b]';
          icon = 'error';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-lg shadow-lg border text-[13px] flex items-center justify-between gap-3 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${bgStyle}`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">{icon}</span>
              <span className="font-medium leading-snug">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/80 hover:text-white p-0.5"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
