import { Outlet, NavLink } from "react-router";
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Car, 
  AlertTriangle,
  LogOut
} from "lucide-react";

import logoImg from "../../imports/image-2.png";

export function Layout() {
  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/terminal", label: "Vehicle Check-in/Out", icon: ArrowRightLeft },
    { path: "/sessions", label: "Active Sessions", icon: Car },
    { path: "/exceptions", label: "Exceptions Queue", icon: AlertTriangle },
  ];

  return (
    <div className="flex h-screen w-full bg-[#f4f5f4] text-[#060606] font-sans">
      {/* Sidebar */}
      <aside className="w-[240px] flex-shrink-0 bg-[#eff0ef] flex flex-col h-full border-r border-gray-200">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="LYNC Park" className="w-8 h-8 object-contain rounded-md" />
            <span className="font-semibold text-lg tracking-tight">LYNC Park</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#ffffff] shadow-sm text-[#060606]"
                    : "text-[#060606]/70 hover:bg-white/50 hover:text-[#060606]"
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom User Card */}
        <div className="p-3">
          <div className="bg-[#ffffff] p-3 rounded-xl shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop" alt="Staff" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium truncate">N.T Yen Nhi</span>
                <span className="text-[11px] text-[#060606]/60 truncate mt-0.5">Staff • Gate 2 • Topaz 2</span>
              </div>
            </div>
            
            <div className="h-px bg-gray-100 w-full" />
            
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#060606]/60">06:00 - 14:00</span>
              <button className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 transition-colors font-medium">
                <LogOut className="w-3.5 h-3.5" />
                Log out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}