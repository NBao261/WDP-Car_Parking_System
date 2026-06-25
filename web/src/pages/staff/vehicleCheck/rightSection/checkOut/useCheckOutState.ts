import { useState, useRef } from "react";
import { ParkingSession } from "../../../../../services/session.service";

export function useCheckOutState() {
  const [searchInput, setSearchInput] = useState('');
  const [searchMode, setSearchMode] = useState<'code' | 'plate'>('code');
  const [plateIn, setPlateIn] = useState('');
  const [vehicleTypeName, setVehicleTypeName] = useState('Không có dữ liệu');
  const [checkInTimeDisplay, setCheckInTimeDisplay] = useState('Không có dữ liệu');
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
  const [panelMsg, setPanelMsg] = useState<{ text: string, type: 'error' | 'success' | 'warning' } | null>(null);

  // Momo States
  const [momoQR, setMomoQR] = useState<string | null>(null);
  const [transactionCode, setTransactionCode] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const building = sessionStorage.getItem('staff_facility_name') || 'Chưa chọn Toà nhà';
  const gateOut = sessionStorage.getItem('staff_gate_name') || `Cổng - ${building}`;

  const showMsg = (text: string, type: 'error' | 'success' | 'warning' = 'error') => {
    setPanelMsg({ text, type });
    setTimeout(() => {
      setPanelMsg(prev => prev?.text === text ? null : prev);
    }, 5000);
  };

  return {
    searchInput, setSearchInput,
    searchMode, setSearchMode,
    plateIn, setPlateIn,
    vehicleTypeName, setVehicleTypeName,
    checkInTimeDisplay, setCheckInTimeDisplay,
    step, setStep,
    currentSession, setCurrentSession,
    isSubmitting, setIsSubmitting,
    isUploading, setIsUploading,
    ocrPreviewUrl, setOcrPreviewUrl,
    ocrSuccess, setOcrSuccess,
    checkoutImageUrl, setCheckoutImageUrl,
    isNoPlateVehicle, setIsNoPlateVehicle,
    manualConfirmed, setManualConfirmed,
    paymentSuccess, setPaymentSuccess,
    panelMsg, setPanelMsg, showMsg,
    momoQR, setMomoQR,
    transactionCode, setTransactionCode,
    isPolling, setIsPolling,
    searchInputRef, fileInputRef, pollIntervalRef,
    building, gateOut
  };
}
