import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../store';
import { ConfirmModal } from '../components/ConfirmModal';
import TerminalToolbar from '../pages/staff/vehicleCheck/components/TerminalToolbar';

export default function StaffLayout() {
  const { logout } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // We could expose a way for children to trigger logout, 
  // but for now they can dispatch a custom event or use the store directly.
  return (
    <div className="flex flex-col h-screen bg-[#eff0ef] text-brand font-sans overflow-hidden">
      {/* MAIN CONTENT - No top header, full screen layout */}
      <main className="flex-1 overflow-y-auto min-h-0 flex flex-col">
        <Outlet />
      </main>

      <TerminalToolbar />

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
