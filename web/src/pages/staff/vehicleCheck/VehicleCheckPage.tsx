import { useState, useRef, useEffect } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { useLocation } from "react-router-dom";
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
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Fullscreen error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col bg-[#eff0ef] font-sans ${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'}`}
    >
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

      {/* 4 Panels (2x2 Grid) */}
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4 px-6 pb-4 overflow-hidden min-h-0">
        <CheckInPanel onCheckIn={setCheckInResult} />
        <CheckOutPanel plate={coPlateCam} onChangePlate={setCoPlateCam} onCheckOut={setCheckOutResult} onSearch={setCurrentCheckOutSession} />
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
