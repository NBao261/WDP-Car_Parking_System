import { AlertTriangle, Clock, ScanLine, Car, AlertCircle, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../../../store";
import { ConfirmModal } from "../../../../components/ConfirmModal";

export default function TerminalToolbar() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-12 border-t border-[#e8e9e8] bg-white shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.02)] overflow-x-auto overflow-y-hidden">
      <div className="flex items-center justify-between px-4 text-[12px] text-[#6b6b6b] h-full min-w-max w-full gap-4">
      

      {/* Left: Staff Info */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center gap-2 border border-[#e8e9e8] px-3 py-1.5 rounded text-[11px] hover:bg-gray-50 transition-colors"
        >
          <div className="flex flex-col text-left">
            <span className="font-bold text-[#060606] truncate max-w-[80px]">{user?.name || "Staff_01"}</span>
            <span className="text-[9px] text-[#aaa]">Nhân viên Bãi Xe</span>
          </div>
          <LogOut className="w-3.5 h-3.5 text-[#6b6b6b] ml-1" />
        </button>

        {/* Hotkeys */}
        <div className="flex gap-2.5 ml-2">
          <span className="font-mono text-[#060606] font-medium whitespace-nowrap text-[10px]"><span className="text-[#6b6b6b]">Space:</span> Xe vào</span>
          <span className="font-mono text-[#060606] font-medium whitespace-nowrap text-[10px]"><span className="text-[#6b6b6b]">F1:</span> Reset xe vào</span>
          <span className="font-mono text-[#060606] font-medium whitespace-nowrap text-[10px]"><span className="text-[#6b6b6b]">Enter:</span> Xe ra</span>
          <span className="font-mono text-[#060606] font-medium whitespace-nowrap text-[10px]"><span className="text-[#6b6b6b]">F10:</span> Reset xe ra</span>
          <span className="font-mono text-[#060606] font-medium whitespace-nowrap text-[10px]"><span className="text-[#6b6b6b]">F9:</span> Ngoại lệ</span>
          <span className="font-mono text-[#060606] font-medium whitespace-nowrap text-[10px]"><span className="text-[#6b6b6b]">F11:</span> Toàn màn hình</span>
        </div>
      </div>

      {/* Center: Navigation Links */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate('/staff')} 
          className={`flex items-center gap-1.5 whitespace-nowrap text-[11px] transition-colors pb-0.5 ${
            location.pathname === '/staff'
              ? 'font-bold text-[#1a1a1a] border-b-2 border-[#9FE870]'
              : 'font-medium text-[#6b6b6b] hover:text-[#060606] border-b-2 border-transparent'
          }`}
        >
          <ScanLine className={`w-3.5 h-3.5 ${
            location.pathname === '/staff' ? 'text-[#9FE870]' : ''
          }`} /> Xe Ra Vào
        </button>
        <button 
          onClick={() => navigate('/staff/active-sessions')} 
          className={`flex items-center gap-1.5 whitespace-nowrap text-[11px] transition-colors pb-0.5 ${
            location.pathname.includes('/active-sessions')
              ? 'font-bold text-[#1a1a1a] border-b-2 border-[#9FE870]'
              : 'font-medium text-[#6b6b6b] hover:text-[#060606] border-b-2 border-transparent'
          }`}
        >
          <Car className={`w-3.5 h-3.5 ${
            location.pathname.includes('/active-sessions') ? 'text-[#9FE870]' : ''
          }`} /> Xe Đang Gửi
        </button>
        <button 
          onClick={() => navigate('/staff/exceptions')} 
          className={`flex items-center gap-1.5 whitespace-nowrap text-[11px] transition-colors pb-0.5 ${
            location.pathname.includes('/exceptions')
              ? 'font-bold text-[#1a1a1a] border-b-2 border-[#9FE870]'
              : 'font-medium text-[#6b6b6b] hover:text-[#060606] border-b-2 border-transparent'
          }`}
        >
          <AlertCircle className={`w-3.5 h-3.5 ${
            location.pathname.includes('/exceptions') ? 'text-[#9FE870]' : ''
          }`} /> Xử Lý Ngoại Lệ
        </button>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent("HOTKEY_F9"))} 
          className="bg-[#ef4444] text-white font-bold flex items-center gap-1.5 uppercase tracking-wide ml-2 whitespace-nowrap text-[10px] px-2.5 py-1 rounded-[5px] hover:bg-[#dc2626] transition-colors"
        >
          <AlertTriangle className="w-3 h-3"/> Exception (F9)
        </button>
      </div>

      {/* Right: Date & Time */}
      <div className="flex items-center gap-4">
        <span className="font-bold text-[#060606] text-[13px]">{currentTime.toLocaleDateString('vi-VN')}</span>
        <div className="flex items-center gap-1.5 font-mono font-bold text-[#060606] text-[13px]">
          <Clock className="w-4 h-4 text-[#6b6b6b]" />
          {currentTime.toLocaleTimeString('vi-VN', { hour12: false })}
        </div>
      </div>

      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={logout}
        title="Xác nhận Đăng xuất"
        message="Bạn có chắc chắn muốn kết thúc ca làm việc và đăng xuất không?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        variant="danger"
      />
      </div>
    </div>
  );
}
