import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { ImagePlus, RefreshCw, X } from 'lucide-react';
import axios from 'axios';
import { sessionService, ParkingSession } from '../../../../services/session.service';
import { paymentService } from '../../../../services/payment.service';

interface CheckOutPanelProps {
  plate: string;
  onChangePlate: (plate: string) => void;
  onCheckOut: (data: any) => void;
  onSearch?: (session: any) => void;
  onFlagException?: () => void;
}

/** Client-side cleanup cho biển số xe sau khi OCR */
function formatPlate(raw: string): string {
  let s = raw.trim().toUpperCase();
  s = s.replace(/[^A-Z0-9\s.\-]/g, '');
  s = s.replace(/\s+/g, ' ').trim();
  s = s.replace(/^(\d{2})([A-Z])/, '$1-$2');
  return s;
}

export default function CheckOutPanel({
  plate,
  onChangePlate,
  onCheckOut,
  onSearch,
}: CheckOutPanelProps) {
  const [searchInput, setSearchInput] = useState('');
  const [searchMode, setSearchMode] = useState<'code' | 'plate'>('code');
  const [plateIn, setPlateIn] = useState('');
  const [vehicleTypeName, setVehicleTypeName] = useState('Không có dữ liệu');
  const [_checkInTimeDisplay, setCheckInTimeDisplay] = useState('Không có dữ liệu');
  const [step, setStep] = useState<'SEARCH' | 'CONFIRM' | 'OPEN' | 'MISMATCH'>('SEARCH');
  const [currentSession, setCurrentSession] = useState<ParkingSession | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [ocrPreviewUrl, setOcrPreviewUrl] = useState<string | null>(null);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [checkoutImageUrl, setCheckoutImageUrl] = useState<string | null>(null);
  const [isNoPlateVehicle, setIsNoPlateVehicle] = useState(false);
  const [manualConfirmed, setManualConfirmed] = useState(false);

  // Momo States
  const [momoQR, setMomoQR] = useState<string | null>(null);
  const [_transactionCode, setTransactionCode] = useState<string | null>(null);
  const [_isPolling, setIsPolling] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setOcrPreviewUrl(localUrl);
    setOcrSuccess(false);
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

      if (isNoPlateVehicle) {
        // Xe không biển số: chỉ upload ảnh
        const response = await axios.post(`${API_BASE_URL}/upload/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (response.data.success && response.data.data?.imageUrl) {
          setCheckoutImageUrl(response.data.data.imageUrl);
          // toast.success('Đã chụp ảnh xe ra (lưu server)!');
        } else {
          setCheckoutImageUrl(localUrl);
          // toast.success('Đã chụp ảnh xe ra (lưu local)!');
        }
      } else {
        const response = await axios.post(`${API_BASE_URL}/alpr/scan`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (response.data.success && response.data.data.normalizedPlate) {
          const fp = formatPlate(response.data.data.normalizedPlate);

          if (step === 'SEARCH') {
            if (searchMode === 'plate') {
              setSearchInput(fp);
              onChangePlate(fp);
              handleSearch(fp, 'plate');
            } else {
              // mode code -> just fill plate out, wait for card input
              onChangePlate(fp);
            }
          } else if (step === 'CONFIRM') {
            onChangePlate(fp);
            if (fp.toUpperCase() !== plateIn.toUpperCase()) {
              toast.error(`CẢNH BÁO: Biển số xe ra (${fp}) KHÔNG KHỚP với lúc vào (${plateIn})!`, {
                duration: 5000,
              });
            } else {
              // toast.success(`Hợp lệ: Biển số xe ra khớp với lúc vào (${fp})`);
            }
          }

          setOcrSuccess(true);
          if (response.data.data.imageUrl) {
            setCheckoutImageUrl(response.data.data.imageUrl);
          }
        } else {
          // toast.warning(response.data.message || 'Không nhận dạng được. Nhập tay.');
        }
      }
    } catch (error: any) {
      if (isNoPlateVehicle) {
        setCheckoutImageUrl(localUrl);
        // toast.success('Đã chụp ảnh xe ra (lưu local)!');
      } else {
        // toast.error(error.message || 'Lỗi xử lý ảnh.');
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const clearOcrPreview = () => {
    setOcrPreviewUrl(null);
    setCheckoutImageUrl(null);
    setOcrSuccess(false);
  };

  // ─── Hotkeys ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onF10 = () => handleReset();
    const onF2 = (e: KeyboardEvent) => {
      if (step === 'CONFIRM' && !isSubmitting) {
        e.preventDefault();
        handleCashCheckOut();
      }
    };
    const onF3 = (e: KeyboardEvent) => {
      if (step === 'CONFIRM' && !isSubmitting && !momoQR) {
        e.preventDefault();
        handleMomoCheckOut();
      }
    };

    const onEnter = (e: KeyboardEvent) => {
      if (e.code === 'Enter') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        if (step === 'SEARCH') {
          handleSearch();
        } else if (step === 'CONFIRM') {
          if (!isSubmitting && !momoQR) handleCashCheckOut();
        }
      }
    };

    window.addEventListener('keydown', onEnter);
    window.addEventListener('HOTKEY_F10', onF10);
    window.addEventListener('keydown', (e) => e.key === 'F2' && onF2(e));
    window.addEventListener('keydown', (e) => e.key === 'F3' && onF3(e));
    return () => {
      window.removeEventListener('keydown', onEnter);
      window.removeEventListener('HOTKEY_F10', onF10);
      window.removeEventListener('keydown', (e) => e.key === 'F2' && onF2(e));
      window.removeEventListener('keydown', (e) => e.key === 'F3' && onF3(e));
    };
  }, [step, isSubmitting, searchInput, searchMode, currentSession, plate, plateIn, momoQR]);

  // ─── Terminal session info ──────────────────────────────────────────────────
  const building = sessionStorage.getItem('staff_facility_name') || 'Chưa chọn Toà nhà';
  const gateOut = sessionStorage.getItem('staff_gate_name') || `Cổng - ${building}`;

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleSearch = async (overrideQuery?: string, overrideMode?: 'code' | 'plate') => {
    const query = (typeof overrideQuery === 'string' ? overrideQuery : searchInput).trim();
    const mode = overrideMode || searchMode;
    if (!query) {
      toast.error(mode === 'code' ? 'Vui lòng nhập mã thẻ!' : 'Vui lòng nhập biển số xe!');
      return;
    }
    setIsSubmitting(true);
    try {
      const params = mode === 'code' ? { cardCode: query } : { licensePlate: query };
      const res = await sessionService.searchSession(params);
      if (res.success && res.data) {
        const session = res.data;
        setCurrentSession(session);
        setPlateIn(session.licensePlate);
        const vehicleTypeObj = session.vehicleTypeId as any;
        setVehicleTypeName(vehicleTypeObj?.name || 'Không xác định');
        setIsNoPlateVehicle(vehicleTypeObj?.requiresPlate === false);
        const checkInTimeStr = new Date(session.checkInTime).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        });
        setCheckInTimeDisplay(checkInTimeStr);
        // toast.success(searchMode === "plate" ? "Đã tìm thấy thông tin đỗ xe qua Biển số!" : "Đã tìm thấy thông tin vé!");

        // Fetch fee immediately
        const feeRes = await sessionService.calculateFee(session._id);
        let fee = 0;
        let feeDetails = null;
        if (feeRes.success) {
          fee = feeRes.data.totalFee;
          feeDetails = (feeRes.data as any).details ?? null;
        }

        const checkOutTimeStr = new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        });
        const checkOutDateStr = new Date().toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });

        if (onCheckOut) {
          onCheckOut({
            ticketCode: session.code || '—',
            plateIn: session.licensePlate,
            plateOut: mode === 'plate' ? query : plate,
            checkInTime: checkInTimeStr,
            checkOutTime: checkOutTimeStr,
            checkInDate: new Date(session.checkInTime).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }),
            checkOutDate: checkOutDateStr,
            gateIn: session.gateIn || '—',
            gateOut: gateOut.trim(),
            fee,
            feeDetails: feeDetails,
            paymentStatus: 'Chưa thanh toán',
            rawCheckInTime: session.checkInTime,
          });
        }

        setStep('CONFIRM');
        if (onSearch) onSearch(session);

        // So sánh trực tiếp plateOut với plateIn của session
        const actualPlateOut = mode === 'plate' ? query : plate;
        const isNoPlate = vehicleTypeObj?.requiresPlate === false;
        if (!isNoPlate && actualPlateOut.toUpperCase() !== session.licensePlate.toUpperCase()) {
          toast.error(
            `CẢNH BÁO: Biển số xe ra (${actualPlateOut || 'Trống'}) KHÔNG KHỚP với lúc vào (${session.licensePlate})!`,
            { duration: 5000 }
          );
        } else {
          // toast.success(`Hợp lệ: Biển số xe ra khớp với lúc vào (${actualPlateOut})`);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Không tìm thấy trong hệ thống!');
      setPlateIn('');
      setVehicleTypeName('Không có dữ liệu');
      setCurrentSession(null);
      if (onSearch) onSearch(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const finishCheckOutProcess = (checkOutResData: any, methodStr: string) => {
    const actualCheckOutTime = checkOutResData.checkOutTime
      ? new Date(checkOutResData.checkOutTime).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const actualCheckOutDate = checkOutResData.checkOutTime
      ? new Date(checkOutResData.checkOutTime).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : new Date().toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });

    onCheckOut((prev: any) => ({
      ...prev,
      checkOutTime: actualCheckOutTime,
      checkOutDate: actualCheckOutDate,
      paymentStatus: methodStr,
    }));

    handleReset();

    setTimeout(() => {
      onCheckOut(null);
    }, 2000);
  };

  const validateMismatch = () => {
    const isMismatch = !isNoPlateVehicle && plate.toUpperCase() !== plateIn.toUpperCase();
    if (isMismatch && !manualConfirmed) {
      toast.error('LỖI: Biển số xe ra KHÔNG KHỚP với biển số vào. Xác nhận thủ công trước!');
      return false;
    }
    return true;
  };

  const handleCashCheckOut = async () => {
    if (step === 'CONFIRM') {
      if (!currentSession) return;
      if (!validateMismatch()) return;

      setIsSubmitting(true);
      try {
        const checkOutRes = await paymentService.cashCheckout({
          sessionId: currentSession._id,
          gateOut: gateOut.trim(),
          checkOutImage: checkoutImageUrl || undefined,
        });
        if (checkOutRes.success) {
          toast.success('Đã thu tiền mặt & mở barie xe ra thành công!');
          finishCheckOutProcess(checkOutRes.data, 'Tiền mặt');
        }
      } catch (error: any) {
        toast.error(error.message || 'Lỗi khi check-out bằng tiền mặt!');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleMomoCheckOut = async () => {
    if (step === 'CONFIRM') {
      if (!currentSession) return;
      if (!validateMismatch()) return;

      setIsSubmitting(true);
      try {
        const res = await paymentService.createIntent({
          sessionId: currentSession._id,
          method: 'e_wallet',
        });

        if (res.success && (res.data?.qrCodeUrl || res.data?.paymentUrl)) {
          // Momo qrCodeUrl is actually a raw EMVCo string or payUrl. We MUST generate an image from it.
          const qrContent = res.data.qrCodeUrl || res.data.paymentUrl;
          const finalQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrContent)}`;
          setMomoQR(finalQrUrl);
          setTransactionCode(res.data.payment.transactionCode);
          setIsPolling(true);

          // Start polling
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = setInterval(async () => {
            try {
              const statusRes = await paymentService.checkStatus(res.data.payment.transactionCode);
              if (statusRes.data?.isPaid) {
                // Success!
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                toast.success('Khách đã thanh toán Momo thành công!');

                setMomoQR(null); // Clear modal

                // Perform final checkout logically (the backend already closed the session via webhook/polling)
                // We just need to update UI. We mock the checkout time for UI since it's already closed.
                const mockSessionForUI = {
                  ...currentSession,
                  checkOutTime: new Date().toISOString(),
                };
                finishCheckOutProcess(mockSessionForUI, 'Momo');
              }
            } catch (err) {
              console.error('Polling error', err);
            }
          }, 3000);
        } else {
          toast.error('Không thể tạo mã QR Momo!');
        }
      } catch (error: any) {
        toast.error(error.message || 'Lỗi khi tạo giao dịch Momo!');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (step === 'SEARCH') {
        if (!searchInput || !ocrPreviewUrl) {
          toast.warning('Vui lòng chụp ảnh xe ra trước khi tìm kiếm!');
          return;
        }
        handleSearch();
      } else {
        handleCashCheckOut();
      }
    }
  };

  const handleReset = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setMomoQR(null);
    setIsPolling(false);
    setTransactionCode(null);
    setStep('SEARCH');
    setSearchInput('');
    setPlateIn('');
    onChangePlate('');
    setCurrentSession(null);
    setVehicleTypeName('Không có dữ liệu');
    setCheckInTimeDisplay('Không có dữ liệu');
    setOcrPreviewUrl(null);
    setOcrSuccess(false);
    setManualConfirmed(false);
    setIsNoPlateVehicle(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onSearch) onSearch(null);
    if (onCheckOut) onCheckOut(null);
  };

  useEffect(() => {
    window.addEventListener('RESET_CHECKOUT', handleReset);
    return () => window.removeEventListener('RESET_CHECKOUT', handleReset);
  }, []);

  // ─── Render ─────────────────────────────────────────────────────────────────
  const isMismatch = step === 'CONFIRM' && plate.toUpperCase() !== plateIn.toUpperCase();
  const isException = currentSession?.status === 'exception';

  return (
    <div className="flex flex-col bg-white rounded-[16px] border border-[#e8e9e8] shadow-lg shadow-[#9FE870]/20 px-5 pt-4 pb-4 h-full min-h-0 overflow-hidden">
      <h2 className="text-[17px] font-bold text-[#060606] mb-3 shrink-0">Đăng Ký Xe Ra</h2>

      <div className="flex flex-col gap-4 flex-1 min-h-0">
        {/* Row 1: Toà nhà + Cổng trực */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#6b6b6b] mb-1">Toà nhà</label>
            <input
              type="text"
              value={building}
              readOnly
              className="w-full h-8 px-3 bg-[#f5f5f4] border border-[#e8e9e8] rounded-[6px] text-[#6b6b6b] text-[12px] font-medium cursor-not-allowed outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#6b6b6b] mb-1">Cổng trực</label>
            <input
              type="text"
              value={gateOut}
              readOnly
              className="w-full h-8 px-3 bg-[#f5f5f4] border border-[#e8e9e8] rounded-[6px] text-[#6b6b6b] text-[12px] font-medium cursor-not-allowed outline-none"
            />
          </div>
        </div>

        {/* Row 2: Ảnh biển số Vào + Ảnh biển số Ra */}
        <div className="flex gap-4 flex-1 min-h-0">
          <div className="flex-1 flex flex-col gap-1 min-h-0">
            <label className="block text-[11px] font-semibold text-[#6b6b6b]">
              Ảnh biển số Vào
            </label>
            <div className="flex-1 border-2 border-dashed border-[#e8e9e8] rounded-[6px] flex flex-col items-center justify-center gap-2 bg-[#fdfdfd] overflow-hidden relative">
              {currentSession?.checkInImage ? (
                (() => {
                  const SERVER_URL = (
                    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'
                  ).replace(/\/api\/v1\/?$/, '');
                  let imgSrc = currentSession.checkInImage;
                  if (!imgSrc.startsWith('http')) {
                    const cleanPath = imgSrc.startsWith('/') ? imgSrc : `/${imgSrc}`;
                    imgSrc = `${SERVER_URL}${cleanPath}`;
                  }
                  return (
                    <img src={imgSrc} alt="check-in" className="w-full h-full object-contain" />
                  );
                })()
              ) : (
                <div className="flex flex-col items-center opacity-60">
                  <img src="/Logo_chu.png" alt="LYNC PARK" className="h-14 mb-3 object-contain" />
                  <ImagePlus className="w-4 h-4 text-[#6b6b6b] mb-3" />
                  <span className="text-[10px] font-semibold text-[#6b6b6b]">
                    Ảnh biển số (OCR)
                  </span>
                  <span className="text-[9px] text-[#aaa]">Chưa có dữ liệu</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-1 min-h-0 relative">
            <label className="block text-[11px] font-semibold text-[#6b6b6b]">Ảnh biển số Ra</label>
            {!ocrPreviewUrl ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex-1 border-2 border-dashed border-[#c8c9c8] rounded-[6px] flex flex-col items-center justify-center gap-2 hover:border-[#9FE870] hover:bg-[#f5ffe8] transition-all duration-200 disabled:opacity-60"
              >
                {isUploading ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-[#8bc34a]" />
                ) : (
                  <div className="flex flex-col items-center">
                    <img src="/Logo_chu.png" alt="LYNC PARK" className="h-14 mb-3 object-contain" />
                    <ImagePlus className="w-4 h-4 text-[#6b6b6b] mb-3" />
                    <span className="text-[10px] font-semibold text-[#6b6b6b]">
                      Chụp / Upload ảnh biển số (OCR)
                    </span>
                    <span className="text-[9px] text-[#aaa]">
                      Hỗ trợ JPG, PNG — chụp thẳng góc, đủ sáng
                    </span>
                  </div>
                )}
              </button>
            ) : (
              <div className="relative border border-[#e8e9e8] rounded-[6px] overflow-hidden flex-1 bg-[#f5f5f4]">
                <img src={ocrPreviewUrl} alt="preview" className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={clearOcrPreview}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/70 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5" />
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

        {/* Row 3: Mã thẻ từ/vé + Loại xe + Trạng thái OCR */}
        <div className="grid grid-cols-2 gap-4 items-end">
          <div className="flex flex-col gap-1 relative">
            <div className="flex justify-between w-full">
              <label className="text-[11px] font-semibold text-[#060606]">
                {searchMode === 'code' ? 'Mã thẻ từ/vé' : 'Biển số xe (tìm kiếm)'}
              </label>
              <button
                onClick={() => {
                  setSearchMode((m) => (m === 'code' ? 'plate' : 'code'));
                  setSearchInput('');
                }}
                className="text-[9px] text-[#1a1a1a] underline whitespace-nowrap hover:no-underline font-medium"
              >
                {searchMode === 'code' ? 'Khách mất thẻ? Tìm theo biển số' : 'Quay lại tìm mã thẻ'}
              </button>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder={searchMode === 'code' ? 'VD: CARD-1A2B-3C4D' : 'VD: 29A-12345'}
              disabled={isSubmitting || step !== 'SEARCH'}
              className="w-full h-8 px-3 border border-[#e8e9e8] rounded-[6px] text-[12px] font-medium outline-none focus:border-[#060606] disabled:opacity-50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-[#060606]">Loại xe</label>
              <input
                type="text"
                value={vehicleTypeName}
                readOnly
                className="w-full h-8 px-3 bg-[#f5f5f4] border border-[#e8e9e8] rounded-[6px] text-[#6b6b6b] text-[12px] font-medium cursor-not-allowed outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-[#060606]">Trạng thái OCR</label>
              <div
                className={`w-full h-8 rounded-[6px] text-[12px] font-bold flex items-center justify-center border transition-colors ${
                  ocrSuccess
                    ? isMismatch
                      ? 'bg-[#fef2f2] text-[#ef4444] border-[#fca5a5]'
                      : 'bg-[#9FE870]/20 text-[#2d6a1f] border-[#9FE870]'
                    : 'bg-[#f5f5f4] text-[#a8a29e] border-[#e8e9e8]'
                }`}
              >
                {ocrSuccess
                  ? isMismatch
                    ? '✕ Không khớp biển số'
                    : '✓ Quét thành công'
                  : 'Chưa quét'}
              </div>
            </div>
          </div>
        </div>

        {/* Row 4: Biển số xe ra (Input for plate) */}
        <div className="flex flex-col gap-1 shrink-0">
          <label className="block text-[11px] font-semibold text-[#060606]">Biển số xe ra</label>
          <input
            type="text"
            value={isNoPlateVehicle ? 'KBS-AUTO' : plate}
            onChange={(e) => onChangePlate(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            disabled={step === 'SEARCH' || isSubmitting || isNoPlateVehicle}
            className={`w-full h-12 text-[20px] font-mono px-3 border rounded-[6px] uppercase font-bold outline-none transition-all duration-200
              ${
                step === 'CONFIRM'
                  ? isNoPlateVehicle || isException
                    ? 'bg-[#fff7ed] border-[#ea580c] text-[#ea580c] focus:border-[#c2410c]'
                    : isMismatch
                      ? 'bg-[#fef2f2] border-[#ef4444] text-[#ef4444] focus:border-[#dc2626]'
                      : 'bg-[#9FE870]/30 border-[#9FE870] text-[#062F28] focus:ring-2 focus:ring-[#9FE870]/40'
                  : 'bg-[#f5f5f4] border-[#e8e9e8] text-[#9b9b9b]'
              }`}
            placeholder="XXX-XX-XXXXX"
          />
          {step === 'CONFIRM' && isMismatch && (
            <label className="flex items-center gap-2 mt-1 cursor-pointer bg-red-50 p-2 rounded-md border border-red-200">
              <input
                type="checkbox"
                className="w-4 h-4 text-red-600 rounded border-gray-300"
                checked={manualConfirmed}
                onChange={(e) => setManualConfirmed(e.target.checked)}
              />
              <span className="text-sm font-semibold text-red-700">
                Xác nhận khớp xe thủ công (Bắt buộc)
              </span>
            </label>
          )}

          {/* Payment Actions */}
          {step === 'CONFIRM' && (
            <div className="mt-3">
              <div className="flex gap-3">
                <button
                  onClick={handleCashCheckOut}
                  disabled={isSubmitting}
                  className="flex-1 h-12 bg-[#9FE870] hover:bg-[#8bc34a] text-[#062F28] font-bold rounded-[8px] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  [F2 / Enter] Thu Tiền Mặt
                </button>
                <button
                  onClick={handleMomoCheckOut}
                  disabled={isSubmitting}
                  className="flex-1 h-12 bg-[#A50064] hover:bg-[#8a0053] text-white font-bold rounded-[8px] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  [F3] Quét QR Momo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Momo QR Modal Overlay */}
      {momoQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[16px] p-6 w-[400px] max-w-[90%] shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-[#A50064] mb-1">Thanh toán Momo</h3>
            <p className="text-sm text-gray-500 mb-4 text-center">
              Tài xế sử dụng ứng dụng Momo hoặc ứng dụng ngân hàng để quét mã QR dưới đây
            </p>

            <div className="bg-white p-3 rounded-xl border-2 border-pink-100 shadow-inner mb-4">
              <img src={momoQR} alt="Momo QR Code" className="w-56 h-56 object-contain" />
            </div>

            <div className="flex items-center gap-2 text-sm text-[#A50064] font-medium mb-6 bg-pink-50 px-4 py-2 rounded-full">
              <RefreshCw className="w-4 h-4 animate-spin" /> Đang chờ khách thanh toán...
            </div>

            <button
              onClick={() => {
                setMomoQR(null);
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              }}
              className="w-full h-11 border-2 border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" /> Hủy giao dịch Momo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
