import { Search, Filter, Download } from 'lucide-react';

interface Session {
  id: string;
  licensePlate: string;
  vehicleType: string;
  entryTime: Date;
  floor: string;
  estimatedFee: number;
}

export function ActiveSessionsView() {
  const mockSessions: Session[] = [
    {
      id: 'PS-20260514-001',
      licensePlate: '29A-12345',
      vehicleType: 'Ô tô',
      entryTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
      floor: 'B1',
      estimatedFee: 45000,
    },
    {
      id: 'PS-20260514-002',
      licensePlate: '30B-67890',
      vehicleType: 'Xe máy',
      entryTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      floor: 'B2',
      estimatedFee: 15000,
    },
    {
      id: 'PS-20260514-003',
      licensePlate: '29C-11111',
      vehicleType: 'Ô tô',
      entryTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
      floor: '1',
      estimatedFee: 75000,
    },
    {
      id: 'PS-20260514-004',
      licensePlate: '51F-22222',
      vehicleType: 'Xe máy',
      entryTime: new Date(Date.now() - 0.5 * 60 * 60 * 1000),
      floor: 'B1',
      estimatedFee: 5000,
    },
  ];

  const calculateDuration = (entryTime: Date) => {
    const hours = Math.floor((Date.now() - entryTime.getTime()) / (1000 * 60 * 60));
    const minutes = Math.floor(
      ((Date.now() - entryTime.getTime()) % (1000 * 60 * 60)) / (1000 * 60)
    );
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: '#060606' }}>
              Lượt Gửi Đang Hoạt Động
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#060606', opacity: 0.6 }}>
              {mockSessions.length} xe đang gửi trong bãi
            </p>
          </div>
          <button
            className="px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
            style={{ backgroundColor: '#060606', color: '#ffffff' }}
          >
            <Download size={20} />
            Xuất báo cáo
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: '#eff0ef' }}>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Tìm kiếm theo biển số hoặc mã lượt gửi..."
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[#d7ee46] transition-colors"
                style={{ borderColor: '#eff0ef', color: '#060606' }}
              />
              <Search
                className="absolute right-4 top-1/2 -translate-y-1/2"
                size={20}
                style={{ color: '#060606', opacity: 0.4 }}
              />
            </div>
            <button
              className="px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
              style={{ backgroundColor: '#eff0ef', color: '#060606' }}
            >
              <Filter size={20} />
              Bộ lọc
            </button>
          </div>
        </div>

        {/* Sessions Table */}
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#eff0ef' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#eff0ef' }}>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#060606' }}>
                    Mã lượt gửi
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#060606' }}>
                    Biển số
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#060606' }}>
                    Loại xe
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#060606' }}>
                    Thời gian vào
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#060606' }}>
                    Thời gian gửi
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#060606' }}>
                    Tầng
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold" style={{ color: '#060606' }}>
                    Phí tạm tính
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockSessions.map((session, index) => (
                  <tr
                    key={session.id}
                    className="border-t hover:bg-gray-50 transition-colors cursor-pointer"
                    style={{ borderColor: '#eff0ef' }}
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium" style={{ color: '#060606' }}>
                        {session.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold" style={{ color: '#060606' }}>
                        {session.licensePlate}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: session.vehicleType === 'Ô tô' ? '#d7ee46' : '#eff0ef',
                          color: '#060606',
                        }}
                      >
                        {session.vehicleType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: '#060606' }}>
                        {session.entryTime.toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium" style={{ color: '#060606' }}>
                        {calculateDuration(session.entryTime)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-1 rounded-lg text-sm font-semibold"
                        style={{ backgroundColor: '#eff0ef', color: '#060606' }}
                      >
                        {session.floor}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold" style={{ color: '#060606' }}>
                        {session.estimatedFee.toLocaleString('vi-VN')} đ
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: '#eff0ef' }}>
            <p className="text-sm mb-2" style={{ color: '#060606', opacity: 0.6 }}>
              Tổng xe đang gửi
            </p>
            <p className="text-3xl font-bold" style={{ color: '#060606' }}>
              {mockSessions.length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: '#eff0ef' }}>
            <p className="text-sm mb-2" style={{ color: '#060606', opacity: 0.6 }}>
              Doanh thu tạm tính
            </p>
            <p className="text-3xl font-bold" style={{ color: '#060606' }}>
              {mockSessions
                .reduce((sum, s) => sum + s.estimatedFee, 0)
                .toLocaleString('vi-VN')}{' '}
              đ
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: '#eff0ef' }}>
            <p className="text-sm mb-2" style={{ color: '#060606', opacity: 0.6 }}>
              Thời gian gửi trung bình
            </p>
            <p className="text-3xl font-bold" style={{ color: '#060606' }}>
              2.6h
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
