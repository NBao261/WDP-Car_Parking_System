import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { ImagePlus, RefreshCw, CheckCircle, X, Camera } from "lucide-react";
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
  const manualTypeSelect = useRef(false); // Tracks if user manually picked a vehicle type

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setOcrSuccess(false);
    setIsUploading(true);

    const selectedType = vehicleTypes.find((v) => v._id === selectedVehicleTypeId);
    const isNoPlate = selectedType?.requiresPlate === false;

    const formData = new FormData();
    formData.append("image", file);

    try {
      if (isNoPlate) {
        // Xe không cần biển số: chỉ upload ảnh, không gọi OCR
        const response: any = await apiClient.post('/upload/image', formData, {
          headers: { "Content-Type": "multipart/form-data" },
        } as any);
        if (response.success && response.data?.imageUrl) {
          setCheckInImage(response.data.imageUrl);
          toast.success("Đã chụp ảnh xe thành công!");
        } else {
          // Fallback: dùng local preview URL
          setCheckInImage(localUrl);
          toast.success("Đã chụp ảnh xe!");
        }
      } else {
        // Xe có biển số: gọi ALPR scan để nhận dạng
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
      }
    } catch (err: any) {
      if (isNoPlate) {
        // Fallback cho no-plate: dùng local URL nếu upload thất bại
        setCheckInImage(localUrl);
        toast.success("Đã chụp ảnh xe (lưu local)!");
      } else {
        toast.error(err.message || "Lỗi xử lý ảnh.");
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const clearPreview = () => { setPreviewUrl(null); setOcrSuccess(false); setCheckInImage(null); };

  // Lắng nghe Hotkeys
  useEffect(() => {
    const onF2 = () => {
      const selectedType = vehicleTypes.find((v) => v._id === selectedVehicleTypeId);
      const isNoPlate = selectedType?.requiresPlate === false;
      
      // Chỉ check-in khi đã nhập đủ biển số (hoặc là xe không cần biển)
      if ((isNoPlate || plate.trim().length > 0) && !isSubmitting) {
        handleCheckIn();
      }
    };

    const onF10 = () => {
      setPlate("");
      setCheckInImage(null);
      setPreviewUrl(null);
      setOcrSuccess(false);
      manualTypeSelect.current = false;
      if (vehicleTypes.length > 0) {
        setSelectedVehicleTypeId(vehicleTypes[0]._id);
      }
    };

    window.addEventListener("HOTKEY_F2", onF2);
    window.addEventListener("HOTKEY_F10", onF10);
    return () => {
      window.removeEventListener("HOTKEY_F2", onF2);
      window.removeEventListener("HOTKEY_F10", onF10);
    };
  }, [plate, isSubmitting]);

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

    // Không auto-guess nếu staff đã tự chọn loại xe (nhất là xe không biển số)
    if (manualTypeSelect.current) return;

    // Không auto-guess nếu đang chọn loại xe không cần biển số
    const currentType = vehicleTypes.find((v) => v._id === selectedVehicleTypeId);
    if (currentType?.requiresPlate === false) return;
    
    const guessVehicleCategory = (plateStr: string) => {
      const cleanPlate = plateStr.replace(/[-.\s]/g, '').toUpperCase();

      // ── 1. Thử format Ô tô: 2 số tỉnh + 1 CHỮ CÁI + 5 số ──
      // VD: 51G12345, 29A12345, 30E99999
      const carMatch = cleanPlate.match(/^(\d{2})([A-Z])(\d{5})$/);
      if (carMatch) {
        const series = carMatch[2];
        // Xe tải / bán tải
        if (['C', 'H', 'D'].includes(series)) return 'Truck';
        // Còn lại là ô tô
        return 'Car';
      }

      // ── 2. Thử format Xe máy: 2 số tỉnh + 2 ký tự + 4-5 số ──
      // VD: 59F123456, 29B912345, 72K11234
      const motoMatch = cleanPlate.match(/^(\d{2})([A-Z0-9]{2})(\d{4,5})$/);
      if (motoMatch) {
        const series = motoMatch[2];
        // Sê-ri đặc biệt 2 chữ thuộc ô tô
        const carSpecialSeries = ['LD', 'KT', 'NN', 'NG', 'CV', 'DA', 'HC', 'MK'];
        if (carSpecialSeries.includes(series)) return 'Car';
        // Xe máy điện
        if (series === 'MD') return 'ElectricMotorbike';
        return 'Motorbike';
      }

      // ── 3. Thử format ô tô cũ: 2 số + 1 chữ + 4 số (biển 7 ký tự) ──
      // VD: 29A1234
      const carOldMatch = cleanPlate.match(/^(\d{2})([A-Z])(\d{4})$/);
      if (carOldMatch) {
        const series = carOldMatch[2];
        if (['C', 'H', 'D'].includes(series)) return 'Truck';
        return 'Car';
      }

      // Default: không nhận dạng được → xe máy
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
    const isNoPlate = selectedVehicleType?.requiresPlate === false;

    if (!isNoPlate && !plate) {
      toast.error("Vui lòng nhập biển số xe!");
      return;
    }
    if (!facilityId || !selectedVehicleTypeId) {
      toast.error("Thiếu thông tin vị trí trực hoặc loại xe. Vui lòng đăng nhập lại!");
      return;
    }

    setIsSubmitting(true);
      try {
        const actualPlate = isNoPlate ? `NOPLATE-AUTO` : plate;
        
        const res = await sessionService.checkIn({
          facilityId,
          vehicleTypeId: selectedVehicleTypeId,
          licensePlate: actualPlate,
          gateIn,
          ...(checkInImage ? { checkInImage } : {}),
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
          manualTypeSelect.current = false; // Reset để auto-guesser hoạt động cho xe tiếp theo
          // Reset loại xe về mặc định (loại đầu tiên) để xe tiếp theo không bị kẹt ở loại xe đạp
          if (vehicleTypes.length > 0) {
            setSelectedVehicleTypeId(vehicleTypes[0]._id);
          }
        }
      } catch (error: any) {
        toast.error(error.message || "Lỗi khi tạo phiên đỗ xe!");
      } finally {
        setIsSubmitting(false);
      }
  };

  return (
    <div className="flex flex-col bg-white rounded-[16px] border border-[#e8e9e8] shadow-lg shadow-blue-500/20 px-5 pt-4 pb-4 h-full min-h-0 overflow-hidden">
      <h2 className="text-[17px] font-bold text-[#060606] mb-3 shrink-0">Đăng Ký Xe Vào</h2>

      {/* Form — không scroll, dùng gap đều */}
      <div className="flex flex-col gap-3 flex-1 min-h-0">
        {/* Toà nhà + Cổng trực */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-[#6b6b6b] mb-1">Toà nhà</label>
            <input type="text" value={facilityName} readOnly
              className="w-full h-8 px-3 bg-[#f5f5f4] border border-[#e8e9e8] rounded-[6px] text-[#6b6b6b] text-[12px] font-medium cursor-not-allowed outline-none" />
          </div>
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-[#6b6b6b] mb-1">Cổng trực</label>
            <input type="text" value={gateIn} readOnly
              className="w-full h-8 px-3 bg-[#f5f5f4] border border-[#e8e9e8] rounded-[6px] text-[#6b6b6b] text-[12px] font-medium cursor-not-allowed outline-none" />
          </div>
        </div>

        {/* Loại xe */}
        <div>
          <label className="block text-[11px] font-semibold text-[#060606] mb-1">Loại xe</label>
          <select value={selectedVehicleTypeId} onChange={(e) => {
              const newId = e.target.value;
              const newType = vehicleTypes.find(v => v._id === newId);
              setSelectedVehicleTypeId(newId);
              manualTypeSelect.current = true;
              // Nếu chuyển sang xe không biển → xóa plate OCR cũ
              if (newType?.requiresPlate === false) {
                setPlate("");
                setOcrSuccess(false);
              }
            }}
            className="w-full h-8 px-3 border border-[#e8e9e8] rounded-[6px] text-[12px] font-medium outline-none focus:border-[#060606]">
            {vehicleTypes.length === 0 && <option value="">Đang tải...</option>}
            {vehicleTypes.map((vt) => (<option key={vt._id} value={vt._id}>{vt.name}</option>))}
          </select>
        </div>

        {/* Biển số xe — ô nhập lớn làm điểm nhấn */}
        <div className="flex-1 flex flex-col gap-2 min-h-0 relative">
          <label className="block text-[12px] font-semibold text-[#060606] shrink-0">
            Biển số xe 
            {vehicleTypes.find((v) => v._id === selectedVehicleTypeId)?.requiresPlate === false && 
              <span className="text-[#8bc34a] ml-2 font-normal">(Không yêu cầu biển số)</span>
            }
          </label>

          {/* OCR Upload Zone — cho no-plate vehicles, đổi label thành "Chụp ảnh xe" */}
          {!previewUrl ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full flex-1 min-h-[80px] border-2 border-dashed border-[#e8e9e8] rounded-[10px] py-2 flex flex-col items-center justify-center gap-2 text-[#6b6b6b] hover:border-[#d7ee46] hover:bg-[#f9ffe0] hover:text-[#060606] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <><RefreshCw className="w-6 h-6 animate-spin text-[#8bc34a]" /><span className="text-[13px] font-semibold text-[#8bc34a]">Đang xử lý ảnh...</span></>
              ) : vehicleTypes.find((v) => v._id === selectedVehicleTypeId)?.requiresPlate === false ? (
                <><Camera className="w-7 h-7 text-[#8bc34a]" /><span className="text-[13px] font-semibold text-[#8bc34a]">📸 Chụp ảnh xe để đối chiếu khi ra</span><span className="text-[11px] text-[#aaa]">Bắt buộc — ảnh này sẽ dùng để xác minh khi xe ra</span></>
              ) : (
                <><ImagePlus className="w-7 h-7 text-[#aaa]" /><span className="text-[13px] font-semibold">Chụp / Upload ảnh biển số (OCR)</span><span className="text-[11px] text-[#aaa]">Hỗ trợ JPG, PNG — chụp thẳng góc, đủ sáng</span></>
              )}
            </button>
          ) : (
          <div className="relative mx-auto rounded-[10px] overflow-hidden border-2 border-[#d7ee46] bg-[#f5f5f4] flex-1 min-h-0" style={{aspectRatio: '1/1', maxHeight: '160px'}}>
              <img src={previewUrl} alt="preview" className="w-full h-full object-contain" />
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#d7ee46]" />
                  <span className="text-white text-[12px] font-semibold">Đang xử lý ảnh...</span>
                </div>
              )}
              {ocrSuccess && (
                <div className="absolute bottom-2 left-2 bg-green-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                  <CheckCircle className="w-3.5 h-3.5" /> OCR OK
                </div>
              )}
              {/* Badge cho no-plate: ảnh chụp xe */}
              {vehicleTypes.find((v) => v._id === selectedVehicleTypeId)?.requiresPlate === false && !ocrSuccess && (
                <div className="absolute bottom-2 left-2 bg-[#8bc34a] text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                  <CheckCircle className="w-3.5 h-3.5" /> Ảnh xe đã chụp
                </div>
              )}
              <button type="button" onClick={clearPreview}
                className="absolute top-2 right-2 w-6 h-6 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition shadow-md">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <input type="file" accept="image/*" capture="environment" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />

          {/* Ô nhập biển số — ẩn hoàn toàn nếu xe không cần biển */}
          {vehicleTypes.find((v) => v._id === selectedVehicleTypeId)?.requiresPlate !== false ? (
            <>
              <input
                type="text" 
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCheckIn(); } }}
                disabled={isSubmitting}
                className="w-full shrink-0 text-[18px] font-mono px-3 py-2 border border-[#e8e9e8] rounded-[8px] uppercase font-bold text-[#060606] placeholder-gray-300 outline-none focus:border-[#060606] focus:ring-1 focus:ring-[#060606] disabled:opacity-50"
                placeholder="XXX-XXX.XX"
              />
              {ocrSuccess && <p className="text-[10px] text-green-600 font-semibold text-center -mt-1">✓ Biển số tự động — kiểm tra lại trước khi xác nhận</p>}
            </>
          ) : (
            <div className="w-full shrink-0 text-center text-[13px] font-semibold text-[#8bc34a] bg-[#f0f9dc] border border-[#d7ee46] rounded-[8px] py-2.5">
              Xe không cần biển số — hệ thống tự tạo mã định danh
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto shrink-0 z-20">
          <button
            onClick={handleCheckIn}
            disabled={isSubmitting || (vehicleTypes.find((v) => v._id === selectedVehicleTypeId)?.requiresPlate !== false && !plate)}
            className="flex-1 h-10 bg-[#060606] text-[#d7ee46] rounded-[8px] font-bold text-[13px] hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Đang xử lý...</>
            ) : (
              "Ghi nhận xe vào (F2)"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
