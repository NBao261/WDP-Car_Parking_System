import { X, Save, MessageSquare } from 'lucide-react';
import {
  IException,
  EXCEPTION_STATUS_LABELS,
  EXCEPTION_TYPE_LABELS,
  ExceptionStatus,
  ExceptionType,
} from '../../../../services/exception.service';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { createPortal } from 'react-dom';

interface ExceptionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  exception: IException | null;
  onSubmitReview: (exceptionId: string, managerNote: string) => Promise<void>;
  isSubmitting: boolean;
}

export function ExceptionReviewModal({
  isOpen,
  onClose,
  exception,
  onSubmitReview,
  isSubmitting,
}: ExceptionReviewModalProps) {
  const [managerNote, setManagerNote] = useState(exception?.managerNote || '');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Reset form when exception changes
  useState(() => {
    if (exception) {
      setManagerNote(exception.managerNote || '');
    }
  });

  if (!isOpen || !exception) return null;

  const handleSubmit = async () => {
    await onSubmitReview(exception._id, managerNote);
  };

  const getStatusColor = (status: ExceptionStatus) => {
    switch (status) {
      case ExceptionStatus.NEW:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case ExceptionStatus.PROCESSING:
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case ExceptionStatus.RESOLVED:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case ExceptionStatus.REJECTED:
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const sessionCode =
    typeof exception.sessionId === 'object' && exception.sessionId
      ? exception.sessionId.code
      : exception.sessionId || 'N/A';
  const staffName =
    typeof exception.staffId === 'object' && exception.staffId
      ? exception.staffId.name
      : exception.staffId || 'Hệ thống';

  const staffOutName =
    typeof exception.resolvedByStaffId === 'object' && exception.resolvedByStaffId
      ? (exception.resolvedByStaffId as any).name
      : (exception.resolvedByStaffId || 'Chưa xử lý');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const SERVER_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '');
    return `${SERVER_URL}${path.startsWith('/') ? path : `/${path}`}`;
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Xem lại Sự Cố</h2>
            <p className="text-sm text-gray-500 mt-1">
              Xem xét thông tin chi tiết và ghi lại đánh giá của bạn
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <span className="block text-xs font-medium text-gray-500 mb-1">Mã lượt gửi</span>
              <span className="font-semibold text-gray-800">{sessionCode}</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <span className="block text-xs font-medium text-gray-500 mb-1">Loại sự cố</span>
              <span className="font-semibold text-gray-800">
                {EXCEPTION_TYPE_LABELS[exception.type]}
              </span>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <span className="block text-xs font-medium text-gray-500 mb-1">Trạng thái</span>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(exception.status)}`}
              >
                {EXCEPTION_STATUS_LABELS[exception.status]}
              </span>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <span className="block text-xs font-medium text-gray-500 mb-1">Thời gian báo cáo</span>
              <span className="font-medium text-gray-800">{formatDate(exception.createdAt.toString())}</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <span className="block text-xs font-medium text-gray-500 mb-1">Nhân viên báo cáo</span>
              <span className="font-medium text-gray-800">{staffName}</span>
            </div>
            {exception.status === ExceptionStatus.RESOLVED && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="block text-xs font-medium text-gray-500 mb-1">Nhân viên xử lý</span>
                <span className="font-medium text-gray-800">{staffOutName}</span>
              </div>
            )}
            {(exception.surcharge !== undefined && exception.surcharge > 0) && (
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                <span className="block text-xs font-medium text-amber-600 mb-1">Phụ phí thu thêm</span>
                <span className="font-semibold text-amber-700">{formatCurrency(exception.surcharge)}</span>
              </div>
            )}
            {exception.expectedPlate && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="block text-xs font-medium text-gray-500 mb-1">
                  {exception.type === ExceptionType.WRONG_PLATE ? 'Biển số ban đầu' : 'Biển hệ thống'}
                </span>
                <span className="font-semibold text-blue-600">{exception.expectedPlate}</span>
              </div>
            )}
            {exception.actualPlate && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="block text-xs font-medium text-gray-500 mb-1">
                  {exception.type === ExceptionType.WRONG_PLATE ? 'Biển số sau khi sửa' : 'Biển thực tế (OCR)'}
                </span>
                <span className="font-semibold text-gray-800">{exception.actualPlate}</span>
              </div>
            )}
            {exception.oldSlot && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="block text-xs font-medium text-gray-500 mb-1">Chỗ đỗ ban đầu</span>
                <span className="font-semibold text-blue-600">
                  {typeof exception.oldSlot === 'object' ? exception.oldSlot.name : exception.oldSlot}
                </span>
              </div>
            )}
            {exception.newSlot && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="block text-xs font-medium text-gray-500 mb-1">Chỗ đỗ sau sửa</span>
                <span className="font-semibold text-gray-800">
                  {typeof exception.newSlot === 'object' ? exception.newSlot.name : exception.newSlot}
                </span>
              </div>
            )}
          </div>

          {/* Images */}
          {(exception.checkInImage || exception.checkOutImage) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exception.checkInImage && (
                <div className="flex flex-col">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Ảnh lúc vào bãi</h3>
                  <div 
                    className="relative rounded-xl overflow-hidden bg-gray-100 aspect-video border border-gray-100 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImage(getImageUrl(exception.checkInImage as string))}
                  >
                    <img 
                      src={getImageUrl(exception.checkInImage)} 
                      alt="Check In" 
                      className="w-full h-full object-contain bg-black/5" 
                    />
                  </div>
                </div>
              )}
              {exception.checkOutImage && (
                <div className="flex flex-col">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Ảnh xử lý sự cố</h3>
                  <div 
                    className="relative rounded-xl overflow-hidden bg-gray-100 aspect-video border border-gray-100 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImage(getImageUrl(exception.checkOutImage as string))}
                  >
                    <img 
                      src={getImageUrl(exception.checkOutImage)} 
                      alt="Check Out" 
                      className="w-full h-full object-contain bg-black/5" 
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Mô tả ban đầu (Lúc báo cáo)
              </h3>
              <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl text-sm text-gray-700 flex-1">
                {exception.description || (
                  <span className="text-gray-400 italic">Không có mô tả chi tiết</span>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Cách xử lý của bảo vệ</h3>
              <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl text-sm text-gray-700 flex-1">
                {exception.status === ExceptionStatus.RESOLVED ? (
                  exception.staffNote || (
                    <span className="text-gray-400 italic">Không có ghi chú khi xử lý</span>
                  )
                ) : (
                  <span className="text-amber-600 italic">Chưa được xử lý</span>
                )}
              </div>
            </div>
          </div>

          {/* Manager Note Form */}
          <div>
            <label
              htmlFor="managerNote"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
            >
              <MessageSquare size={16} className="text-gray-400" />
              Ghi chú của Quản lý (Review)
            </label>
            <textarea
              id="managerNote"
              value={managerNote}
              onChange={(e) => setManagerNote(e.target.value)}
              placeholder="Nhập ghi chú đánh giá của bạn ở đây..."
              rows={4}
              className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#c4dc32] focus:ring-1 focus:ring-[#c4dc32] resize-none transition-shadow"
            />
            <p className="text-xs text-gray-500 mt-2">
              Ghi chú này dùng để lưu trữ đánh giá nội bộ, không hiển thị cho khách hàng.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-[#060606] bg-[#d7ee46] rounded-xl hover:bg-[#c4dc32] transition-colors shadow-sm disabled:opacity-60"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-[#060606] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Lưu đánh giá
          </button>
        </div>
      </motion.div>

      {/* Image Fullscreen Viewer */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage}
              alt="Fullscreen view"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()} // Prevent click from closing when clicking on the image itself
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return createPortal(<AnimatePresence>{isOpen && modalContent}</AnimatePresence>, document.body);
}
