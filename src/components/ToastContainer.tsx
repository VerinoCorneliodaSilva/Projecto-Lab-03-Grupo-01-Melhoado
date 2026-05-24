import { useNotification } from '../context/NotificationContext';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export function ToastContainer() {
  const { notifications, removeNotification } = useNotification();

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  };

  const borders = {
    success: 'border-emerald-500/30',
    error: 'border-red-500/30',
    warning: 'border-yellow-500/30',
    info: 'border-blue-500/30',
  };

  const backgrounds = {
    success: 'bg-emerald-500/10',
    error: 'bg-red-500/10',
    warning: 'bg-yellow-500/10',
    info: 'bg-blue-500/10',
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`pointer-events-auto ${backgrounds[n.type]} ${borders[n.type]} border rounded-xl p-4 shadow-2xl backdrop-blur-md flex items-start gap-3 animate-slide-in`}
        >
          <div className="shrink-0 mt-0.5">{icons[n.type]}</div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-white text-sm">{n.title}</div>
            {n.message && <div className="text-xs text-slate-300 mt-0.5">{n.message}</div>}
          </div>
          <button
            onClick={() => removeNotification(n.id)}
            className="text-slate-400 hover:text-white shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
