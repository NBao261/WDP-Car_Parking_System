import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuthStore } from '../store';
import { LogOut, ScanLine, Car, AlertTriangle } from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';

const STAFF_NAV = [
  { path: '/staff', label: 'Xe Ra Vào', icon: ScanLine },
  { path: '/staff/active-sessions', label: 'Xe Đang Gửi', icon: Car },
  { path: '/staff/exceptions', label: 'Xử Lý Ngoại Lệ', icon: AlertTriangle },
];

export default function StaffLayout() {
  const { user, logout } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-[#eff0ef] text-brand font-sans overflow-hidden">
      {/* HEADER */}
      <header className="h-14 flex items-center justify-between px-4 lg:px-6 bg-white border-b border-gray-100 shrink-0 shadow-sm z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center shrink-0 overflow-hidden">
            <img src="/Logo.png" alt="ParkMaster Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-lg tracking-tight hidden sm:block">LYNC PARK</span>
        </div>

        <nav className="flex items-center gap-1 h-full">
          {STAFF_NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/staff'}
              className={({ isActive }) => `
                flex items-center gap-2 px-4 h-full border-b-2 transition-colors font-medium text-sm
                ${isActive ? 'border-[#d7ee46] text-[#060606] bg-gray-50/50' : 'border-transparent text-gray-500 hover:text-[#060606] hover:bg-gray-50'}
              `}
            >
              <item.icon size={18} />
              <span className="hidden md:inline">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="font-semibold text-sm leading-tight">{user?.name ?? 'Guest'}</p>
            <p className="text-[11px] text-gray-500">Nhân Viên Bãi Xe</p>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors"
            title="Đăng xuất"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto min-h-0 flex flex-col">
        <Outlet />
      </main>

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
  );
}
