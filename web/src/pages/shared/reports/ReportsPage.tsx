import * as Tabs from '@radix-ui/react-tabs';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { TrafficTab } from './components/TrafficTab';
import { RevenueTab } from './components/RevenueTab';
import { OccupancyTab } from './components/OccupancyTab';
import { PeakHoursTab } from './components/PeakHoursTab';

export default function ReportsPage() {
  const handleExport = (type: 'excel' | 'pdf') => {
    toast.info(`Đang xuất dữ liệu ra file ${type.toUpperCase()}...`);
    // Ở đây sẽ gọi API xuất file của Backend trong tương lai
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
          <p className="text-gray-500">Xem tổng quan về hoạt động của bãi đỗ xe</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <FileText size={18} />
            Xuất Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-brand text-brand-dark rounded-xl hover:brightness-95 transition-all text-sm font-medium shadow-sm"
          >
            <Download size={18} />
            Xuất PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs.Root defaultValue="traffic" className="flex flex-col gap-6">
        <Tabs.List className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm w-fit">
          <Tabs.Trigger
            value="traffic"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 transition-colors"
          >
            Lượt xe
          </Tabs.Trigger>
          <Tabs.Trigger
            value="revenue"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 transition-colors"
          >
            Doanh thu
          </Tabs.Trigger>
          <Tabs.Trigger
            value="occupancy"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 transition-colors"
          >
            Lấp đầy
          </Tabs.Trigger>
          <Tabs.Trigger
            value="peakhours"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 transition-colors"
          >
            Cao điểm
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="traffic" className="outline-none">
          <TrafficTab />
        </Tabs.Content>
        <Tabs.Content value="revenue" className="outline-none">
          <RevenueTab />
        </Tabs.Content>
        <Tabs.Content value="occupancy" className="outline-none">
          <OccupancyTab />
        </Tabs.Content>
        <Tabs.Content value="peakhours" className="outline-none">
          <PeakHoursTab />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
