import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { ImagePlus, RefreshCw, X, Building2, DoorOpen } from 'lucide-react';
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
  onFlagException,
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
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [panelMsg, setPanelMsg] = useState<{text: string, type: 'error'|'success'|'warning'} | null>(null);

  const showMsg = (text: string, type: 'error'|'success'|'warning' = 'error') => {
    setPanelMsg({ text, type });
    setTimeout(() => {
      setPanelMsg(prev => prev?.text === text ? null : prev);
    }, 5000);
  };

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
              showMsg(`CẢNH BÁO: Biển số xe ra (${fp}) KHÔNG KHỚP với lúc vào (${plateIn})!`);
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
        if (paymentSuccess) {
          setPaymentSuccess(false);
          handleReset();
          if (onCheckOut) onCheckOut(null);
        } else if (step === 'SEARCH') {
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
  }, [step, isSubmitting, searchInput, searchMode, currentSession, plate, plateIn, momoQR, paymentSuccess]);

  // ─── Terminal session info ──────────────────────────────────────────────────
  const building = sessionStorage.getItem('staff_facility_name') || 'Chưa chọn Toà nhà';
  const gateOut = sessionStorage.getItem('staff_gate_name') || `Cổng - ${building}`;

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleSearch = async (overrideQuery?: string, overrideMode?: 'code' | 'plate') => {
    const query = (typeof overrideQuery === 'string' ? overrideQuery : searchInput).trim();
    const mode = overrideMode || searchMode;
    if (!query) {
      showMsg(mode === 'code' ? 'Vui lòng nhập mã thẻ!' : 'Vui lòng nhập biển số xe!');
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
            zone: `${(session.floorId as any)?.name || "Tầng Auto"} - Slot: ${(session.slotId as any)?.code || "Slot Auto"}`,
          });
        }

        setStep('CONFIRM');
        if (onSearch) onSearch(session);

        // So sánh trực tiếp plateOut với plateIn của session
        const actualPlateOut = mode === 'plate' ? query : plate;
        const isNoPlate = vehicleTypeObj?.requiresPlate === false;
        if (!isNoPlate && actualPlateOut.toUpperCase() !== session.licensePlate.toUpperCase()) {
          showMsg(`CẢNH BÁO: Biển số xe ra (${actualPlateOut || 'Trống'}) KHÔNG KHỚP với lúc vào (${session.licensePlate})!`);
        } else {
          // toast.success(`Hợp lệ: Biển số xe ra khớp với lúc vào (${actualPlateOut})`);
        }
      }
    } catch (error: any) {
      showMsg(error.message || 'Không tìm thấy trong hệ thống!');
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

    setPaymentSuccess(true);
  };

  const validateMismatch = () => {
    const isMismatch = !isNoPlateVehicle && plate.toUpperCase() !== plateIn.toUpperCase();
    if (isMismatch && !manualConfirmed) {
      showMsg("LỖI: Biển số xe ra KHÔNG KHỚP với biển số vào. Xác nhận thủ công trước!");
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
          showMsg("Đã thu tiền mặt & mở barie xe ra thành công!", "success");
          finishCheckOutProcess(checkOutRes.data, 'Tiền mặt');
        }
      } catch (error: any) {
        showMsg(error.message || 'Lỗi khi check-out bằng tiền mặt!');
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
          method: 'e_wallet'
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
                showMsg("Khách đã thanh toán Momo thành công!", "success");

                setMomoQR(null); // Clear modal

                // Perform final checkout logically (the backend already closed the session via webhook/polling)
                // We just need to update UI. We mock the checkout time for UI since it's already closed.
                const mockSessionForUI = {
                  ...currentSession,
                  checkOutTime: new Date().toISOString()
                };
                finishCheckOutProcess(mockSessionForUI, 'Momo');
              }
            } catch (err) {
              console.error("Polling error", err);
            }
          }, 3000);
        } else {
          showMsg("Không thể tạo mã QR Momo!");
        }
      } catch (error: any) {
        showMsg(error.message || 'Lỗi khi tạo giao dịch Momo!');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (paymentSuccess) {
        setPaymentSuccess(false);
        handleReset();
        if (onCheckOut) onCheckOut(null);
      } else if (step === 'SEARCH') {
        if (!searchInput || !ocrPreviewUrl) {
          showMsg('Vui lòng chụp ảnh xe ra trước khi tìm kiếm!', 'warning');
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
    setPaymentSuccess(false);
    setPanelMsg(null);
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
  const isMismatch = step === 'CONFIRM' && !isNoPlateVehicle && plate.toUpperCase() !== plateIn.toUpperCase();
  const isException = currentSession?.status === 'exception';

  return (
    <div className="flex flex-col h-full min-h-0 relative">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-[20px] shrink-0">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-md border border-[#A3E635]/50 bg-[#ECFCCB] flex items-center justify-center text-[#65A30D] shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="text-[14px] font-bold text-[#060606] uppercase leading-tight tracking-tight truncate">Đăng Ký Xe Ra</h2>
            <div className="flex items-center gap-1.5 text-[10px] text-[#888] font-medium mt-0.5 whitespace-nowrap overflow-hidden">
              <span className="flex items-center gap-1 truncate"><Building2 className="w-3 h-3 text-[#aaa] shrink-0" /> <span className="truncate">Tòa nhà: {building}</span></span>
              <span className="text-[#ccc] shrink-0">|</span>
              <span className="flex items-center gap-1 truncate"><DoorOpen className="w-3 h-3 text-[#aaa] shrink-0" /> <span className="truncate">Cổng: {gateOut}</span></span>
            </div>
          </div>
        </div>

        {/* Trạng thái Tìm kiếm / OCR */}
        <div className="flex-none ml-3">
          <div className={`h-7 px-3 rounded-[4px] text-[12px] font-bold flex items-center justify-center transition-colors ${currentSession ? 'bg-[#ECFCCB] text-[#1A202C] border border-[#A3E635]' : 'bg-[#f9f9f9] text-[#888] border border-[#e8e9e8]'
            }`}>
            {currentSession ? '✓ Đã tìm thấy vé' : '● Chưa quét'}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 flex-1 min-h-0">

        {/* Row 1: Ảnh biển số Vào + Ảnh biển số Ra */}
        <div className="flex gap-3 relative shrink-0">
          {/* Badge Khớp / Không khớp */}
          {step === 'CONFIRM' && !isMismatch && !isNoPlateVehicle && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#A3E635] text-[#1A202C] px-4 py-1 rounded-[4px] font-bold text-[12px] z-10 shadow-sm border border-[#84CC16]">
              Khớp
            </div>
          )}
          {step === 'CONFIRM' && isMismatch && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#EF4444] text-white px-4 py-1 rounded-[4px] font-bold text-[12px] z-10 shadow-sm border border-[#DC2626]">
              Không khớp
            </div>
          )}

          <div className="flex-1 flex flex-col gap-1.5 min-h-0">
            <label className="block text-[10px] font-semibold text-[#6b6b6b]">Ảnh biển số vào</label>
            <div className="h-[210px] w-full border border-dashed border-[#999] rounded-[6px] flex flex-col items-center justify-center gap-2 bg-[#fdfdfd] overflow-hidden relative">
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
                  return <img src={imgSrc} alt="check-in" className="w-full h-full object-contain" />;
                })()
              ) : (
                <div className="flex flex-col items-center">
                  <img src="/Logo_chu.png" alt="LYNC PARK" className="h-16 mb-2 object-contain" />
                  <ImagePlus className="w-4 h-4 text-[#6b6b6b] mb-2" />
                  <span className="text-[10px] font-semibold text-[#6b6b6b]">Ảnh biển số (OCR)</span>
                  <span className="text-[9px] text-[#aaa]">Chưa có dữ liệu</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-1.5 relative min-h-0">
            <label className="block text-[10px] font-semibold text-[#6b6b6b]">Ảnh biển số ra</label>
            {!ocrPreviewUrl ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="h-[210px] w-full border border-dashed border-[#999] rounded-[6px] flex flex-col items-center justify-center gap-2 hover:border-[#A3E635] hover:bg-[#ECFCCB] transition-all duration-200 disabled:opacity-60 bg-[#fcfcfc]"
              >
                {isUploading ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-[#8bc34a]" />
                ) : (
                  <div className="flex flex-col items-center">
                    <img src="/Logo_chu.png" alt="LYNC PARK" className="h-16 mb-2 object-contain" />
                    <ImagePlus className="w-4 h-4 text-[#aaa] mb-2" />
                    <span className="text-[10px] font-semibold text-[#6b6b6b]">Chụp / Upload ảnh biển số (OCR)</span>
                    <span className="text-[9px] text-[#aaa]">Hỗ trợ JPG, PNG — chụp thẳng góc, đủ sáng</span>
                  </div>
                )}
              </button>
            ) : (
              <div className="relative border border-[#e8e9e8] rounded-[6px] overflow-hidden h-[200px] bg-[#f5f5f4]">
                <img src={ocrPreviewUrl} alt="preview" className="w-full h-full object-contain" />
                <button type="button" onClick={clearOcrPreview} className="absolute top-2 right-2 w-6 h-6 bg-black/70 text-white rounded-full flex items-center justify-center"><X className="w-3.5 h-3.5" /></button>
              </div>
            )}
            <input type="file" accept="image/*" capture="environment" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
          </div>
        </div>

        {/* Row 2: Biển số xe vào & Biển số xe ra */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div className="flex flex-col gap-1">
            <label className="block text-[10px] font-semibold text-[#060606]">Biển số xe vào</label>
            <input type="text" value={plateIn} readOnly
              className="w-full h-9 text-[18px] text-center font-mono px-3 border border-[#e8e9e8] bg-[#ECFCCB] rounded-[6px] uppercase font-bold outline-none text-[#1A202C] cursor-not-allowed"
              placeholder="XXX-XX-XXXXX" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-[10px] font-semibold text-[#060606]">Biển số xe ra</label>
            <input
              type="text"
              value={isNoPlateVehicle ? "KBS-AUTO" : plate}
              onChange={(e) => onChangePlate(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              disabled={step === 'SEARCH' || isSubmitting || isNoPlateVehicle}
              className={`w-full h-9 text-[18px] text-center font-mono px-3 border rounded-[6px] uppercase font-bold outline-none transition-all duration-200
                ${(!plate && !isNoPlateVehicle)
                  ? 'bg-[#fdfdfd] border-[#e8e9e8] text-[#9b9b9b] focus:border-[#A3E635]'
                  : step === 'CONFIRM'
                    ? (isNoPlateVehicle || isException
                      ? 'bg-[#fff7ed] border-[#ea580c] text-[#ea580c] focus:border-[#c2410c]'
                      : isMismatch
                        ? 'bg-[#FEE2E2] border-[#EF4444] text-[#EF4444] focus:border-[#DC2626]'
                        : 'bg-[#ECFCCB] border-[#A3E635] text-[#1A202C] focus:border-[#84CC16]')
                    : 'bg-[#fdfdfd] border-[#e8e9e8] text-[#9b9b9b]'
                }`}
              placeholder="XXX-XX-XXXXX"
            />
          </div>
        </div>

        {/* Row 3: Mã thẻ từ/vé | Loại xe | Nhập lại biển ra */}
        <div className="grid grid-cols-3 gap-2 mt-1 items-end">
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-1.5 w-full overflow-hidden">
              <label className="text-[10px] font-semibold text-[#060606] whitespace-nowrap shrink-0">
                Mã thẻ từ/vé
              </label>
              <button
                onClick={() => {
                  setSearchMode((m) => (m === 'code' ? 'plate' : 'code'));
                  setSearchInput('');
                }}
                className="text-[9px] text-[#2c4015] underline whitespace-nowrap hover:no-underline font-medium truncate"
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
              className="w-full h-7 px-3 border border-[#e8e9e8] bg-[#fdfdfd] rounded-[6px] text-[10px] font-medium outline-none focus:border-[#A3E635] disabled:opacity-50"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-[10px] font-semibold text-[#060606]">Loại xe</label>
            <input
              type="text"
              value={vehicleTypeName}
              readOnly
              className="w-full h-7 px-3 bg-[#fdfdfd] border border-[#e8e9e8] rounded-[6px] text-[#333] text-[10px] font-medium cursor-not-allowed outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-[10px] font-semibold text-[#060606]">Nhập lại biển ra</label>
            <input type="text" placeholder="F5 để nhập lại" value={plate} onChange={e => onChangePlate(e.target.value.toUpperCase())}
              className="w-full h-7 px-3 bg-white border border-[#e8e9e8] rounded-[6px] text-[#333] text-[10px] font-medium outline-none focus:border-[#A3E635]" />
          </div>
        </div>

        {/* Row 4: Payment Actions / Status - Always visible */}
        {!paymentSuccess && (
          <div className="flex flex-col gap-1 mt-1">
            <label className="block text-[10px] font-semibold text-[#060606]">
              {panelMsg ? 'Trạng thái' : step === 'CONFIRM' && !isMismatch && !isNoPlateVehicle ? 'Phương thức thanh toán' : 'Trạng thái'}
            </label>
            {panelMsg ? (
              <button
                onClick={() => setPanelMsg(null)}
                className={`w-full h-7 rounded-[6px] font-bold text-[11px] flex items-center justify-center transition-all ${
                  panelMsg.type === 'error' ? 'bg-[#FEE2E2] text-[#EF4444] border border-[#EF4444]' : 
                  panelMsg.type === 'warning' ? 'bg-[#fff8e1] text-[#f57f17] border border-[#fbc02d]' :
                  'bg-[#ECFCCB] text-[#1A202C] border border-[#A3E635]'
                }`}
              >
                {panelMsg.text}
              </button>
            ) : step === 'CONFIRM' && isMismatch ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onFlagException) onFlagException();
                }}
                className="w-full h-7 rounded-[6px] font-bold text-[11px] flex items-center justify-center transition-all bg-[#EF4444] text-white border border-[#DC2626] hover:bg-[#DC2626]"
              >
                Cảnh báo không khớp (F9)
              </button>
            ) : step === 'CONFIRM' && isNoPlateVehicle ? (
              <button
                onClick={handleCashCheckOut}
                disabled={isSubmitting}
                className="w-full h-7 rounded-[6px] font-bold text-[11px] flex items-center justify-center transition-all bg-[#A3E635] text-[#1A202C] hover:bg-[#84CC16] border border-[#A3E635]"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận xe ra'}
              </button>
            ) : step === 'CONFIRM' ? (
              <div className="flex gap-2">
                <button
                  onClick={handleCashCheckOut}
                  disabled={isSubmitting}
                  className="flex-1 h-7 font-bold rounded-[6px] transition-colors text-[11px] bg-[#dcdcdc] hover:bg-[#c9c9c9] text-[#333]"
                >
                  Tiền Mặt
                </button>
                <button
                  onClick={handleMomoCheckOut}
                  disabled={isSubmitting}
                  className="flex-1 h-7 font-bold rounded-[6px] transition-colors text-[11px] bg-[#A3E635] hover:bg-[#84CC16] text-[#1A202C]"
                >
                  QR MoMo
                </button>
              </div>
            ) : (
              <div className="w-full h-7 rounded-[6px] font-bold text-[11px] flex items-center justify-center transition-all bg-[#fcfcfc] border border-[#e8e9e8] text-[#9b9b9b]">
                —
              </div>
            )}
          </div>
        )}

        {paymentSuccess && (
          <div className="flex flex-col gap-1.5 mt-2">
            <label className="block text-[10px] font-semibold text-[#060606]">Trạng thái</label>
            <button
               onClick={() => {
                 setPaymentSuccess(false);
                 handleReset();
                 if (onCheckOut) onCheckOut(null);
               }}
               className="w-full h-9 bg-[#A3E635] text-[#1A202C] font-bold text-[14px] flex items-center justify-center rounded-[6px] hover:bg-[#84CC16] transition-colors cursor-pointer"
            >
              Mời xe ra (Bấm Enter mở chắn)
            </button>
          </div>
        )}
      </div>

      {/* Momo QR Modal Overlay */}
      {momoQR && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-[8px]">
          <div className="bg-white rounded-[16px] p-6 w-[90%] max-w-[360px] shadow-2xl border border-pink-100 flex flex-col items-center animate-in fade-in zoom-in duration-200">
            <h3 className="text-[16px] font-bold text-[#A50064] mb-1">Thanh toán Momo</h3>
            <p className="text-[11px] text-gray-500 mb-4 text-center">Tài xế sử dụng ứng dụng Momo hoặc ngân hàng để quét mã QR</p>

            <div className="bg-white p-2 rounded-xl border-2 border-pink-100 shadow-inner mb-4">
              <img src={momoQR} alt="Momo QR Code" className="w-40 h-40 object-contain" />
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#A50064] font-medium mb-4 bg-pink-50 px-4 py-2 rounded-full">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Đang chờ khách thanh toán...
            </div>

            <button
              onClick={() => {
                setMomoQR(null);
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              }}
              className="w-full h-9 border border-gray-200 text-gray-600 font-bold text-[12px] rounded-[6px] hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" /> Hủy giao dịch Momo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
