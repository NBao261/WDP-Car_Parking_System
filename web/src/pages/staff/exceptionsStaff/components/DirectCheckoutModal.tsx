import { useState, useEffect, useRef } from 'react';
import { X, Loader2, Camera, Receipt, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../../../services/api';
import { sessionService } from '../../../../services/session.service';
import { paymentService } from '../../../../services/payment.service';
import { formatCurrency } from '../../../../utils/format';

interface DirectCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  onSuccess: () => void;
}

export function DirectCheckoutModal({
  isOpen,
  onClose,
  sessionId,
  onSuccess,
}: DirectCheckoutModalProps) {
  const [feeData, setFeeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutImage, setCheckoutImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && sessionId) {
      fetchFee();
    } else {
      setFeeData(null);
      setCheckoutImage(null);
    }
  }, [isOpen, sessionId]);

  const fetchFee = async () => {
    setIsLoading(true);
    try {
      const res = await sessionService.calculateFee(sessionId);
      if (res.success) {
        setFeeData(res.data);
      }
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi tính phí');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setCheckoutImage(localUrl); // Optimistic UI
    setIsUploading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      // Assuming API_BASE_URL handles /upload/image
      const response: any = await apiClient.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.success && response.data?.imageUrl) {
        setCheckoutImage(response.data.imageUrl);
      }
    } catch (error: any) {
      toast.error('Lỗi khi tải ảnh lên, vui lòng thử lại.');
      setCheckoutImage(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCheckout = async () => {
    setIsSubmitting(true);
    try {
      const gateOut = sessionStorage.getItem('staff_gate_name') || 'Cổng Ra';
      const res = await paymentService.cashCheckout({
        sessionId,
        gateOut,
        checkOutImage: checkoutImage || undefined,
      });

      if (res.success) {
        toast.success('Đã checkout thành công!');
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-[18px] font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-gray-700" />
            Checkout Trực Tiếp
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              <p className="text-gray-500 font-medium">Đang tính phí...</p>
            </div>
          ) : feeData ? (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Phí gửi xe:</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(
                      feeData.details?.baseFee +
                        feeData.details?.overnightFee +
                        feeData.details?.overtimeFee || 0
                    )}
                  </span>
                </div>
                {feeData.details?.exceptionSurcharge > 0 && (
                  <div className="flex justify-between items-center text-sm text-red-600">
                    <span className="font-medium">Phụ phí sự cố:</span>
                    <span className="font-semibold">
                      +{formatCurrency(feeData.details.exceptionSurcharge)}
                    </span>
                  </div>
                )}
                {feeData.details?.lostCardFee > 0 && (
                  <div className="flex justify-between items-center text-sm text-orange-600">
                    <span className="font-medium">Phí mất thẻ:</span>
                    <span className="font-semibold">
                      +{formatCurrency(feeData.details.lostCardFee)}
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900">Tổng thu:</span>
                  <span className="text-xl font-black text-[#1d7a4a]">
                    {formatCurrency(feeData.totalFee)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ảnh xe lúc ra (Tùy chọn)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />

                {checkoutImage ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-gray-200 group">
                    <img
                      src={checkoutImage}
                      alt="Checkout"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium shadow-lg hover:bg-gray-50 transition-colors"
                      >
                        Chụp lại
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full aspect-video rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50"
                  >
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <Camera className="w-6 h-6 text-gray-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                          Nhấn để chụp ảnh (Không bắt buộc)
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-red-500">Không thể lấy thông tin phí</div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 h-12 border border-gray-200 bg-white rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleCheckout}
            disabled={isSubmitting || isLoading || !feeData || isUploading}
            className="flex-[2] h-12 bg-black text-[#9FE870] font-bold rounded-xl hover:bg-gray-900 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CreditCard className="w-5 h-5" />
            )}
            Xác nhận Thanh toán
          </button>
        </div>
      </div>
    </div>
  );
}
