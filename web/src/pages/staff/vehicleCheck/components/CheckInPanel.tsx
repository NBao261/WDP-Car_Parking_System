import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { ImagePlus, RefreshCw, CheckCircle, X } from "lucide-react";
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
  // Xoá ký tự lạ
  s = s.replace(/[^A-Z0-9\s.\-]/g, '');
  // Chuẩn khoảng trắng
  s = s.replace(/\s+/g, ' ').trim();
  // Chèn dấu - nếu thiếu: 63B9... → 63-B9
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setOcrSuccess(false);
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      // Dùng apiClient (có auth + timeout 35s cho ALPR)
      const response: any = await apiClient.post('/alpr/scan', formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 35000,
      } as any);
      if (response.success && response.data?.normalizedPlate) {
        const recognized = formatPlate(response.data.normalizedPlate);
        setPlate(recognized);
        if (response.data.imageUrl) setCheckInImage(response.data.imageUrl);
        setOcrSuccess(true);
        toast.success(`Đã nhận dạng: ${recognized} — kiểm tra lại trước khi xác nhận`);
      } else {
        toast.warning(response.message || "Không nhận dạng được biển số. Vui lòng nhập tay.");
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi xử lý ảnh.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const clearPreview = () => { setPreviewUrl(null); setOcrSuccess(false); setCheckInImage(null); };

  // Lắng nghe Hotkeys
  useEffect(() => {
    const onF1 = () => {
      setPlate("");
      setCheckInImage(null);
      setPreviewUrl(null);
      setOcrSuccess(false);
    };

    const onSpace = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();
        const selectedType = vehicleTypes.find((v) => v._id === selectedVehicleTypeId);
        const isBike = selectedType?.name.toLowerCase().includes("xe đạp") || false;
        if ((isBike || plate.trim().length > 0) && !isSubmitting) {
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
  }, [plate, isSubmitting, vehicleTypes, selectedVehicleTypeId]);

  // ─── Terminal Session (từ sessionStorage, set lúc chọn ca) ────────────────
  const facilityId = sessionStorage.getItem("staff_facility_id") || "";
  const facilityName =
    sessionStorage.getItem("staff_facility_name") || "Chưa chọn Toà nhà";
  // gateIn được auto-sinh khi staff chọn ca → nhất quán, không cần nhập tay
  const gateIn =
    sessionStorage.getItem("staff_gate_name") || `Cổng - ${facilityName}`;

  useEffect(() => {
    if (!facilityId) return;

    facilityService
      .getOperationsConfig(facilityId)
      .then((res) => {
        if (res.success && res.data.allowedVehicleTypes.length > 0) {
          setVehicleTypes(res.data.allowedVehicleTypes);
          setSelectedVehicleTypeId(res.data.allowedVehicleTypes[0]._id);
        } else {
          // Toà nhà chưa có cấu hình loại xe nào
          setVehicleTypes([]);
          setSelectedVehicleTypeId("");
          toast.warning("Toà nhà này chưa được cấu hình loại xe. Liên hệ Admin.");
        }
      })
      .catch(() => toast.error("Không thể tải cấu hình loại xe"));
  }, [facilityId]);

  // ─── TỰ ĐỘNG ĐOÁN LOẠI XE DỰA VÀO BIỂN SỐ ────────────────────────────
  useEffect(() => {
    if (!plate || vehicleTypes.length === 0) return;

    const guessVehicleCategory = (plateStr: string) => {
      const cleanPlate = plateStr.replace(/[-.\s]/g, '').toUpperCase();
      // Regex cho biển số thông thường: 2 số tỉnh + 1/2 ký tự sê-ri + 4/5 số
      const match = cleanPlate.match(/^(\d{2})([A-Z0-9]{1,2})(\d{4,5})$/);
      if (!match) return 'Motorbike'; // Default fallback

      const series = match[2];

      // -- Phân tích Nhóm Ô tô --
      // Xe tải / Bán tải thường dùng chữ C, H, D
      if (series === 'C' || series === 'H' || series === 'D') return 'Truck';

      // Các chữ cái đơn còn lại (A, B, E, F, G, K, L...) là ô tô
      if (series.length === 1) return 'Car';

      // Các sê-ri 2 chữ cái đặc biệt của ô tô
      const carSpecialSeries = ['LD', 'KT', 'NN', 'NG', 'CV', 'DA', 'HC', 'MK', 'TĐ'];
      if (carSpecialSeries.includes(series)) return 'Car';

      // -- Phân tích Nhóm Xe máy --
      // Xe máy điện
      if (series === 'MĐ') return 'ElectricMotorbike';

      // Mặc định còn lại là xe máy (K1, B9, AA, AB, v.v.)
      return 'Motorbike';
    };

    const category = guessVehicleCategory(plate);

    // Tìm loại xe phù hợp nhất trong danh sách (dựa vào từ khoá tên)
    let targetType = vehicleTypes.find(v => {
      const lowerName = v.name.toLowerCase();
      if (category === 'Truck') return lowerName.includes('tải') || lowerName.includes('truck');
      if (category === 'ElectricMotorbike') return lowerName.includes('máy điện') || lowerName.includes('xe điện');
      if (category === 'Car') return lowerName === 'ô tô' || lowerName === 'car' || (lowerName.includes('ô tô') && !lowerName.includes('điện'));
      if (category === 'Motorbike') return lowerName === 'xe máy' || lowerName === 'motorbike' || (lowerName.includes('máy') && !lowerName.includes('điện'));
      return false;
    });

    // Fallback nếu không tìm thấy loại chính xác
    if (!targetType) {
      if (category === 'Truck' || category === 'Car') {
        targetType = vehicleTypes.find(v => v.name.toLowerCase().includes('ô tô'));
      } else {
        targetType = vehicleTypes.find(v => v.name.toLowerCase().includes('máy'));
      }
    }

    if (targetType && targetType._id !== selectedVehicleTypeId) {
      setSelectedVehicleTypeId(targetType._id);
    }
  }, [plate, vehicleTypes]);

  const handleCheckIn = async () => {
    const selectedVehicleType = vehicleTypes.find((v) => v._id === selectedVehicleTypeId);
    const isBicycle = selectedVehicleType?.name.toLowerCase().includes("xe đạp") || false;

    if (!isBicycle && !plate) {
      toast.error("Vui lòng nhập biển số xe!");
      return;
    }
    if (!facilityId || !selectedVehicleTypeId) {
      toast.error("Thiếu thông tin vị trí trực hoặc loại xe. Vui lòng đăng nhập lại!");
      return;
    }

    setIsSubmitting(true);
    try {
      const actualPlate = isBicycle ? `XD-${Math.floor(100000 + Math.random() * 900000)}` : plate;

      const res = await sessionService.checkIn({
        facilityId,
        vehicleTypeId: selectedVehicleTypeId,
        licensePlate: actualPlate,
        gateIn,
        ...(checkInImage && !isBicycle ? { checkInImage } : {}),
      });

      if (res.success) {
        const floorName = (res.data.floorId as any)?.name || "Tầng Auto";
        const slotCode = (res.data.slotId as any)?.code || "Slot Auto";

        const now = new Date();
        const actualCheckInTime = res.data.checkInTime ? new Date(res.data.checkInTime) : now;
        onCheckIn({
          cardCode: res.data.cardCode,
          plate: res.data.licensePlate,
          vehicleType:
            vehicleTypes.find((v) => v._id === selectedVehicleTypeId)?.name || "",
          checkInTime: actualCheckInTime.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          checkInDate: actualCheckInTime.toLocaleDateString("vi-VN", {
            day: "2-digit", month: "2-digit", year: "numeric"
          }),
          gate: gateIn,
          zone: `${floorName} - Slot: ${slotCode}`,
        });
        toast.success(`Đã cấp phát: ${floorName} - Slot: ${slotCode}. Đã tự động mở chắn!`);

        // Tự động xoá form để sẵn sàng đón xe tiếp theo (thông tin xác nhận vẫn giữ lại)
        setPlate("");
        setCheckInImage(null);
        setPreviewUrl(null);
        setOcrSuccess(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi tạo phiên đỗ xe!");
    } finally {
      setIsSubmitting(false);
    }
  };

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

        {/* Row 2: Ảnh biển số Vào + Khung dự phòng */}
        <div className="flex gap-4 flex-1 min-h-0">
          <div className="flex-1 flex flex-col gap-1 min-h-0 relative">
            <label className="block text-[11px] font-semibold text-[#6b6b6b]">Ảnh biển số Vào</label>
            {!previewUrl ? (
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
                    <span className="text-[10px] font-semibold text-[#6b6b6b]">Chụp / Upload ảnh biển số (OCR)</span>
                    <span className="text-[9px] text-[#aaa]">Hỗ trợ JPG, PNG — chụp thẳng góc, đủ sáng</span>
                  </div>
                )}
              </button>
            ) : (
              <div className="relative border border-[#e8e9e8] rounded-[6px] overflow-hidden flex-1 bg-[#f5f5f4]">
                <img src={previewUrl} alt="preview" className="w-full h-full object-contain" />
                <button type="button" onClick={clearPreview} className="absolute top-2 right-2 w-6 h-6 bg-black/70 text-white rounded-full flex items-center justify-center"><X className="w-3.5 h-3.5" /></button>
              </div>
            )}
            <input type="file" accept="image/*" capture="environment" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
          </div>

          <div className="flex-1 flex flex-col gap-1 min-h-0">
            <label className="block text-[11px] font-semibold text-[#6b6b6b]">Khung dự phòng</label>
            <div className="flex-1 border-2 border-dashed border-[#e8e9e8] rounded-[6px] flex flex-col items-center justify-center gap-2 bg-[#fdfdfd]">
              <div className="flex flex-col items-center opacity-60">
                <img src="/Logo_chu.png" alt="LYNC PARK" className="h-14 mb-3 object-contain" />
                <ImagePlus className="w-4 h-4 text-[#6b6b6b] mb-3" />
                <span className="text-[10px] font-semibold text-[#6b6b6b]">Chụp / Upload ảnh biển số (OCR)</span>
                <span className="text-[9px] text-[#aaa]">Hỗ trợ JPG, PNG — chụp thẳng góc, đủ sáng</span>
              </div>
            </div>
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
              ocrSuccess
                ? 'bg-[#9FE870]/20 text-[#2d6a1f] border-[#9FE870]'
                : 'bg-[#f5f5f4] text-[#a8a29e] border-[#e8e9e8]'
            }`}>
              {ocrSuccess ? '✓ Quét thành công' : 'Chưa quét'}
            </div>
          </div>
        </div>

        {/* Row 4: Biển số xe vào */}
        <div className="flex flex-col gap-1">
          <label className="block text-[11px] font-semibold text-[#060606]">Biển số xe vào</label>
          <input
            type="text"
            value={vehicleTypes.find((v) => v._id === selectedVehicleTypeId)?.name.toLowerCase().includes("xe đạp") ? "XD-AUTO" : plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            onKeyDown={(e) => { if (e.key === "Enter" || e.code === "Space") { e.preventDefault(); handleCheckIn(); } }}
            disabled={isSubmitting}
            className={`w-full h-12 text-[20px] font-mono px-3 border rounded-[6px] uppercase font-bold outline-none transition-all duration-200 disabled:opacity-70
              ${(vehicleTypes.find((v) => v._id === selectedVehicleTypeId)?.name.toLowerCase().includes("xe đạp") ? "XD-AUTO" : plate)
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
