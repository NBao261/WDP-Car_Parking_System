import CurrentOccupancy from './statisticCards/CurrentOccupancy';
import TotalTraffic from './statisticCards/TotalTraffic';
import TableSessionsPage from './tableSessions/TableSessionsPage';

export default function ActiveSessionsPage() {
  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-hidden">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-[#060606]">Active Sessions</h1>
        <p className="text-sm text-gray-500 mt-1">Theo dõi danh sách xe đang trong bãi và hỗ trợ tìm kiếm, thanh toán nhanh.</p>
      </div>
      
      {/* Top Statistic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        <div className="md:col-span-1">
          <CurrentOccupancy />
        </div>
        <div className="md:col-span-2">
          <TotalTraffic />
        </div>
      </div>

      {/* Main Table Area */}
      <div className="flex-1 min-h-0">
        <TableSessionsPage />
      </div>
    </div>
  );
}