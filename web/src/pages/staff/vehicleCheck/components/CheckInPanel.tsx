import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { ImagePlus, RefreshCw, X, QrCode, ScanLine, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { apiClient } from "../../../../services/api";
import { VehicleType } from "../../../../services/vehicleType.service";
import { facilityService } from "../../../../services/facility.service";
import { sessionService } from "../../../../services/session.service";

interface CheckInPanelProps {
  onCheckIn: (data: any) => void;
}

/** Client-side cleanup cho biển số xe sau khi OCR */
function formatPlate(raw: string): string {
  let s = raw.trim().toUpperCase();
  s = s.replace(/[^A-Z0-9\s.\-]/g, '');
  s = s.replace(/\s+/g, ' ').trim();
  s = s.replace(/^(\d{2})([A-Z])/, '$1-$2');
  return s;
}

export default function CheckInPanel({ onCheckIn }: CheckInPanelProps) {
  const [plate, setPlate] = useState("");
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [selectedVehicleTypeId, setSelectedVehicleTypeId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkInImage, setCheckInImage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Reservation (thêm vào khung bên phải) ────────────────────────────────
  const [reservationCode, setReservationCode] = useState("");
  const [reservationInfo, setReservationInfo] = useState<any>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [plateMatchStatus, setPlateMatchStatus] = useState<'idle' | 'match' | 'mismatch'>('idle');
  const [manualPlateConfirmed, setManualPlateConfirmed] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const qrScannerRef = useRef<any>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setOcrSuccess(false);
    setPlate(""); // CLEAR old plate when uploading a new image
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    const selectedType = vehicleTypes.find((v) => v._id === selectedVehicleTypeId);
    const isNoPlate = selectedType?.requiresPlate === false;

    try {
      if (isNoPlate) {
        const response: any = await apiClient.post('/upload/image', formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.success && response.data?.imageUrl) {
          setCheckInImage(response.data.imageUrl);
        } else {
          setCheckInImage(localUrl);
        }
      } else {
        const response: any = await apiClient.post('/alpr/scan', formData, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 35000,
        } as any);
        if (response.success && response.data?.normalizedPlate) {
          const recognized = formatPlate(response.data.normalizedPlate);
          setPlate(recognized);
          if (response.data.imageUrl) setCheckInImage(response.data.imageUrl);
          setOcrSuccess(true);

          // Tự động so sánh với reservation nếu đã tra cứu trước
          if (reservationInfo?.licensePlate) {
            const clean = (s: string) => s.replace(/[^A-Z0-9]/g, '').toUpperCase();
            const matched = clean(recognized) === clean(reservationInfo.licensePlate);
            setPlateMatchStatus(matched ? 'match' : 'mismatch');
            if (!matched) toast.warning(`⚠ Biển OCR (${recognized}) ≠ Đặt chỗ (${reservationInfo.licensePlate})`);
          }
        } else {
          if (response.data?.imageUrl) {
            setCheckInImage(response.data.imageUrl);
          } else {
            setCheckInImage(localUrl);
          }
        }
      }
    } catch (err: any) {
      setCheckInImage(localUrl);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const clearPreview = () => { setPreviewUrl(null); setOcrSuccess(false); setCheckInImage(null); setPlateMatchStatus('idle'); };

  // Lắng nghe Hotkeys
  useEffect(() => {
    const onF1 = () => {
      setPlate(""); setCheckInImage(null); setPreviewUrl(null); setOcrSuccess(false);
      setReservationCode(""); setReservationInfo(null); setPlateMatchStatus('idle'); setManualPlateConfirmed(false);
    };

    const onSpace = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();
        const selectedType = vehicleTypes.find((v) => v._id === selectedVehicleTypeId);
        const isNoPlate = selectedType?.requiresPlate === false;
        if ((isNoPlate || plate.trim().length > 0) && !isSubmitting) {
          handleCheckIn();
        }
      }
    };

    window.addEventListener("keydown", onSpace);
    window.addEventListener("HOTKEY_F1", onF1);
    return () => {
      window.removeEventListener("keydown", onSpace);
      window.removeEventListener("HOTKEY_F1", onF1);
    };
  }, [plate, isSubmitting, vehicleTypes, selectedVehicleTypeId, checkInImage, reservationCode, reservationInfo, plateMatchStatus, manualPlateConfirmed]);

  // Terminal / facility
  const facilityId = sessionStorage.getItem("staff_facility_id") || "";
  const facilityName = sessionStorage.getItem("staff_facility_name") || "Chưa chọn Toà nhà";
  const gateIn = sessionStorage.getItem("staff_gate_name") || `Cổng - ${facilityName}`;

  useEffect(() => {
    if (!facilityId) return;
    facilityService.getOperationsConfig(facilityId).then((res) => {
      if (res.success && res.data.allowedVehicleTypes.length > 0) {
        setVehicleTypes(res.data.allowedVehicleTypes);
        setSelectedVehicleTypeId(res.data.allowedVehicleTypes[0]._id);
      } else {
        setVehicleTypes([]);
        setSelectedVehicleTypeId("");
        toast.warning("Toà nhà này chưa được cấu hình loại xe. Liên hệ Admin.");
      }
    }).catch(() => toast.error("Không thể tải cấu hình loại xe"));
  }, [facilityId]);

  // Tự động đoán loại xe dựa vào biển số
  useEffect(() => {
    if (!plate || vehicleTypes.length === 0) return;

    const guessVehicleCategory = (plateStr: string) => {
      if (plateStr.startsWith('KBS-')) return null;
      const cleanPlate = plateStr.replace(/[-.s]/g, '').toUpperCase();
      const match = cleanPlate.match(/^(\d{2})([A-Z0-9]{1,2})(\d{4,5})$/);
      if (!match) return 'Motorbike';
      const series = match[2];
      if (series === 'C' || series === 'H' || series === 'D') return 'Truck';
      if (series.length === 1) return 'Car';
      const carSpecialSeries = ['LD', 'KT', 'NN', 'NG', 'CV', 'DA', 'HC', 'MK', 'TĐ'];
      if (carSpecialSeries.includes(series)) return 'Car';
      if (series === 'MĐ') return 'ElectricMotorbike';
      return 'Motorbike';
    };

    const category = guessVehicleCategory(plate);
    if (!category) return;

    let targetType = vehicleTypes.find(v => {
      const lowerName = v.name.toLowerCase();
      if (category === 'Truck') return lowerName.includes('tải') || lowerName.includes('truck');
      if (category === 'ElectricMotorbike') return lowerName.includes('máy điện') || lowerName.includes('xe điện');
      if (category === 'Car') return lowerName === 'ô tô' || lowerName === 'car' || (lowerName.includes('ô tô') && !lowerName.includes('điện'));
      if (category === 'Motorbike') return lowerName === 'xe máy' || lowerName === 'motorbike' || (lowerName.includes('máy') && !lowerName.includes('điện'));
      return false;
    });
    if (!targetType) {
      if (category === 'Truck' || category === 'Car') targetType = vehicleTypes.find(v => v.name.toLowerCase().includes('ô tô'));
      else targetType = vehicleTypes.find(v => v.name.toLowerCase().includes('máy'));
    }
    if (targetType && targetType._id !== selectedVehicleTypeId) setSelectedVehicleTypeId(targetType._id);
  }, [plate, vehicleTypes]);

  // ── QR Scanner ────────────────────────────────────────────────────────────
  const toggleQrScanner = async () => {
    if (showQrScanner) {
      try { await qrScannerRef.current?.stop(); } catch {}
      setShowQrScanner(false);
      return;
    }
    setShowQrScanner(true);
    setTimeout(async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        const scanner = new Html5Qrcode('ci-qr-reader');
        qrScannerRef.current = scanner;
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 70 } },
          (decodedText: string) => {
            scanner.stop().catch(() => {});
            setShowQrScanner(false);
            const code = decodedText.trim().toUpperCase();
            setReservationCode(code);
            lookupReservation(code);
          },
          undefined
        );
      } catch { toast.error("Không mở được camera QR"); setShowQrScanner(false); }
    }, 200);
  };
  useEffect(() => () => { qrScannerRef.current?.stop().catch(() => {}); }, []);

  // ── Tra cứu reservation ───────────────────────────────────────────────────
  const lookupReservation = async (code: string) => {
    if (!code.trim()) return;
    setIsLookingUp(true);
    setReservationInfo(null);
    setPlateMatchStatus('idle');
    setManualPlateConfirmed(false);
    try {
      const res: any = await apiClient.get(`/reservations/by-code/${code.trim().toUpperCase()}`);
      if (res.success && res.data) {
        setReservationInfo(res.data);
        if (res.data.vehicleTypeId?._id) setSelectedVehicleTypeId(res.data.vehicleTypeId._id);
        // Pre-fill biển số nếu chưa có (để staff dễ đối chiếu)
        if (!plate && res.data.licensePlate) setPlate(res.data.licensePlate);
        toast.success(`✓ Tìm thấy đặt chỗ — ${res.data.licensePlate}`);

        // Nếu đã có OCR trước → so sánh ngay
        if (plate) {
          const clean = (s: string) => s.replace(/[^A-Z0-9]/g, '').toUpperCase();
          const matched = clean(plate) === clean(res.data.licensePlate);
          setPlateMatchStatus(matched ? 'match' : 'mismatch');
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Không tìm thấy mã đặt chỗ");
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleCheckIn = async () => {
    const selectedVehicleType = vehicleTypes.find((v) => v._id === selectedVehicleTypeId);
    const isNoPlate = selectedVehicleType?.requiresPlate === false;

    if (!isNoPlate && !plate.trim()) { toast.error("Vui lòng nhập biển số xe!"); return; }
    if (isNoPlate && !checkInImage) { toast.error("Xe không biển số: BẮT BUỘC phải chụp ảnh xe lúc vào!"); return; }
    if (!facilityId || !selectedVehicleTypeId) { toast.error("Thiếu thông tin vị trí trực hoặc loại xe. Vui lòng đăng nhập lại!"); return; }
    if (reservationInfo && plateMatchStatus === 'mismatch' && !manualPlateConfirmed) {
      toast.error("Biển số không khớp đặt chỗ — tick xác nhận thủ công trước!"); return;
    }

    setIsSubmitting(true);
    try {
      const actualPlate = isNoPlate ? `KBS-${Math.floor(100000 + Math.random() * 900000)}` : plate;
      const res = await sessionService.checkIn({
        facilityId, vehicleTypeId: selectedVehicleTypeId,
        licensePlate: actualPlate, gateIn,
        ...(reservationCode ? { reservationCode } : {}),
        ...(checkInImage ? { checkInImage } : {}),
      });

      if (res.success) {
        const floorName = (res.data.floorId as any)?.name || "Tầng Auto";
        const slotCode = (res.data.slotId as any)?.code || "Slot Auto";
        const now = new Date();
        const actualCheckInTime = res.data.checkInTime ? new Date(res.data.checkInTime) : now;
        onCheckIn({
          cardCode: res.data.cardCode, plate: res.data.licensePlate,
          vehicleType: vehicleTypes.find((v) => v._id === selectedVehicleTypeId)?.name || "",
          checkInTime: actualCheckInTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          checkInDate: actualCheckInTime.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }),
          gate: gateIn, zone: `${floorName} - Slot: ${slotCode}`,
          ...(reservationCode ? { fromReservation: true, reservationCode } : {}),
        });
        toast.success(`Đã cấp phát: ${floorName} - Slot: ${slotCode}. Đã tự động mở chắn!`);

        setPlate(""); setCheckInImage(null); setPreviewUrl(null); setOcrSuccess(false);
        setReservationCode(""); setReservationInfo(null); setPlateMatchStatus('idle'); setManualPlateConfirmed(false);

        if (isNoPlate) {
          const defaultType = vehicleTypes.find(v => v.requiresPlate !== false) || vehicleTypes[0];
          if (defaultType) setSelectedVehicleTypeId(defaultType._id);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi tạo phiên đỗ xe!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isNoPlateVt = vehicleTypes.find((v) => v._id === selectedVehicleTypeId)?.requiresPlate === false;
  const displayPlate = isNoPlateVt ? "KBS-AUTO" : plate;

  return (
    <div className="flex flex-col bg-white rounded-[16px] border border-[#e8e9e8] shadow-lg shadow-[#9FE870]/20 px-5 pt-4 pb-4 h-full min-h-0 overflow-hidden">
      <h2 className="text-[17px] font-bold text-[#060606] mb-3 shrink-0">Đăng Ký Xe Vào</h2>

      <div className="flex flex-col gap-4 flex-1 min-h-0">
        {/* Row 1: Toà nhà + Cổng trực */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#6b6b6b] mb-1">Toà nhà</label>
            <input type="text" value={facilityName} readOnly
              className="w-full h-8 px-3 bg-[#f5f5f4] border border-[#e8e9e8] rounded-[6px] text-[#6b6b6b] text-[12px] font-medium cursor-not-allowed outline-none" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#6b6b6b] mb-1">Cổng trực</label>
            <input type="text" value={gateIn} readOnly
              className="w-full h-8 px-3 bg-[#f5f5f4] border border-[#e8e9e8] rounded-[6px] text-[#6b6b6b] text-[12px] font-medium cursor-not-allowed outline-none" />
          </div>
        </div>

        {/* Row 2: Ảnh biển số Vào + Đặt chỗ trước (thay "Khung dự phòng") */}
        <div className="flex gap-4 flex-1 min-h-0">
          {/* Left: Ảnh + OCR (giữ nguyên) */}
          <div className="flex-1 flex flex-col gap-1 min-h-0 relative">
            <label className="block text-[11px] font-semibold text-[#6b6b6b]">Ảnh biển số Vào</label>
            {!previewUrl ? (
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                className="flex-1 border-2 border-dashed border-[#c8c9c8] rounded-[6px] flex flex-col items-center justify-center gap-2 hover:border-[#9FE870] hover:bg-[#f5ffe8] transition-all duration-200 disabled:opacity-60">
                {isUploading ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-[#8bc34a]" />
                ) : (
                  <div className="flex flex-col items-center">
                    <img src="/Logo_chu.png" alt="LYNC PARK" className="h-14 mb-3 object-contain" />
                    <ImagePlus className="w-4 h-4 text-[#6b6b6b] mb-3" />
                    <span className="text-[10px] font-semibold text-[#6b6b6b]">Chụp / Upload ảnh biển số (OCR)</span>
                    <span className="text-[9px] text-[#aaa]">Hỗ trợ JPG, PNG — chụp thẳng góc, đủ sáng</span>
                  </div>
                )}
              </button>
            ) : (
              <div className="relative border border-[#e8e9e8] rounded-[6px] overflow-hidden flex-1 bg-[#f5f5f4]">
                <img src={previewUrl} alt="preview" className="w-full h-full object-contain" />
                <button type="button" onClick={clearPreview}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/70 text-white rounded-full flex items-center justify-center">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <input type="file" accept="image/*" capture="environment" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
          </div>

          {/* Right: Đặt chỗ trước — thay khung dự phòng */}
          <div className="flex-1 flex flex-col gap-1 min-h-0">
            <label className="block text-[11px] font-semibold text-[#6b6b6b]">Đặt chỗ trước</label>

            {/* Nếu đã có reservation info → hiển thị card kết quả */}
            {reservationInfo ? (
              <div className={`flex-1 rounded-[6px] border p-3 flex flex-col gap-2 ${
                plateMatchStatus === 'match'    ? 'bg-[#f0f9e8] border-[#9FE870]' :
                plateMatchStatus === 'mismatch' ? 'bg-[#fef2f2] border-[#ef4444]' :
                                                  'bg-[#f0f9e8] border-[#9FE870]/50'
              }`}>
                {/* Header status */}
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    plateMatchStatus === 'match'    ? 'bg-[#9FE870] text-[#062F28]' :
                    plateMatchStatus === 'mismatch' ? 'bg-red-100 text-red-600' :
                                                      'bg-[#9FE870]/30 text-[#2d6a1f]'
                  }`}>
                    {plateMatchStatus === 'match'    ? <><CheckCircle2 className="w-3 h-3" /> Biển khớp</> :
                     plateMatchStatus === 'mismatch' ? <><AlertTriangle className="w-3 h-3" /> Không khớp</> :
                                                       <>✓ Tìm thấy</>}
                  </div>
                  <button onClick={() => { setReservationInfo(null); setReservationCode(""); setPlateMatchStatus('idle'); setManualPlateConfirmed(false); }}
                    className="w-5 h-5 flex items-center justify-center text-[#aaa] hover:text-[#333]">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Thông tin đặt chỗ */}
                <div className="flex flex-col gap-1 text-[10px] text-[#444] flex-1">
                  <div className="flex justify-between">
                    <span className="text-[#888]">Biển đặt</span>
                    <span className="font-mono font-bold text-[#062F28]">{reservationInfo.licensePlate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">Slot giữ</span>
                    <span className="font-bold">{(reservationInfo.slotId as any)?.code || '?'}
                      {(reservationInfo.slotId as any)?.floorId?.name &&
                        <span className="font-normal text-[#888]"> · {(reservationInfo.slotId as any).floorId.name}</span>}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">Giờ hẹn</span>
                    <span className="font-bold">{new Date(reservationInfo.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">Mã</span>
                    <span className="font-mono text-[9px] text-[#666]">{reservationInfo.code}</span>
                  </div>
                </div>

                {/* Checkbox khi mismatch */}
                {plateMatchStatus === 'mismatch' && (
                  <label className="flex items-start gap-1.5 cursor-pointer border-t border-red-200 pt-2 mt-1">
                    <input type="checkbox" checked={manualPlateConfirmed} onChange={e => setManualPlateConfirmed(e.target.checked)} className="mt-0.5 w-3 h-3 accent-red-500" />
                    <span className="text-[9px] font-semibold text-red-600 leading-tight">Xác nhận biển không khớp — vẫn cho vào</span>
                  </label>
                )}
              </div>
            ) : (
              /* Chưa có reservation → show form tra cứu */
              <div className="flex-1 border-2 border-dashed border-[#e8e9e8] rounded-[6px] flex flex-col items-center justify-center gap-2 bg-[#fdfdfd] px-3">
                {/* QR Scanner area */}
                {showQrScanner ? (
                  <div className="w-full flex flex-col gap-1">
                    <div id="ci-qr-reader" className="w-full rounded-[4px] overflow-hidden" style={{ maxHeight: 100 }} />
                    <p className="text-[9px] text-center text-[#9FE870] font-medium">Hướng vào mã QR trên điện thoại khách</p>
                    <button onClick={toggleQrScanner} className="text-[9px] text-[#888] underline text-center">Đóng camera</button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col items-center opacity-50 mb-1">
                      <QrCode className="w-7 h-7 text-[#6b6b6b] mb-1" />
                      <span className="text-[9px] text-[#6b6b6b] font-semibold">Khách có mã đặt chỗ?</span>
                    </div>
                    {/* Nút quét QR */}
                    <button onClick={toggleQrScanner}
                      className="w-full h-7 flex items-center justify-center gap-1.5 bg-[#060606] text-white text-[10px] font-bold rounded-[5px] hover:bg-[#1a1a1a] transition-colors">
                      <ScanLine className="w-3.5 h-3.5" />Quét QR
                    </button>
                    {/* Hoặc nhập tay */}
                    <div className="w-full flex gap-1">
                      <input type="text" value={reservationCode} placeholder="RES-XXXX-XXXX"
                        onChange={e => setReservationCode(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && lookupReservation(reservationCode)}
                        className="flex-1 h-7 px-2 border border-[#e8e9e8] rounded-[5px] text-[9px] font-mono uppercase outline-none focus:border-[#9FE870] bg-white" />
                      <button onClick={() => lookupReservation(reservationCode)} disabled={!reservationCode.trim() || isLookingUp}
                        className="h-7 px-2 bg-[#f0f9e8] border border-[#9FE870]/60 text-[#2d6a1f] text-[9px] font-bold rounded-[5px] disabled:opacity-50 hover:bg-[#9FE870]/30 transition-colors whitespace-nowrap">
                        {isLookingUp ? '...' : 'Tra cứu'}
                      </button>
                    </div>
                    <p className="text-[8px] text-[#bbb] text-center">Walk-in: Bỏ qua, tiếp tục chụp ảnh</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Row 3: Loại xe + Trạng thái OCR */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="block text-[11px] font-semibold text-[#060606]">Loại xe</label>
            <select value={selectedVehicleTypeId} onChange={(e) => setSelectedVehicleTypeId(e.target.value)}
              className="w-full h-8 px-3 border border-[#e8e9e8] rounded-[6px] text-[12px] font-medium outline-none focus:border-[#060606]">
              {vehicleTypes.length === 0 && <option value="">Đang tải...</option>}
              {vehicleTypes.map((vt) => (<option key={vt._id} value={vt._id}>{vt.name}</option>))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-[11px] font-semibold text-[#060606]">Trạng thái OCR</label>
            <div className={`w-full h-8 rounded-[6px] text-[12px] font-bold flex items-center justify-center border transition-colors ${
              ocrSuccess ? 'bg-[#9FE870]/20 text-[#2d6a1f] border-[#9FE870]' : 'bg-[#f5f5f4] text-[#a8a29e] border-[#e8e9e8]'
            }`}>
              {ocrSuccess ? '✓ Quét thành công' : 'Chưa quét'}
            </div>
          </div>
        </div>

        {/* Row 4: Biển số xe vào */}
        <div className="flex flex-col gap-1">
          <label className="block text-[11px] font-semibold text-[#060606]">Biển số xe vào</label>
          <input type="text" value={displayPlate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            onKeyDown={(e) => { if (e.key === "Enter" || e.code === "Space") { e.preventDefault(); handleCheckIn(); } }}
            disabled={isSubmitting}
            className={`w-full h-12 text-[20px] font-mono px-3 border rounded-[6px] uppercase font-bold outline-none transition-all duration-200 disabled:opacity-70
              ${displayPlate
                ? 'bg-[#9FE870]/30 border-[#9FE870] text-[#062F28] focus:ring-2 focus:ring-[#9FE870]/40'
                : 'bg-[#f5f5f4] border-[#e8e9e8] text-[#9b9b9b] focus:border-[#1a1a1a]'
              }`}
            placeholder="XXX-XX-XXXXX"
          />
        </div>
      </div>
    </div>
  );
}
