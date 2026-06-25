import { useState, useEffect } from 'react';
import { X, Search, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { sessionService } from '../../../../services/session.service';
import {
  exceptionService,
  ExceptionType,
  EXCEPTION_TYPE_LABELS,
} from '../../../../services/exception.service';
import { pricingService } from '../../../../services/pricing.service';

interface CreateExceptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateExceptionModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateExceptionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundSession, setFoundSession] = useState<any>(null);

  const [exceptionType, setExceptionType] = useState<ExceptionType>(ExceptionType.OTHER);
  const [description, setDescription] = useState('');
  const [surcharge, setSurcharge] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [lostCardFee, setLostCardFee] = useState<number>(0);
  const [isFetchingFee, setIsFetchingFee] = useState(false);

  useEffect(() => {
    if (foundSession?.pricingPlanId?._id && exceptionType === ExceptionType.LOST_CARD) {
      const fetchFee = async () => {
        setIsFetchingFee(true);
        try {
          const res = await pricingService.getById(foundSession.pricingPlanId._id);
          setLostCardFee(res.data.lostCardFee || 0);
        } catch (error) {
          setLostCardFee(0);
        } finally {
          setIsFetchingFee(false);
        }
      };
      fetchFee();
    }
  }, [foundSession, exceptionType]);

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Vui lòng nhập Biển số hoặc Mã vé!');
      return;
    }
    setIsSearching(true);
    setFoundSession(null);
    try {
      const queryStr = searchQuery.trim().toUpperCase();
      let searchParams: any = { licensePlate: queryStr };
      if (queryStr.startsWith('PS-')) {
        searchParams = { code: queryStr };
      } else if (queryStr.startsWith('CARD-')) {
        searchParams = { cardCode: queryStr };
      }

      const res = await sessionService.searchSession(searchParams);
      if (res.success && res.data) {
        setFoundSession(res.data);
        toast.success('Tìm thấy phiên gửi xe hợp lệ!');
      } else {
        toast.error('Không tìm thấy phiên xe đang hoạt động!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Không tìm thấy phiên gửi xe!');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async () => {
    if (!foundSession?._id) {
      toast.error('Vui lòng tìm và chọn phiên gửi xe trước!');
      return;
    }
    if (!description.trim()) {
      toast.error('Vui lòng nhập mô tả ngoại lệ!');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        sessionId: foundSession._id,
        type: exceptionType,
        description: description.trim(),
      };

      if (exceptionType === ExceptionType.LOST_CARD && lostCardFee === 0 && surcharge !== '') {
        payload.surcharge = Number(surcharge);
      } else if (exceptionType !== ExceptionType.LOST_CARD && surcharge !== '') {
        payload.surcharge = Number(surcharge);
      }

      await exceptionService.createException(payload);

      toast.success('Đã tạo báo cáo ngoại lệ thành công!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi tạo ngoại lệ!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setFoundSession(null);
    setExceptionType(ExceptionType.OTHER);
    setDescription('');
    setSurcharge('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[500px] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e8e9e8] flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2 text-[#ef4444]">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-[18px] font-bold">Tạo Báo Cáo Ngoại Lệ Mới</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#6b6b6b] hover:text-black p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Bước 1: Tìm kiếm */}
          <div>
            <label className="block text-[13px] font-bold text-[#060606] mb-2 uppercase tracking-wider">
              1. Tìm phiên gửi xe
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập biển số hoặc mã vé..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 bg-white border border-[#e8e9e8] rounded-[8px] px-4 h-11 text-[14px] font-mono focus:outline-none focus:border-[#060606]"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="h-11 px-6 bg-[#1a1a1a] text-[#9FE870] font-bold rounded-[8px] hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Tìm
              </button>
            </div>

            {/* Kết quả tìm kiếm */}
            {foundSession && (
              <div className="mt-4 p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                <div>
                  <div className="font-mono text-[18px] font-bold text-[#060606]">
                    {foundSession.licensePlate}
                  </div>
                  <div className="text-[12px] text-[#64748b] mt-0.5">
                    Mã vé: {foundSession.code} • Giờ vào:{' '}
                    {new Date(foundSession.checkInTime).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="text-[12px] font-bold text-red-500 hover:text-red-700 underline underline-offset-2"
                >
                  Đổi xe
                </button>
              </div>
            )}
          </div>

          {/* Bước 2: Nhập thông tin */}
          <div
            className={`transition-opacity duration-300 ${foundSession ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}
          >
            <label className="block text-[13px] font-bold text-[#060606] mb-4 uppercase tracking-wider pt-2 border-t border-gray-100">
              2. Chi tiết ngoại lệ
            </label>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#64748b] mb-1.5">
                  Loại ngoại lệ <span className="text-red-500">*</span>
                </label>
                <select
                  value={exceptionType}
                  onChange={(e) => setExceptionType(e.target.value as ExceptionType)}
                  className="w-full h-11 bg-white border border-[#e8e9e8] rounded-[8px] px-3 text-[14px] font-medium focus:outline-none focus:border-[#060606]"
                >
                  {Object.entries(EXCEPTION_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tuỳ loại exception mà hiện ra field khác nhau */}
              {/* Phí làm lại thẻ */}
              {exceptionType === ExceptionType.LOST_CARD && foundSession?.pricingPlanId && (
                <div className="animate-in fade-in slide-in-from-top-1">
                  {isFetchingFee ? (
                    <div className="p-4 bg-gray-50 flex justify-center rounded-[8px]">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    </div>
                  ) : lostCardFee > 0 ? (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-[8px] flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-[13px] font-bold text-orange-900">
                          Phí làm lại thẻ (quy định theo loại xe)
                        </h5>
                        <p className="text-[14px] font-bold text-orange-700 mt-1">
                          {lostCardFee.toLocaleString('vi-VN')} VNĐ
                        </p>
                        <p className="text-[12px] text-orange-800 mt-1">
                          Khoản phí này sẽ tự động được cộng vào tổng tiền khi khách hàng check-out.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[13px] font-medium text-[#64748b] mb-1.5">
                        Phụ phí làm lại thẻ (VNĐ) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={surcharge}
                        onChange={(e) => setSurcharge(e.target.value ? Number(e.target.value) : '')}
                        placeholder="Quản lý chưa cài đặt mức phí, vui lòng tự nhập (VD: 50000)"
                        className="w-full bg-white border border-[#e8e9e8] rounded-[8px] px-4 h-11 text-[14px] focus:outline-none focus:border-[#060606]"
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-[13px] font-medium text-[#64748b] mb-1.5">
                  Mô tả tình huống <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả chi tiết nguyên nhân lỗi, tình huống xảy ra..."
                  className="w-full bg-white border border-[#e8e9e8] rounded-[8px] p-3 text-[14px] focus:outline-none focus:border-[#060606] resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e8e9e8] bg-gray-50/50 flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 h-11 border border-[#e8e9e8] bg-white rounded-[8px] text-[#060606] font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !foundSession}
            className="flex-[2] h-11 bg-[#ef4444] text-white font-bold rounded-[8px] hover:bg-red-600 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Tạo Ngoại Lệ
          </button>
        </div>
      </div>
    </div>
  );
}
