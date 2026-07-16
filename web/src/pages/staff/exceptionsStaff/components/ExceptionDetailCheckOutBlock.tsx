import { useState, useEffect, useRef } from 'react';
import { Loader2, CheckCircle, RefreshCw, X, Camera } from 'lucide-react';
import { paymentService } from '../../../../services/payment.service';
import { sessionService } from '../../../../services/session.service';
import axios from 'axios';
import { toast } from 'sonner';
import { ExceptionData } from './ExceptionsList';

export function ExceptionDetailCheckOutBlock({
  selectedException,
  onCheckOutSuccess,
}: {
  selectedException: ExceptionData;
  onCheckOutSuccess?: () => void;
}) {
  const [fee, setFee] = useState<number>(0);
  const [feeDetails, setFeeDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [momoQR, setMomoQR] = useState<string | null>(null);
  const [momoSuccess, setMomoSuccess] = useState(false);
  const [transactionCode, setTransactionCode] = useState<string | null>(null);

  const [checkOutImageUrl, setCheckOutImageUrl] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchFee = async () => {
      try {
        const res = await sessionService.calculateFee(selectedException.sessionId);
        if (res.success) {
          setFee(res.data.totalFee);
          setFeeDetails((res.data as any).details);
        }
      } catch (error) {
        toast.error('Không thể tính phí check-out');
      } finally {
        setIsLoading(false);
      }
    };
    fetchFee();
  }, [selectedException.sessionId]);

  // Momo Polling
  useEffect(() => {
    if (transactionCode) {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await paymentService.checkStatus(transactionCode);
          if (res?.success && res?.data?.isPaid) {
            setMomoSuccess(true);
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setTimeout(() => {
              setMomoQR(null);
              setPaymentSuccess(true);
              setMomoSuccess(false);
              toast.success('Thanh toán thành công');
              onCheckOutSuccess?.();
            }, 2000);
          }
        } catch {}
      }, 3000);
    }
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [transactionCode]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingImage(true);
      const tempUrl = URL.createObjectURL(file);
      setCheckOutImageUrl(tempUrl);
      try {
        const formData = new FormData();
        formData.append('image', file);
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
        const res = await axios.post(`${API_BASE_URL}/upload/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (res.data.success && res.data.data?.imageUrl) {
          setCheckOutImageUrl(res.data.data.imageUrl);
        } else {
          toast.error('Lỗi khi tải ảnh lên, vui lòng thử lại!');
          setCheckOutImageUrl('');
        }
      } catch (err: any) {
        toast.error('Lỗi khi tải ảnh lên!');
        setCheckOutImageUrl('');
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const handleCashCheckOut = async () => {
    setIsSubmitting(true);
    try {
      const gateOut =
        sessionStorage.getItem('staff_gate_name') || `Cổng - ${selectedException.facilityName}`;
      const res = await paymentService.cashCheckout({
        sessionId: selectedException.sessionId,
        gateOut,
        checkOutImage: checkOutImageUrl || undefined,
      });
      if (res.success) {
        setPaymentSuccess(true);
        toast.success('Check-out bằng tiền mặt thành công');
        onCheckOutSuccess?.();
      }
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi check-out bằng tiền mặt');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMomoCheckOut = async () => {
    setIsSubmitting(true);
    try {
      const gateOut =
        sessionStorage.getItem('staff_gate_name') || `Cổng - ${selectedException.facilityName}`;
      const res = await paymentService.createIntent({
        sessionId: selectedException.sessionId,
        method: 'e_wallet',
        gateOut,
        checkOutImage: checkOutImageUrl || undefined,
      });
      if (res.success && (res.data?.qrCodeUrl || res.data?.paymentUrl)) {
        const finalQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(res.data.qrCodeUrl || res.data.paymentUrl)}`;
        setMomoQR(finalQrUrl);
        setTransactionCode(res.data.payment.transactionCode);
      } else {
        toast.error('Không thể tạo mã QR Momo!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi tạo giao dịch Momo!');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-[#f8f9fa] rounded-xl flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (paymentSuccess || selectedException.sessionStatus === 'COMPLETED') {
    return (
      <div className="p-4 bg-[#ECFCCB] rounded-xl border border-[#A3E635] flex items-center gap-3">
        <CheckCircle className="w-6 h-6 text-[#65a30d]" />
        <div>
          <h4 className="font-bold text-[#1A202C]">Xe đã được Check-out</h4>
          <p className="text-sm text-[#4d7c0f]">Phiên gửi xe đã hoàn tất.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-xl border border-[#e8e9e8] shadow-sm flex flex-col gap-4">
      {/* Upload Check-out Photo */}
      <div>
        <label className="block text-xs font-semibold text-[#060606] mb-2">
          Ảnh Check-out (Bắt buộc nếu yêu cầu)
        </label>
        <div className="relative">
          {!checkOutImageUrl ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
              className="w-full h-24 border-2 border-dashed border-[#e8e9e8] rounded-xl flex flex-col items-center justify-center gap-1.5 hover:border-[#1a1a1a] hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {isUploadingImage ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-[#1a1a1a]" />
                  <span className="text-xs font-medium text-[#6b6b6b]">Đang tải...</span>
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5 text-[#6b6b6b]" />
                  <span className="text-xs font-medium text-[#6b6b6b]">Chụp hoặc tải ảnh lên</span>
                </>
              )}
            </button>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-[#e8e9e8]">
              <img src={checkOutImageUrl} alt="Checkout" className="w-full h-32 object-cover" />
              <button
                onClick={() => setCheckOutImageUrl('')}
                className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
      </div>

      <div className="flex justify-between items-start pt-2 border-t border-[#f0f0f0]">
        <div>
          <h4 className="font-bold text-[#060606] text-[15px]">Thanh toán & Check-out</h4>
          <p className="text-xs text-[#6b6b6b] mt-0.5">
            Xác nhận thanh toán để hoàn tất phiên gửi xe.
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-[#060606] tabular-nums tracking-tight">
            {fee.toLocaleString('vi-VN')} ₫
          </div>
          {feeDetails && feeDetails.surcharge > 0 && (
            <div className="text-xs text-[#ea580c] font-medium mt-0.5">
              (Gồm {feeDetails.surcharge.toLocaleString('vi-VN')}đ phụ phí)
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleCashCheckOut}
          disabled={isSubmitting}
          className={`flex-1 h-11 font-bold rounded-[8px] transition-colors text-sm ${fee === 0 ? 'bg-[#A3E635] hover:bg-[#84CC16] text-[#1A202C]' : 'bg-[#e5e5e5] hover:bg-[#d4d4d4] text-[#060606]'}`}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
          ) : fee === 0 ? (
            'Mở barie (0đ)'
          ) : (
            'Thu Tiền Mặt'
          )}
        </button>
        <button
          onClick={handleMomoCheckOut}
          disabled={isSubmitting || fee === 0}
          className={`flex-1 h-11 font-bold rounded-[8px] transition-colors text-sm ${fee === 0 ? 'bg-[#fcfcfc] border border-[#e8e9e8] text-[#9b9b9b] cursor-not-allowed' : 'bg-[#A3E635] hover:bg-[#84CC16] text-[#1A202C]'}`}
        >
          QR MoMo
        </button>
      </div>

      {momoQR && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-white/95 backdrop-blur-sm">
          <div className="bg-white rounded-[16px] p-6 w-[90%] max-w-[360px] shadow-2xl border border-pink-100 flex flex-col items-center animate-in fade-in zoom-in duration-200">
            <h3 className="text-[16px] font-bold text-[#A50064] mb-1">Thanh toán Momo</h3>
            <p className="text-[11px] text-gray-500 mb-4 text-center">
              Quét mã QR để thanh toán <b>{fee.toLocaleString('vi-VN')} ₫</b>
            </p>
            <div className="bg-white p-2 rounded-xl border-2 border-pink-100 shadow-inner mb-4">
              <img src={momoQR} alt="Momo QR" className="w-40 h-40 object-contain" />
            </div>
            <div
              className={`flex items-center gap-2 text-[11px] font-medium mb-4 px-4 py-2 rounded-full ${momoSuccess ? 'text-green-600 bg-green-50' : 'text-[#A50064] bg-pink-50'}`}
            >
              {momoSuccess ? (
                <>✓ Thanh toán thành công!</>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Đang chờ thanh toán...
                </>
              )}
            </div>
            <button
              onClick={() => {
                setMomoQR(null);
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              }}
              className="w-full h-9 border border-gray-200 text-gray-600 font-bold text-[12px] rounded-[6px] hover:bg-gray-50"
            >
              Hủy giao dịch
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
