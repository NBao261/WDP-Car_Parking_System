import { useEffect } from "react";
import { toast } from "sonner";
import { facilityService } from "../../../../../services/facility.service";
import { apiClient } from "../../../../../services/api";
import { useCheckInLogic } from "./useCheckInLogic";
import { CheckInHeader } from "./CheckInHeader";
import { CheckInOCR } from "./CheckInOCR";
import { CheckInReservation } from "./CheckInReservation";
import { CheckInForm } from "./CheckInForm";
import { CheckInAction } from "./CheckInAction";

export function CheckInContainer({ onCheckIn }: { onCheckIn: (data: any) => void }) {
  const logic = useCheckInLogic(onCheckIn);

  useEffect(() => {
    const onF1 = () => {
      logic.setPlate(""); logic.setCheckInImage(null); logic.setPreviewUrl(null); logic.setOcrSuccess(false);
      logic.setReservationCode(""); logic.setReservationInfo(null); logic.setPlateMatchStatus('idle'); logic.setManualPlateConfirmed(false);
    };

    const onSpace = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();
        logic.handleCheckInClick();
      }
    };

    window.addEventListener("keydown", onSpace);
    window.addEventListener("HOTKEY_F1", onF1);
    return () => { window.removeEventListener("keydown", onSpace); window.removeEventListener("HOTKEY_F1", onF1); };
  }, [logic.plate, logic.isSubmitting, logic.vehicleTypes, logic.selectedVehicleTypeId, logic.checkInImage, logic.reservationCode, logic.reservationInfo, logic.plateMatchStatus, logic.manualPlateConfirmed, logic.pendingClear]);

  useEffect(() => {
    if (!logic.facilityId) return;
    facilityService.getOperationsConfig(logic.facilityId).then((res) => {
      if (res.success && res.data.allowedVehicleTypes.length > 0) {
        logic.setVehicleTypes(res.data.allowedVehicleTypes);
        logic.setSelectedVehicleTypeId(res.data.allowedVehicleTypes[0]._id);
      } else {
        logic.setVehicleTypes([]); logic.setSelectedVehicleTypeId("");
        toast.warning("Toà nhà này chưa được cấu hình loại xe. Liên hệ Admin.");
      }
    }).catch(() => toast.error("Không thể tải cấu hình loại xe"));
  }, [logic.facilityId]);

  useEffect(() => {
    if (!logic.facilityId) return;
    const fetchCapacity = async () => {
      try {
        const res: any = await apiClient.get(`/public/facilities/${logic.facilityId}/available-slots`);
        if (res.success && Array.isArray(res.data)) logic.setSlotAvailability(res.data);
      } catch { /* ignore */ }
      logic.setCapacityLoaded(true);
    };
    fetchCapacity();
    const interval = setInterval(fetchCapacity, 30000);
    return () => clearInterval(interval);
  }, [logic.facilityId]);

  useEffect(() => {
    if (!logic.plate || logic.vehicleTypes.length === 0) return;
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
    const category = guessVehicleCategory(logic.plate);
    if (!category) return;
    let targetType = logic.vehicleTypes.find(v => {
      const lowerName = v.name.toLowerCase();
      if (category === 'Truck') return lowerName.includes('tải') || lowerName.includes('truck');
      if (category === 'ElectricMotorbike') return lowerName.includes('máy điện') || lowerName.includes('xe điện');
      if (category === 'Car') return lowerName === 'ô tô' || lowerName === 'car' || (lowerName.includes('ô tô') && !lowerName.includes('điện'));
      if (category === 'Motorbike') return lowerName === 'xe máy' || lowerName === 'motorbike' || (lowerName.includes('máy') && !lowerName.includes('điện'));
      return false;
    });
    if (!targetType) {
      if (category === 'Truck' || category === 'Car') targetType = logic.vehicleTypes.find(v => v.name.toLowerCase().includes('ô tô'));
      else targetType = logic.vehicleTypes.find(v => v.name.toLowerCase().includes('máy'));
    }
    if (targetType && targetType._id !== logic.selectedVehicleTypeId) logic.setSelectedVehicleTypeId(targetType._id);
  }, [logic.plate, logic.vehicleTypes]);

  useEffect(() => {
    const toggleQrScannerAsync = async () => {
      if (logic.showQrScanner) {
        setTimeout(async () => {
          try {
            const { Html5Qrcode } = await import('html5-qrcode');
            const scanner = new Html5Qrcode('ci-qr-reader');
            logic.qrScannerRef.current = scanner;
            await scanner.start(
              { facingMode: 'environment' },
              { fps: 10, qrbox: 180 },
              (decodedText: string) => {
                scanner.stop().catch(() => { });
                logic.setShowQrScanner(false);
                const code = decodedText.trim().toUpperCase();
                logic.setReservationCode(code);
                logic.lookupReservation(code);
              },
              undefined
            );
          } catch { toast.error("Không mở được camera QR"); logic.setShowQrScanner(false); }
        }, 200);
      } else {
        try { await logic.qrScannerRef.current?.stop(); } catch { }
      }
    };
    toggleQrScannerAsync();
  }, [logic.showQrScanner]);

  useEffect(() => () => { logic.qrScannerRef.current?.stop().catch(() => { }); }, []);

  const isNoPlateVt = logic.vehicleTypes.find((v) => v._id === logic.selectedVehicleTypeId)?.requiresPlate === false;
  const displayPlate = isNoPlateVt ? "KBS-AUTO" : logic.plate;

  const toggleQrScanner = () => logic.setShowQrScanner(prev => !prev);

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <CheckInHeader facilityName={logic.facilityName} gateIn={logic.gateIn} checkInImage={logic.checkInImage} ocrSuccess={logic.ocrSuccess} />
      <div className="flex flex-col gap-3 flex-1 min-h-0">
        <div className="flex gap-3 shrink-0">
          <CheckInOCR previewUrl={logic.previewUrl} fileInputRef={logic.fileInputRef} isUploading={logic.isUploading} clearPreview={logic.clearPreview} handleImageUpload={logic.handleImageUpload} />
          <CheckInReservation
            inputReservationMode={logic.inputReservationMode} setInputReservationMode={logic.setInputReservationMode}
            reservationInfo={logic.reservationInfo} setReservationInfo={logic.setReservationInfo}
            plateMatchStatus={logic.plateMatchStatus} setPlateMatchStatus={logic.setPlateMatchStatus}
            manualPlateConfirmed={logic.manualPlateConfirmed} setManualPlateConfirmed={logic.setManualPlateConfirmed}
            setReservationCode={logic.setReservationCode} manualReservationCode={logic.manualReservationCode} setManualReservationCode={logic.setManualReservationCode}
            lookupReservation={logic.lookupReservation} showQrScanner={logic.showQrScanner} toggleQrScanner={toggleQrScanner}
          />
        </div>
        <CheckInForm
          displayPlate={displayPlate} plate={logic.plate} setPlate={logic.setPlate} checkInError={logic.checkInError} setCheckInError={logic.setCheckInError}
          isSubmitting={logic.isSubmitting} pendingClear={logic.pendingClear} handleCheckInEnter={logic.handleCheckInClick}
          selectedVehicleTypeId={logic.selectedVehicleTypeId} setSelectedVehicleTypeId={logic.setSelectedVehicleTypeId} vehicleTypes={logic.vehicleTypes}
        />
        <CheckInAction
          vehicleTypes={logic.vehicleTypes} selectedVehicleTypeId={logic.selectedVehicleTypeId} slotAvailability={logic.slotAvailability} capacityLoaded={logic.capacityLoaded}
          checkInError={logic.checkInError} isSubmitting={logic.isSubmitting} pendingClear={logic.pendingClear} plate={logic.plate} handleCheckInClick={logic.handleCheckInClick}
        />
      </div>
    </div>
  );
}
