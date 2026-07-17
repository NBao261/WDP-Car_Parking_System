import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ConfirmModal } from '../components/ConfirmModal';
import {
  LayoutDashboard,
  Map,
  Car,
  Wallet,
  Users,
  Settings,
  ScrollText,
  LogOut,
  ScanLine,
  Shield,
  Briefcase,
  type LucideIcon,
  AlertTriangle,
} from 'lucide-react';
import { useAuthStore } from '../store';
import { UserRole } from '../../../shared/types';

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  roles?: UserRole[];
  category?: string;
}

const NAV_ITEMS: NavItem[] = [
  // ── Admin ──
  { path: '/admin', label: 'Trang Chủ', icon: LayoutDashboard, roles: [UserRole.ADMIN], category: 'MENU CHÍNH' },
  { path: '/admin/facilities', label: 'Tòa nhà & Bãi đỗ', icon: Map, roles: [UserRole.ADMIN], category: 'MENU CHÍNH' },

  { path: '/admin/pricing', label: 'Bảng Giá', icon: Wallet, roles: [UserRole.ADMIN], category: 'MENU CHÍNH' },
  { path: '/admin/vehicles', label: 'Loại Xe', icon: Car, roles: [UserRole.ADMIN], category: 'MENU CHÍNH' },
  { path: '/admin/staff', label: 'Nhân Sự', icon: Briefcase, roles: [UserRole.ADMIN], category: 'MENU CHÍNH' },
  { path: '/admin/customers', label: 'Khách Hàng', icon: Users, roles: [UserRole.ADMIN], category: 'MENU CHÍNH' },
  { path: '/admin/roles', label: 'Phân Quyền', icon: Shield, roles: [UserRole.ADMIN], category: 'MENU CHÍNH' },

  // ── Manager ──
  { path: '/manager', label: 'Trang Chủ', icon: LayoutDashboard, roles: [UserRole.MANAGER], category: 'MENU CHÍNH' },
  {
    path: '/manager/assignments',
    label: 'Phân công tòa nhà',
    icon: Users,
    roles: [UserRole.MANAGER],
    category: 'MENU CHÍNH',
  },
  { path: '/manager/facilities', label: 'Tòa nhà & Bãi đỗ', icon: Map, roles: [UserRole.MANAGER], category: 'MENU CHÍNH' },
  { path: '/manager/pricing', label: 'Bảng Giá', icon: Wallet, roles: [UserRole.MANAGER], category: 'MENU CHÍNH' },
  { path: '/manager/vehicles', label: 'Loại Xe', icon: Car, roles: [UserRole.MANAGER], category: 'MENU CHÍNH' },
  {
    path: '/manager/exceptions',
    label: 'Quản Lý Sự Cố',
    icon: AlertTriangle,
    roles: [UserRole.MANAGER],
    category: 'MENU CHÍNH',
  },

  // ── Staff ──
  { path: '/staff', label: 'Xe Ra Vào', icon: ScanLine, roles: [UserRole.STAFF], category: 'MENU CHÍNH' },
  { path: '/staff/active-sessions', label: 'Xe Đang Gửi', icon: Car, roles: [UserRole.STAFF], category: 'MENU CHÍNH' },
  {
    path: '/staff/exceptions',
    label: 'Xử Lý Sự Cố',
    icon: AlertTriangle,
    roles: [UserRole.STAFF],
    category: 'MENU CHÍNH',
  },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getRoleLabel(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return 'Quản Trị Hệ Thống';
    case UserRole.MANAGER:
      return 'Quản Lý Cơ Sở';
    case UserRole.STAFF:
      return 'Nhân Viên Bãi Xe';
    default:
      return 'Người Dùng';
  }
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { logout, user } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const groupedItems = useMemo(() => {
    if (!user) return {};
    const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(user.role));

    const groups: Record<string, NavItem[]> = {
      'MENU CHÍNH': [],
    };

    items.forEach(item => {
      const cat = item.category || 'MENU CHÍNH';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });

    return groups;
  }, [user]);

  return (
    <>
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-[#f5f6f8] flex flex-col font-sans transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="h-20 flex items-center justify-start pl-3 pr-4 shrink-0">
          <img src="/Logo_chu.png" alt="LYNC Park Logo" className="h-20 w-auto py-1 object-contain" />
        </div>

        <nav className="flex-1 px-4 pb-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-2 mt-4">
            {groupedItems['MENU CHÍNH']?.map((item) => (
              <NavLink
                key={item.path}
                      to={item.path}
                      end={item.path === '/admin' || item.path === '/manager' || item.path === '/staff'}
                      onClick={onClose}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium text-[15px]
                        ${isActive
                          ? 'bg-white text-[#062F28] shadow-sm font-bold'
                          : 'text-gray-500 hover:bg-gray-200/50 hover:text-[#062F28]'
                        }
                      `}
                    >
                      <item.icon size={20} className="shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
            ))}
          </div>
        </nav>

        <div className="p-4 mt-auto shrink-0">
          <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
              <span className="font-bold text-sm">{user ? getInitials(user.name) : '??'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{user?.name ?? 'Guest'}</p>
              <p className="text-xs text-gray-500 truncate">
                {user ? getRoleLabel(user.role) : ''}
              </p>
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="text-gray-400 hover:text-brand transition-colors"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

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

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </>
  );
}
