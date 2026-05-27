import { AlertTriangle, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface TerminalToolbarProps {
  onFlagException: () => void;
}

export default function TerminalToolbar({ onFlagException }: TerminalToolbarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-9 border-t border-[#e8e9e8] bg-white flex items-center justify-between px-6 text-[12px] text-[#6b6b6b] shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
      <div className="flex gap-6">
        <span className="font-mono text-[#060606] font-medium"><span className="text-[#6b6b6b]">F2:</span> Xe vào</span>
        <span className="font-mono text-[#060606] font-medium"><span className="text-[#6b6b6b]">F4:</span> Tìm vé ra</span>
        <span className="font-mono text-[#060606] font-medium"><span className="text-[#6b6b6b]">F8:</span> Mở chắn</span>
        <span className="font-mono text-[#060606] font-medium"><span className="text-[#6b6b6b]">F9:</span> Ngoại lệ</span>
        <span className="font-mono text-[#060606] font-medium"><span className="text-[#6b6b6b]">F10:</span> Hủy / Reset</span>
      </div>
      <div className="flex items-center gap-6">
        <button 
          onClick={onFlagException} 
          className="text-[#ef4444] font-bold hover:underline flex items-center gap-1.5 uppercase tracking-wide"
        >
          <AlertTriangle className="w-3.5 h-3.5"/> Exception (F9)
        </button>
        <div className="w-px h-4 bg-[#e8e9e8]" />
        <span className="font-semibold text-[#060606]">{currentTime.toLocaleDateString('vi-VN')}</span>
        <div className="flex items-center gap-1.5 font-mono font-bold text-[#060606] bg-[#f5f5f4] px-2 py-1 rounded">
          <Clock className="w-3.5 h-3.5 text-[#6b6b6b]" />
          {currentTime.toLocaleTimeString('vi-VN', { hour12: false })}
        </div>
      </div>
    </div>
  );
}
