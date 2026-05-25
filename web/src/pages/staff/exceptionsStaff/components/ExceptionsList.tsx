import { Search, ArrowRightCircle } from "lucide-react";

export interface ExceptionData {
  id: string;
  plate: string;
  type: string;
  time: string;
  status: string;
  manager: string | null;
  note: string | null;
}

interface ExceptionsListProps {
  exceptionsList: ExceptionData[];
  onSelectException: (exc: ExceptionData) => void;
  onContinueCheckout: (plate: string) => void;
}

export default function ExceptionsList({ exceptionsList, onSelectException, onContinueCheckout }: ExceptionsListProps) {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-[300px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm biển số hoặc mã báo cáo…" 
            className="w-full h-10 pl-9 pr-4 border border-[#e8e9e8] rounded-[8px] text-sm focus:outline-none focus:border-[#060606]"
          />
        </div>
        <div className="flex gap-2">
          <select className="h-10 px-4 border border-[#e8e9e8] rounded-[8px] text-[13px] font-bold text-[#060606] outline-none focus:border-[#060606] cursor-pointer bg-white">
            <option value="All">Tất cả trạng thái</option>
            <option value="NEW">Mới</option>
            <option value="PROCESSING">Đang xử lý</option>
            <option value="RESOLVED">Đã giải quyết</option>
            <option value="REJECTED">Từ chối</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-[#e8e9e8] rounded-[14px] overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#f5f5f5] text-[#6b6b6b] text-[11px] uppercase font-semibold border-b border-[#e8e9e8]">
            <tr>
              <th className="px-6 py-3">Mã Báo Cáo</th>
              <th className="px-6 py-3">Biển Số</th>
              <th className="px-6 py-3">Loại</th>
              <th className="px-6 py-3">Báo Cáo Lúc</th>
              <th className="px-6 py-3">Trạng Thái</th>
              <th className="px-6 py-3">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8e9e8]">
            {exceptionsList.map(exc => (
              <tr key={exc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-[#6b6b6b]">{exc.id}</td>
                <td className="px-6 py-4 font-mono font-bold text-[15px]">{exc.plate}</td>
                <td className="px-6 py-4">{exc.type}</td>
                <td className="px-6 py-4">{exc.time}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-[20px] text-[10px] font-bold uppercase tracking-wider ${
                    exc.status === 'RESOLVED' ? 'bg-[#e8f7f0] text-[#1d7a4a]' :
                    exc.status === 'NEW' ? 'bg-[#fff3e0] text-[#c77700]' :
                    exc.status === 'PROCESSING' ? 'bg-[#e3ecf8] text-[#1a5fa8]' :
                    'bg-[#fde8e8] text-[#b03030]'
                  }`}>
                    {exc.status === 'RESOLVED' ? 'Đã giải quyết ✓' :
                     exc.status === 'NEW' ? 'Mới' :
                     exc.status === 'PROCESSING' ? 'Đang xử lý' :
                     'Từ chối'}
                  </span>
                </td>
                <td className="px-6 py-4 flex items-center gap-3">
                  <button onClick={() => onSelectException(exc)} className="px-4 py-1.5 bg-white border border-[#d7ee46] text-[#060606] font-medium rounded-lg hover:bg-gray-50 transition-all text-[13px] shadow-sm whitespace-nowrap">Chi tiết</button>
                  {exc.status === 'RESOLVED' && (
                    <button 
                      onClick={() => onContinueCheckout(exc.plate)}
                      className="bg-[#d7ee46] text-[#060606] px-3 py-1.5 flex items-center gap-1.5 rounded-[6px] text-[13px] font-semibold hover:brightness-95 transition-all whitespace-nowrap shadow-sm"
                    >
                      Check-out <ArrowRightCircle className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
