import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  Car,
  Wallet,
  Users,
  Settings,
  ScrollText,
  LogOut,
  ClipboardList,
  ScanLine,
  Shield,
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
}

const NAV_ITEMS: NavItem[] = [
  // ── Admin ──
  { path: '/admin', label: 'Tổng Quan', icon: LayoutDashboard, roles: [UserRole.ADMIN] },
  { path: '/admin/facilities', label: 'Cơ Sở', icon: Map, roles: [UserRole.ADMIN] },
  { path: '/admin/vehicles', label: 'Loại Xe', icon: Car, roles: [UserRole.ADMIN] },

  { path: '/admin/pricing', label: 'Bảng Giá & Doanh Thu', icon: Wallet, roles: [UserRole.ADMIN] },
  { path: '/admin/users', label: 'Người Dùng', icon: Users, roles: [UserRole.ADMIN] },
  { path: '/admin/roles', label: 'Phân Quyền', icon: Shield, roles: [UserRole.ADMIN] },
  { path: '/admin/config', label: 'Cấu Hình Hệ Thống', icon: Settings, roles: [UserRole.ADMIN] },
  { path: '/admin/logs', label: 'Lịch Sử Hoạt Động', icon: ScrollText, roles: [UserRole.ADMIN] },

  // ── Manager ──
  { path: '/manager', label: 'Tổng Quan', icon: LayoutDashboard, roles: [UserRole.MANAGER] },
  { path: '/manager/zones', label: 'Khu Vực', icon: Map, roles: [UserRole.MANAGER] },
  { path: '/manager/vehicles', label: 'Loại Xe', icon: Car, roles: [UserRole.MANAGER] },
  { path: '/manager/reports', label: 'Báo Cáo', icon: ClipboardList, roles: [UserRole.MANAGER] },

  // ── Staff ──
  { path: '/staff', label: 'Xe Ra Vào', icon: ScanLine, roles: [UserRole.STAFF] },
  { path: '/staff/active-sessions', label: 'Xe Đang Gửi', icon: Car, roles: [UserRole.STAFF] },
  { path: '/staff/exceptions', label: 'Xử Lý Ngoại Lệ', icon: AlertTriangle, roles: [UserRole.STAFF] },
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

  const visibleNavItems = useMemo(() => {
    if (!user) return [];
    return NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(user.role));
  }, [user]);

  return (
    <>
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-[#eff0ef] flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="h-20 flex items-center px-6 gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#d7ee46] flex items-center justify-center shrink-0">
             <Car className="w-6 h-6 text-[#060606]" />
          </div>
          <span className="font-bold text-xl tracking-tight text-[#060606]">LYNC PARK</span>
        </div>

        <nav className="flex-1 px-4 pb-6 space-y-1.5 overflow-y-auto">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin' || item.path === '/manager' || item.path === '/staff'}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all duration-200 font-medium text-sm
                ${isActive ? 'bg-white text-[#060606] shadow-sm' : 'text-[#060606]/70 hover:bg-black/5 hover:text-[#060606]'}
              `}
            >
              <item.icon size={20} className="shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto shrink-0">
          <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <span className="font-bold text-sm text-[#060606]">{user ? getInitials(user.name) : '??'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate text-[#060606]">{user?.name ?? 'Guest'}</p>
              <p className="text-xs text-[#060606]/60 truncate">
                {user ? getRoleLabel(user.role) : ''}
              </p>
            </div>
            <button
              onClick={logout}
              className="text-[#060606]/40 hover:text-[#060606] transition-colors"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

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
