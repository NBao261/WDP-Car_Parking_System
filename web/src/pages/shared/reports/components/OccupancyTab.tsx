import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { occupancyData, vehicleTypePieData } from '../mockData';

const COLORS = ['#d7ee46', '#111827', '#9ca3af'];

export function OccupancyTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Tỷ lệ lấp đầy theo tầng */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Tỷ lệ lấp đầy theo Tầng</h2>
          <p className="text-sm text-gray-500">Số lượng xe hiện tại tại mỗi tầng</p>
        </div>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={occupancyData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
              <YAxis dataKey="floor" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
              <Tooltip
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="Ôtô" stackId="a" fill="#111827" maxBarSize={30} />
              <Bar dataKey="XeMáy" stackId="a" fill="#d7ee46" maxBarSize={30} />
              <Bar dataKey="ĐạpĐiện" stackId="a" fill="#9ca3af" maxBarSize={30} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tỷ lệ loại xe */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Phân bố Loại xe</h2>
          <p className="text-sm text-gray-500">Tỷ lệ các loại phương tiện trong bãi</p>
        </div>
        <div className="h-[350px] flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={vehicleTypePieData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {vehicleTypePieData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
          {/* Lõi Pie chart */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
            <span className="text-3xl font-bold text-gray-900">1470</span>
            <span className="text-sm text-gray-500">Tổng xe</span>
          </div>
        </div>
      </div>
    </div>
  );
}
