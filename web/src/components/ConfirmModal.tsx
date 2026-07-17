import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger' | 'warning';
  isLoading?: boolean;
  error?: string;
  icon?: React.ReactNode;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'primary',
  isLoading = false,
  error = '',
  icon,
}: ConfirmModalProps) {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isLoading ? onClose : undefined}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col"
          >
            <div className="px-6 py-5 flex flex-col items-center text-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  variant === 'danger'
                    ? 'bg-red-50 text-red-500'
                    : variant === 'warning'
                      ? 'bg-orange-50 text-orange-500'
                      : 'bg-[#d7ee46]/20 text-[#96a827]'
                }`}
              >
                {icon || <AlertTriangle size={24} />}
              </div>
              <h2 className="text-lg font-bold text-[#060606] mb-2">{title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
            </div>

            {/* Error message inside modal */}
            {error && (
              <div className="mx-6 mb-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-700 leading-relaxed">{error}</p>
              </div>
            )}

            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 px-4 py-2.5 text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                  variant === 'danger'
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : variant === 'warning'
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-[#d7ee46] text-[#060606] hover:bg-[#c4dc32]'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
