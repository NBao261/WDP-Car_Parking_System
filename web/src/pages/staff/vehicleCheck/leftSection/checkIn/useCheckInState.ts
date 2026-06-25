import { useState, useRef } from "react";
import { VehicleType } from "../../../../../services/vehicleType.service";

export interface SlotAvailability {
  vehicleTypeId: string;
  vehicleTypeName: string;
  availableCount: number;
}

export function useCheckInState() {
  const [plate, setPlate] = useState("");
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [selectedVehicleTypeId, setSelectedVehicleTypeId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkInImage, setCheckInImage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [pendingClear, setPendingClear] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [checkInError, setCheckInError] = useState<string | null>(null);

  // Terminal / facility
  const facilityId = sessionStorage.getItem("staff_facility_id") || "";
  const facilityName = sessionStorage.getItem("staff_facility_name") || "Chưa chọn Toà nhà";
  const gateIn = sessionStorage.getItem("staff_gate_name") || `Cổng - ${facilityName}`;

  // Reservation
  const [reservationCode, setReservationCode] = useState("");
  const [reservationInfo, setReservationInfo] = useState<any>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [plateMatchStatus, setPlateMatchStatus] = useState<'idle' | 'match' | 'mismatch'>('idle');
  const [manualPlateConfirmed, setManualPlateConfirmed] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [inputReservationMode, setInputReservationMode] = useState<'qr' | 'code'>('qr');
  const [manualReservationCode, setManualReservationCode] = useState("");
  const qrScannerRef = useRef<any>(null);

  // Capacity status
  const [slotAvailability, setSlotAvailability] = useState<SlotAvailability[]>([]);
  const [capacityLoaded, setCapacityLoaded] = useState(false);

  return {
    plate, setPlate,
    vehicleTypes, setVehicleTypes,
    selectedVehicleTypeId, setSelectedVehicleTypeId,
    isSubmitting, setIsSubmitting,
    checkInImage, setCheckInImage,
    previewUrl, setPreviewUrl,
    isUploading, setIsUploading,
    ocrSuccess, setOcrSuccess,
    pendingClear, setPendingClear,
    fileInputRef,
    checkInError, setCheckInError,
    facilityId, facilityName, gateIn,
    reservationCode, setReservationCode,
    reservationInfo, setReservationInfo,
    isLookingUp, setIsLookingUp,
    plateMatchStatus, setPlateMatchStatus,
    manualPlateConfirmed, setManualPlateConfirmed,
    showQrScanner, setShowQrScanner,
    inputReservationMode, setInputReservationMode,
    manualReservationCode, setManualReservationCode,
    qrScannerRef,
    slotAvailability, setSlotAvailability,
    capacityLoaded, setCapacityLoaded
  };
}
