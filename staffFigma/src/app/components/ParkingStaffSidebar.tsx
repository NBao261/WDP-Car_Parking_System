import {
  LogIn,
  LogOut,
  FileText,
  AlertTriangle,
  List,
  User,
  LogOut as SignOut,
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface ParkingStaffSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function ParkingStaffSidebar({ activeView, onViewChange }: ParkingStaffSidebarProps) {

  const menuItems: MenuItem[] = [
    { id: 'check-in', label: 'Xe Vào Bãi', icon: LogIn },
    { id: 'active-sessions', label: 'Lượt Gửi Đang Hoạt Động', icon: List, badge: 12 },
    { id: 'check-out', label: 'Xe Ra Bãi', icon: LogOut },
    { id: 'exceptions', label: 'Xử Lý Ngoại Lệ', icon: AlertTriangle, badge: 3 },
    { id: 'sessions', label: 'Tạo Lượt Gửi Xe', icon: FileText },
  ];

  return (
    <div className="h-screen w-64 flex flex-col" style={{ backgroundColor: '#eff0ef' }}>
      {/* Brand Header */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <img
            src="figma:asset/z7823973289945_9ce6cec185bf039ee954bcb3c05b55f9.jpg"
            alt="LYNC Logo"
            className="w-14 h-14 rounded-xl object-cover"
          />
          <div>
            <h1 className="font-semibold" style={{ color: '#060606', fontSize: '18px' }}>
              LYNC Parking
            </h1>
            <p className="text-xs" style={{ color: '#060606', opacity: 0.6 }}>
              Parking Staff
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02]"
              style={{
                backgroundColor: isActive ? '#ffffff' : 'transparent',
                color: '#060606',
              }}
            >
              <Icon size={20} style={{ color: '#060606', opacity: isActive ? 1 : 0.6 }} />
              <span
                className="flex-1 text-left text-sm font-medium"
                style={{ opacity: isActive ? 1 : 0.7 }}
              >
                {item.label}
              </span>
              {item.badge && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: '#d7ee46',
                    color: '#060606',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Card */}
      <div className="p-4">
        <div
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{ backgroundColor: '#ffffff' }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#d7ee46' }}
          >
            <User size={20} style={{ color: '#060606' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate" style={{ color: '#060606' }}>
              Nguyễn Văn A
            </p>
            <p className="text-xs truncate" style={{ color: '#060606', opacity: 0.6 }}>
              Cổng A - Ca Sáng
            </p>
          </div>
          <button
            className="p-2 rounded-lg hover:bg-black/5 transition-colors"
            title="Đăng xuất"
          >
            <SignOut size={18} style={{ color: '#060606', opacity: 0.6 }} />
          </button>
        </div>
      </div>
    </div>
  );
}
