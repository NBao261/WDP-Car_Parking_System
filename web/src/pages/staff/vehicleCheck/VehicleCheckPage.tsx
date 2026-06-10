import { useState, useRef, useEffect } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import CheckInPanel from "./components/CheckInPanel";
import CheckOutPanel from "./components/CheckOutPanel";
import CheckInConfirmPanel from "./components/CheckInConfirmPanel";
import CheckOutConfirmPanel from "./components/CheckOutConfirmPanel";
import TerminalToolbar from "./components/TerminalToolbar";
import GlobalExceptionPanel from "./components/GlobalExceptionPanel";

export default function VehicleCheckPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExceptionPanel, setShowExceptionPanel] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  
  // State from exceptions routing if any
  const initialPlate = location.state?.plate || "";
  const [coPlateCam, setCoPlateCam] = useState(initialPlate);

  const [checkInResult, setCheckInResult] = useState<any>(null);
  const [checkOutResult, setCheckOutResult] = useState<any>(null);
  const [currentCheckOutSession, setCurrentCheckOutSession] = useState<any>(null);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };



  // GLOBAL HOTKEYS
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input and presses a non-function key, 
      // but function keys should be intercepted.
      switch (e.key) {
        case "F2":
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("HOTKEY_F2"));
          break;
        case "F4":
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("HOTKEY_F4"));
          break;
        case "F8":
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("HOTKEY_F8"));
          break;
        case "F9":
          e.preventDefault();
          setShowExceptionPanel(true);
          break;
        case "F10":
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("HOTKEY_F10"));
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
      className={`flex flex-col bg-[#eff0ef] font-sans ${
        isFullscreen 
          ? 'fixed inset-0 z-50' 
          : 'flex-1 min-h-0 -mx-4 lg:-mx-8 -mt-[10px] -mb-4 lg:-mb-8'
      }`}
    >
      {/* Toaster riêng cho fullscreen — hiển thị toast ngay trong stacking context của fullscreen */}
      <Toaster position="top-right" richColors />

      {/* Top Control */}
      <div className="flex justify-end px-4 py-2 shrink-0">
        <button 
          onClick={toggleFullscreen} 
          className="p-1.5 bg-white border border-[#e8e9e8] rounded-md text-[#6b6b6b] hover:text-[#060606] shadow-sm transition-colors"
          title="Phóng toàn màn hình"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4"/> : <Maximize2 className="w-4 h-4"/>}
        </button>
      </div>

      {/* 4 Panels — rows: 3fr (thao tác) / 2fr (xác nhận) */}
      <div className="flex-1 grid grid-cols-2 grid-rows-[3fr_2fr] gap-4 px-6 pb-4 overflow-hidden min-h-0">
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

      {/* BOTTOM TOOLBAR */}
      <TerminalToolbar onFlagException={() => setShowExceptionPanel(true)} />

      {/* GLOBAL EXCEPTION SLIDE-OVER PANEL */}
      {showExceptionPanel && (
        <GlobalExceptionPanel 
          coPlateCam={coPlateCam} 
          currentSession={currentCheckOutSession}
          onClose={() => setShowExceptionPanel(false)} 
        />
      )}
    </div>
  );
}
