import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast['type'] = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, message, type, duration };

    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return { toasts, addToast, removeToast };
};

const toastConfig = {
  success: {
    icon: CheckCircle2,
    gradient: 'from-emerald-500 to-green-600',
    iconColor: 'text-emerald-200',
    borderColor: 'border-emerald-400/30',
  },
  error: {
    icon: XCircle,
    gradient: 'from-rose-500 to-red-600',
    iconColor: 'text-rose-200',
    borderColor: 'border-rose-400/30',
  },
  warning: {
    icon: AlertTriangle,
    gradient: 'from-amber-500 to-orange-600',
    iconColor: 'text-amber-200',
    borderColor: 'border-amber-400/30',
  },
  info: {
    icon: Info,
    gradient: 'from-blue-500 to-indigo-600',
    iconColor: 'text-blue-200',
    borderColor: 'border-blue-400/30',
  },
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const config = toastConfig[toast.type];
  const Icon = config.icon;
  const [progress, setProgress] = React.useState(100);

  React.useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (toast.duration! / 50));
          return newProgress <= 0 ? 0 : newProgress;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [toast.duration]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`
        relative overflow-hidden rounded-xl shadow-2xl backdrop-blur-xl
        bg-gradient-to-r ${config.gradient}
        border ${config.borderColor}
        min-w-[320px] max-w-[420px]
      `}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative p-4 flex items-start gap-3">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.1 }}
          className={`flex-shrink-0 ${config.iconColor}`}
        >
          <Icon className="w-5 h-5" />
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm leading-relaxed">
            {toast.message}
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 text-white/70 hover:text-white transition-colors p-1 -m-1"
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>
      
      {/* Progress bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
          <motion.div
            className="h-full bg-white/40"
            initial={{ width: "100%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.05, ease: "linear" }}
          />
        </div>
      )}
      
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: "200%" }}
        transition={{ duration: 1, delay: 0.2 }}
      />
    </motion.div>
  );
}

export const ToastContainer = ({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) => {
  return (
    <div className="fixed top-4 right-4 space-y-3 z-[100]">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
};
