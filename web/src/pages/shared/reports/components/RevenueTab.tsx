import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { revenueData } from '../mockData';
import { Wallet, TrendingUp, DollarSign } from 'lucide-react';

export function RevenueTab() {
  return (
    <div className="space-y-6">
      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-brand/10 text-brand rounded-full flex items-center justify-center shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tổng Doanh Thu</p>
            <p className="text-2xl font-bold text-gray-900">11,780,000đ</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Doanh Thu TB/Ngày</p>
            <p className="text-2xl font-bold text-gray-900">392,000đ</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tăng trưởng so với tháng trước</p>
            <p className="text-2xl font-bold text-gray-900">+12.5%</p>
          </div>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Biểu đồ Doanh thu</h2>
          <p className="text-sm text-gray-500">Xu hướng doanh thu theo tuần (Nghìn VNĐ)</p>
        </div>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dx={-10} />
              <Tooltip
                cursor={{ stroke: '#d7ee46', strokeWidth: 2, strokeDasharray: '5 5' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line
                type="monotone"
                dataKey="Doanh thu"
                stroke="#111827"
                strokeWidth={3}
                dot={{ r: 6, fill: '#d7ee46', strokeWidth: 2, stroke: '#111827' }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
