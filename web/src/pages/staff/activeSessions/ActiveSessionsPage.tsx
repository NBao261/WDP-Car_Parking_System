import CurrentOccupancy from './statisticCards/CurrentOccupancy';
import TotalTraffic from './statisticCards/TotalTraffic';
import TableSessionsPage from './tableSessions/TableSessionsPage';

export default function ActiveSessionsPage() {
  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden">
      {/* Page Title — compact */}
      <div className="shrink-0 px-1 pt-1">
        <h1 className="text-xl font-bold text-[#060606]">Active Sessions</h1>
        <p className="text-[12px] text-gray-400 mt-0.5">Theo dõi danh sách xe đang trong bãi và hỗ trợ tìm kiếm, thanh toán nhanh.</p>
      </div>

      {/* Stats Row — 1 hàng ngang compact, ~60px */}
      <div className="grid grid-cols-3 gap-3 shrink-0 h-[60px]">
        <div className="col-span-1">
          <CurrentOccupancy />
        </div>
        <div className="col-span-2">
          <TotalTraffic />
        </div>
      </div>

      {/* Main Table — chiếm toàn bộ phần còn lại */}
      <div className="flex-1 min-h-0">
        <TableSessionsPage />
      </div>
    </div>
  );
}