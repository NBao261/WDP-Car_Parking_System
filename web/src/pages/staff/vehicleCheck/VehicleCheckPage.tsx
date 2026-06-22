import { useState, useRef, useEffect } from "react";

import { useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import CheckInPanel from "./components/CheckInPanel";
import CheckOutPanel from "./components/CheckOutPanel";
import CheckInConfirmPanel from "./components/CheckInConfirmPanel";
import CheckOutConfirmPanel from "./components/CheckOutConfirmPanel";
import GlobalExceptionPanel from "./components/GlobalExceptionPanel";

export default function VehicleCheckPage() {
  const [showExceptionPanel, setShowExceptionPanel] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  
  // State from exceptions routing if any
  const initialPlate = location.state?.plate || "";
  const [coPlateCam, setCoPlateCam] = useState(initialPlate);

  const [checkInResult, setCheckInResult] = useState<any>(null);
  const [checkOutResult, setCheckOutResult] = useState<any>(null);
  const [currentCheckOutSession, setCurrentCheckOutSession] = useState<any>(null);

  // GLOBAL HOTKEYS
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input and presses a non-function key, 
      // but function keys should be intercepted.
      switch (e.key) {
        case "F1":
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("HOTKEY_F1"));
          break;
        case "F9":
          e.preventDefault();
          setShowExceptionPanel(true);
          break;
        case "F10":
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("HOTKEY_F10"));
          break;
        case "F11":
          e.preventDefault();
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            if (document.exitFullscreen) document.exitFullscreen();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="flex flex-col flex-1 min-h-0 bg-[#eff0ef] font-sans pt-2"
    >
      {/* Toaster riêng cho fullscreen — hiển thị toast ngay trong stacking context của fullscreen */}
      <Toaster position="top-right" richColors />

      {/* 4 Panels — rows: 7fr (thao tác) / 3fr (xác nhận) */}
      <div className="flex-1 grid grid-cols-2 grid-rows-[7fr_3fr] gap-4 px-6 pb-4 overflow-hidden min-h-0">
        <CheckInPanel onCheckIn={setCheckInResult} />
        <CheckOutPanel
          plate={coPlateCam}
          onChangePlate={setCoPlateCam}
          onCheckOut={setCheckOutResult}
          onSearch={setCurrentCheckOutSession}
          onFlagException={() => setShowExceptionPanel(true)}
        />
        <CheckInConfirmPanel data={checkInResult} />
        <CheckOutConfirmPanel data={checkOutResult} />
      </div>

      {/* GLOBAL EXCEPTION SLIDE-OVER PANEL */}
      {showExceptionPanel && (
        <GlobalExceptionPanel 
          coPlateCam={coPlateCam}
          currentSession={currentCheckOutSession}
          onClose={() => setShowExceptionPanel(false)}
          onExceptionCreated={() => {
            window.dispatchEvent(new CustomEvent("RESET_CHECKOUT"));
          }}
        />
      )}
    </div>
  );
}
