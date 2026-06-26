'use client';

import { useState, useEffect, createContext, useContext } from 'react';

interface Toast { id: string; message: string; type: 'success' | 'error' | 'info'; }
interface ToastCtx { toast: (message: string, type?: Toast['type']) => void; }

const ToastContext = createContext<ToastCtx>({ toast: () => {} });

let globalToast: ToastCtx['toast'] = () => {};
export function useToast() { return useContext(ToastContext); }
export function toast(message: string, type: Toast['type'] = 'info') { globalToast(message, type); }

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  useEffect(() => { globalToast = addToast; }, []);

  const bg = { success: 'bg-green-600', error: 'bg-red-600', info: 'bg-brand-600' };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className={`${bg[t.type]} text-white px-4 py-3 rounded-lg shadow-lg max-w-sm text-sm animate-in slide-in-from-right`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
