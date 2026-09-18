import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  return (
    <div
      id="app-toast"
      role="alert"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border border-slate-200 backdrop-blur-md bg-white/95 text-slate-800 text-sm font-medium animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
      {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
      {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0" />}
      <span className="leading-snug">{toast.message}</span>
    </div>
  );
};
