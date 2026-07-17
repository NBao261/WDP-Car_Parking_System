import { motion, AnimatePresence } from 'framer-motion';
import { X, FileSpreadsheet, Download, AlertCircle } from 'lucide-react';

interface ExportConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  format: 'excel' | 'pdf' | null;
  isExporting: boolean;
}

export function ExportConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  format,
  isExporting,
}: ExportConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && format && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isExporting ? onClose : undefined}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${format === 'excel' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {format === 'excel' ? <FileSpreadsheet size={20} /> : <Download size={20} />}
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Xác nhận xuất báo cáo
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  disabled={isExporting}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5">
                <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-800 rounded-xl mb-4">
                  <AlertCircle size={20} className="shrink-0 mt-0.5 text-amber-600" />
                  <p className="text-sm font-medium leading-relaxed">
                    Bạn đang chuẩn bị xuất báo cáo tổng quan hệ thống ra định dạng <strong className="uppercase">{format}</strong>. Quá trình này có thể mất một vài giây tùy thuộc vào lượng dữ liệu.
                  </p>
                </div>
                <p className="text-gray-600 text-sm">
                  Bạn có chắc chắn muốn tiếp tục thực hiện hành động này không?
                </p>
              </div>

              {/* Footer */}
              <div className="p-5 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  onClick={onClose}
                  disabled={isExporting}
                  className="px-5 py-2.5 rounded-xl font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isExporting}
                  className={`flex items-center justify-center min-w-[120px] px-5 py-2.5 rounded-xl font-medium text-white transition-all disabled:opacity-70 disabled:cursor-not-allowed ${
                    format === 'excel' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-[#062F28] hover:bg-[#062F28]/90'
                  }`}
                >
                  {isExporting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Xác nhận Xuất'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
