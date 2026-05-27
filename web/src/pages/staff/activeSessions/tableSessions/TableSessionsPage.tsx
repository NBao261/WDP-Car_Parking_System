import { useState, useEffect } from 'react';
import { Search, Filter, X, AlertCircle } from 'lucide-react';
import { sessionService } from '../../../../services/session.service';

interface Session {
  _id: string;
  code: string;
  licensePlate: string;
  status: string;
  checkInTime: string;
  totalFee: number;
  vehicleTypeId: { _id: string, name: string, code: string, icon?: string };
  gateIn: string;
}

export default function TableSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterVehicleType, setFilterVehicleType] = useState('All');
  const [filterGate, setFilterGate] = useState('All');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState<Session | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => { fetchSessions(); }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const facilityId = sessionStorage.getItem("staff_facility_id") || undefined;
      // Giới hạn 100 record thay vì 1000 — tránh timeout 10s của axios
      // Thực tế một bãi đỗ không bao giờ có >100 xe vào cùng lúc cần hiển thị
      const res = await sessionService.getActiveSessions({ limit: 100, facilityId });
      if (res.success && res.data) {
        setSessions(res.data as any);
      } else {
        setSessions([]);
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\s+/g, '').toUpperCase();
    setSearch(val);
    setCurrentPage(1);
    setToastMessage('');
  };

  const filteredSessions = sessions
    .filter(s => search === '' || s.licensePlate.toUpperCase().includes(search) || s.code.toUpperCase().includes(search))
    .filter(s => filterVehicleType === 'All' || s.vehicleTypeId?.code === filterVehicleType)
    .filter(s => filterGate === 'All' || s.gateIn === filterGate)
    .sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());

  useEffect(() => {
    if (search && filteredSessions.length === 0) {
      setToastMessage('Không tìm thấy xe');
    } else {
      setToastMessage('');
    }
  }, [search, filteredSessions.length]);

  const uniqueVehicleTypes = Array.from(new Map(sessions.map(s => [s.vehicleTypeId?.code, s.vehicleTypeId])).values()).filter(Boolean);
  const uniqueGates = Array.from(new Set(sessions.map(s => s.gateIn).filter(Boolean)));

  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage) || 1;
  const currentData = filteredSessions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden relative">
      <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap bg-white">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" placeholder="Tìm kiếm biển số hoặc mã vé..." value={search} onChange={handleSearchChange}
            maxLength={12}
            className="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#060606] focus:ring-1 focus:ring-[#060606]"
          />
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={filterVehicleType} onChange={e => {setFilterVehicleType(e.target.value); setCurrentPage(1);}}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-[#060606] bg-white focus:outline-none"
          >
            <option value="All">Tất cả loại xe</option>
            {uniqueVehicleTypes.map(vt => (
              <option key={vt.code} value={vt.code}>{vt.name}</option>
            ))}
          </select>
          <select 
            value={filterGate} onChange={e => {setFilterGate(e.target.value); setCurrentPage(1);}}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-[#060606] bg-white focus:outline-none"
          >
            <option value="All">Tất cả cổng</option>
            {uniqueGates.map(gate => (
              <option key={gate} value={gate}>{gate}</option>
            ))}
          </select>
          <button className="p-1.5 border border-gray-200 rounded-lg text-[#060606] hover:bg-gray-50"><Filter className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="text-[11px] text-[#060606]/50 border-b border-gray-100 font-semibold uppercase tracking-wider">
              <th className="px-4 py-2.5 font-semibold">#</th>
              <th className="px-4 py-2.5 font-semibold">Mã vé</th>
              <th className="px-4 py-2.5 font-semibold">Biển số</th>
              <th className="px-4 py-2.5 font-semibold">Loại xe</th>
              <th className="px-4 py-2.5 font-semibold">Cổng vào</th>
              <th className="px-4 py-2.5 font-semibold">Giờ vào</th>
              <th className="px-4 py-2.5 font-semibold">Trạng thái</th>
              <th className="px-4 py-2.5 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {currentData.map((session, index) => {
              const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
              return (
                <tr key={session._id} className="hover:bg-[#f9fafb] transition-colors border-b border-gray-50 last:border-0">
                  <td className="px-4 py-2.5 text-[#060606]/50 text-sm">{globalIndex}</td>
                  <td className="px-4 py-2.5 text-[#060606] font-medium text-sm">{session.code}</td>
                  <td className="px-4 py-2.5 font-mono text-[15px] text-[#060606] font-bold">{session.licensePlate}</td>
                  <td className="px-4 py-2.5 text-[#060606] text-sm">{session.vehicleTypeId?.name || 'N/A'}</td>
                  <td className="px-4 py-2.5 text-[#060606] text-sm max-w-[200px] truncate">{session.gateIn || 'N/A'}</td>
                  <td className="px-4 py-2.5 text-[#060606]/70 text-sm tabular-nums">{new Date(session.checkInTime).toLocaleString('vi-VN')}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold bg-green-50 text-green-700 border border-green-100">
                      {session.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button 
                      onClick={() => setSelectedSession(session)}
                      className="px-3 py-1 bg-white border border-gray-200 text-[#060606] font-medium rounded-lg hover:bg-gray-50 transition-all text-xs shadow-sm"
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              );
            })}
            {currentData.length === 0 && !loading && (
              <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-sm">Không có phiên đỗ xe nào đang hoạt động</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
        <div className="text-sm text-gray-500">
          Hiển thị {(currentPage - 1) * itemsPerPage + (filteredSessions.length > 0 ? 1 : 0)} đến {Math.min(currentPage * itemsPerPage, filteredSessions.length)} trên tổng số {filteredSessions.length} mục
        </div>
        <div className="flex items-center gap-1">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Trước
          </button>
          <div className="flex gap-1 px-2">
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium ${currentPage === i + 1 ? 'bg-[#d7ee46] text-[#060606]' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-red-50 text-red-600 px-6 py-3 rounded-lg shadow-lg border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Chi tiết của {selectedSession.code}</p>
                <h3 className="font-bold text-xl text-[#060606] font-mono">{selectedSession.licensePlate}</h3>
              </div>
              <button onClick={() => setSelectedSession(null)} className="p-1.5 hover:bg-gray-200 rounded-lg mt-0.5"><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            <div className="p-6 space-y-4">
              {/* License Plate Hero */}
              <div className="w-full bg-[#060606] rounded-2xl flex items-center justify-center py-6">
                <span className="font-mono font-bold text-4xl tracking-widest text-[#d7ee46]">{selectedSession.licensePlate}</span>
              </div>

              {/* Detail Fields */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-gray-400 text-xs mb-1">Mã vé</p>
                  <p className="font-semibold text-[#060606]">{selectedSession.code}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-gray-400 text-xs mb-1">Loại xe</p>
                  <p className="font-semibold text-[#060606]">{selectedSession.vehicleTypeId?.name || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-gray-400 text-xs mb-1">Cổng vào</p>
                  <p className="font-semibold text-[#060606]">{selectedSession.gateIn || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-gray-400 text-xs mb-1">Trạng thái</p>
                  <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-700">{selectedSession.status}</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-gray-400 text-xs mb-1">Giờ vào</p>
                  <p className="font-semibold text-[#060606]">{new Date(selectedSession.checkInTime).toLocaleString('vi-VN')}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-gray-400 text-xs mb-1">Giờ ra</p>
                  <p className="font-semibold text-[#060606]/40">Chưa ra</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCheckoutModal && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100 bg-[#060606] text-white">
              <h3 className="font-semibold text-lg flex items-center gap-2">Xác nhận Checkout</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-sm mb-5">Thanh toán và mở barie cho xe <strong className="font-mono text-lg text-[#060606] ml-1">{showCheckoutModal.licensePlate}</strong></p>
              <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                 <span className="text-sm font-medium text-gray-500">Số tiền thu:</span>
                 <span className="text-2xl font-bold text-[#060606]">{showCheckoutModal.totalFee?.toLocaleString('vi-VN') || 0} ₫</span>
              </div>
              <div className="flex gap-3">
                 <button onClick={() => setShowCheckoutModal(null)} className="flex-1 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 text-[#060606]">Hủy bỏ</button>
                 <button onClick={() => { alert('Đã thu tiền & Mở barie thành công!'); setShowCheckoutModal(null); fetchSessions(); }} className="flex-1 py-3 bg-[#d7ee46] rounded-xl font-semibold hover:brightness-95 text-[#060606]">Thu tiền & Mở Cổng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
