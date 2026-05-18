import { useState, useEffect, useRef } from "react";
import { Maximize, Minimize, Zap } from "lucide-react";
import CheckinStaffPage from "./checkinStaff/CheckinStaffPage";
import CheckoutStaffPage from "./checkoutStaff/CheckoutStaffPage";

export default function VehicleCheckPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        alert("Action Logged: Manual Emergency Barrier Open triggered by Staff at " + new Date().toLocaleTimeString());
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col h-full bg-[#f4f5f4] transition-all duration-300 ${isFullscreen ? 'p-6 fixed inset-0 z-50 overflow-y-auto' : 'pb-10 max-w-[1400px] mx-auto'
        }`}
    >
      {/* Top Header Controls */}
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-xl font-bold flex items-center gap-3 text-[#060606]">
          Gate Control Terminal
          <span className="text-xs font-semibold text-white bg-[#060606] px-3 py-1 rounded-full uppercase tracking-wider">
            Manual Gate Flow
          </span>
        </h1>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#060606]/60 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
            <Zap className="w-3.5 h-3.5 text-[#d7ee46] fill-[#d7ee46]" />
            Press <kbd className="font-mono bg-white border border-gray-300 rounded px-1.5 py-0.5 text-[10px] text-[#060606]">Enter</kbd> to quick-open barrier
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-[#060606] rounded-xl transition-colors border border-gray-200 focus:outline-none"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Split Screen Side-by-Side Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Left Side: Check-in */}
        <div className="flex flex-col h-full">
          <CheckinStaffPage />
        </div>

        {/* Right Side: Check-out */}
        <div className="flex flex-col h-full">
          <CheckoutStaffPage />
        </div>
      </div>
    </div>
  );
}
