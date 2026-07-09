import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';

const VARIANT_STYLE = {
  default:     { icon: <Info className="w-4 h-4 text-indigo-400" />,    border: 'border-indigo-500/30', bg: 'bg-indigo-500/10' },
  success:     { icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  destructive: { icon: <XCircle className="w-4 h-4 text-red-400" />,    border: 'border-red-500/30',    bg: 'bg-red-500/10' },
} as const;

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-80 pointer-events-none"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const style = VARIANT_STYLE[t.variant ?? 'default'];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl glass ${style.border} ${style.bg}`}
            >
              <span className="flex-shrink-0 mt-0.5">{style.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{t.title}</p>
                {t.description && <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                aria-label="Dismiss notification"
                className="flex-shrink-0 p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
