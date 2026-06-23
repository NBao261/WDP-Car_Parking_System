import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { trafficData } from '../mockData';

export function TrafficTab() {
  const [timeFilter, setTimeFilter] = useState('week'); // week, month, year

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Biểu đồ lượt xe ra/vào</h2>
          <p className="text-sm text-gray-500">Thống kê số lượng phương tiện lưu thông</p>
        </div>
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="week">7 ngày qua</option>
          <option value="month">Tháng này</option>
          <option value="year">Năm nay</option>
        </select>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trafficData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dx={-10} />
            <Tooltip
              cursor={{ fill: '#f3f4f6' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="Xe Vào" fill="#d7ee46" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="Xe Ra" fill="#111827" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
