import { useState, useEffect } from 'react';
import { sessionService } from '../../../services/session.service';
import CurrentOccupancy from './statisticCards/CurrentOccupancy';
import TotalTraffic from './statisticCards/TotalTraffic';
import TableSessionsPage from './tableSessions/TableSessionsPage';

export default function ActiveSessionsPage() {
  const [totalActiveSessions, setTotalActiveSessions] = useState(0);
  const [trafficIn, setTrafficIn] = useState(0);
  const [trafficOut, setTrafficOut] = useState(0);

  useEffect(() => {
    const facilityId = sessionStorage.getItem("staff_facility_id") || undefined;
    sessionService.getTodayTraffic(facilityId).then((res: any) => {
      if (res.success && res.data) {
        setTrafficIn(res.data.trafficIn);
        setTrafficOut(res.data.trafficOut);
      }
    }).catch(console.error);
  }, []);

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden">
      {/* Page Title — compact */}
      <div className="shrink-0 px-1 pt-1">
        <h1 className="text-xl font-bold text-[#060606]">Danh Sách Xe Trong Bãi</h1>
        <p className="text-[12px] text-gray-400 mt-0.5">Theo dõi danh sách xe đang trong bãi và hỗ trợ tìm kiếm.</p>
      </div>

      {/* Stats Row — 1 hàng ngang compact, ~60px */}
      <div className="grid grid-cols-3 gap-3 shrink-0 h-[60px]">
        <div className="col-span-1">
          <CurrentOccupancy count={totalActiveSessions} />
        </div>
        <div className="col-span-2">
          <TotalTraffic trafficIn={trafficIn} trafficOut={trafficOut} />
        </div>
      </div>

      {/* Main Table — chiếm toàn bộ phần còn lại */}
      <div className="flex-1 min-h-0">
        <TableSessionsPage
          onTotalChange={setTotalActiveSessions}
        />
      </div>
    </div>
  );
}