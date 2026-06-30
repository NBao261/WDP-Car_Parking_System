import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { TrafficReportData, RevenueReportData } from '../../../../services/report.service';
import { format } from 'date-fns';

interface DashboardChartsProps {
  trafficData: TrafficReportData | null;
  revenueData: RevenueReportData | null;
}

export function DashboardCharts({ trafficData, revenueData }: DashboardChartsProps) {
  const formatYAxis = (tickItem: number) => {
    if (tickItem >= 1000000) {
      return `${(tickItem / 1000000).toFixed(1)}M`;
    }
    if (tickItem >= 1000) {
      return `${(tickItem / 1000).toFixed(1)}k`;
    }
    return tickItem.toString();
  };

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Traffic Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">Lưu lượng phương tiện</h3>
          <p className="text-sm text-gray-500">Số lượt xe vào/ra theo ngày</p>
        </div>
        <div className="h-[300px]">
          {trafficData?.data && trafficData.data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCheckIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#062F28" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#062F28" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCheckOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9FE870" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#9FE870" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={formatYAxis} />
                <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Area type="monotone" name="Lượt vào" dataKey="checkIn" stroke="#062F28" strokeWidth={2} fillOpacity={1} fill="url(#colorCheckIn)" />
                <Area type="monotone" name="Lượt ra" dataKey="checkOut" stroke="#9FE870" strokeWidth={2} fillOpacity={1} fill="url(#colorCheckOut)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">Không có dữ liệu lưu lượng</div>
          )}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">Doanh thu</h3>
          <p className="text-sm text-gray-500">Biểu đồ doanh thu theo ngày</p>
        </div>
        <div className="h-[300px]">
          {revenueData?.byTimePeriod && revenueData.byTimePeriod.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData.byTimePeriod} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={formatYAxis} />
                <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
                <Tooltip 
                  formatter={(value: number) => [formatVND(value), 'Doanh thu']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                  cursor={{ fill: '#F3F4F6' }}
                />
                <Bar name="Doanh thu" dataKey="totalRevenue" fill="#062F28" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">Không có dữ liệu doanh thu</div>
          )}
        </div>
      </div>
    </div>
  );
}
