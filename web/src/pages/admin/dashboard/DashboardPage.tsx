import { LayoutDashboard, Users, Map, Car, Wallet, Settings, ScrollText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../../store';

const quickLinks = [
  { path: '/admin/users', label: 'Users & Roles', icon: Users, desc: 'Quản lý tài khoản Manager & Staff' },
  { path: '/admin/facilities', label: 'Facilities', icon: Map, desc: 'Quản lý bãi xe, tầng, slot' },
  { path: '/admin/billing', label: 'Pricing & Revenue', icon: Wallet, desc: 'Bảng giá & doanh thu' },
  { path: '/admin/config', label: 'System Config', icon: Settings, desc: 'Cấu hình hệ thống' },
  { path: '/admin/logs', label: 'Audit Logs', icon: ScrollText, desc: 'Nhật ký hoạt động' },
];

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#060606]">System Overview</h1>
          <p className="text-gray-500 text-sm">
            Xin chào, <span className="font-semibold text-[#060606]">{user?.name}</span> —{' '}
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Quick nav cards */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Chức năng quản trị</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md hover:border-[#d7ee46] transition-all duration-200 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-50 group-hover:bg-[#d7ee46]/20 flex items-center justify-center shrink-0 transition-colors">
                <item.icon size={22} className="text-[#060606] group-hover:text-[#96a827] transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#060606] mb-0.5">{item.label}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
              <ArrowRight size={16} className="text-gray-300 group-hover:text-[#96a827] shrink-0 mt-1 transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Coming soon banner */}
      <div className="bg-[#060606] rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <LayoutDashboard size={24} className="text-[#d7ee46]" />
          </div>
          <div>
            <p className="font-bold">Dashboard tổng quan đang được phát triển</p>
            <p className="text-white/60 text-sm">Biểu đồ, KPI và báo cáo realtime sẽ sớm ra mắt.</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 bg-[#d7ee46]/20 text-[#d7ee46] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-[#d7ee46]/30 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d7ee46] animate-pulse" />
          Coming Soon
        </span>
      </div>
    </div>
  );
}
