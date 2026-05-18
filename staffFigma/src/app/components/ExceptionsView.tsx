import { AlertTriangle, Clock, FileWarning, MapPin } from 'lucide-react';

interface Exception {
  id: string;
  type: 'lost-ticket' | 'wrong-info' | 'overtime' | 'wrong-zone';
  licensePlate: string;
  description: string;
  status: 'pending' | 'resolved';
  createdAt: Date;
}

export function ExceptionsView() {
  const mockExceptions: Exception[] = [
    {
      id: 'EX-001',
      type: 'lost-ticket',
      licensePlate: '29A-12345',
      description: 'Khách hàng báo mất thẻ xe, cần xác minh thông tin',
      status: 'pending',
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      id: 'EX-002',
      type: 'wrong-info',
      licensePlate: '30B-67890',
      description: 'Biển số xe thực tế không khớp với thông tin trong hệ thống',
      status: 'pending',
      createdAt: new Date(Date.now() - 45 * 60 * 1000),
    },
    {
      id: 'EX-003',
      type: 'overtime',
      licensePlate: '51F-22222',
      description: 'Xe gửi quá 24 giờ, cần áp dụng phụ phí',
      status: 'pending',
      createdAt: new Date(Date.now() - 60 * 60 * 1000),
    },
  ];

  const exceptionTypes = {
    'lost-ticket': { label: 'Mất thẻ xe', color: '#d7ee46', icon: FileWarning },
    'wrong-info': { label: 'Sai thông tin', color: '#ff6b6b', icon: AlertTriangle },
    overtime: { label: 'Quá hạn gửi', color: '#ffa500', icon: Clock },
    'wrong-zone': { label: 'Sai khu vực', color: '#4ecdc4', icon: MapPin },
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: '#060606' }}>
            Xử Lý Ngoại Lệ
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#060606', opacity: 0.6 }}>
            {mockExceptions.filter((e) => e.status === 'pending').length} trường hợp đang chờ xử
            lý
          </p>
        </div>

        {/* Exception Types Summary */}
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(exceptionTypes).map(([key, type]) => {
            const Icon = type.icon;
            const count = mockExceptions.filter((e) => e.type === key).length;
            return (
              <div
                key={key}
                className="bg-white rounded-xl p-4 border"
                style={{ borderColor: '#eff0ef' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: type.color + '20' }}
                  >
                    <Icon size={20} style={{ color: type.color }} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: '#060606' }}>
                      {count}
                    </p>
                    <p className="text-xs" style={{ color: '#060606', opacity: 0.6 }}>
                      {type.label}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Exceptions List */}
        <div className="space-y-4">
          {mockExceptions.map((exception) => {
            const type = exceptionTypes[exception.type];
            const Icon = type.icon;
            return (
              <div
                key={exception.id}
                className="bg-white rounded-2xl p-6 border hover:shadow-lg transition-all cursor-pointer"
                style={{ borderColor: '#eff0ef' }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: type.color + '20' }}
                  >
                    <Icon size={24} style={{ color: type.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg" style={{ color: '#060606' }}>
                          {type.label}
                        </h3>
                        <p className="text-sm" style={{ color: '#060606', opacity: 0.6 }}>
                          Mã: {exception.id} • Biển số: {exception.licensePlate}
                        </p>
                      </div>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor:
                            exception.status === 'pending' ? '#ffa500' : '#4ecdc4',
                          color: '#060606',
                        }}
                      >
                        {exception.status === 'pending' ? 'Đang chờ' : 'Đã xử lý'}
                      </span>
                    </div>
                    <p className="mb-3" style={{ color: '#060606' }}>
                      {exception.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm" style={{ color: '#060606', opacity: 0.6 }}>
                      <Clock size={14} />
                      {exception.createdAt.toLocaleString('vi-VN')}
                    </div>
                  </div>
                  <button
                    className="px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02]"
                    style={{ backgroundColor: '#d7ee46', color: '#060606' }}
                  >
                    Xử lý
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: '#eff0ef' }}>
          <h3 className="font-medium mb-4" style={{ color: '#060606' }}>
            Hành động nhanh
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              className="p-4 rounded-xl border-2 transition-all hover:scale-[1.02] hover:border-[#d7ee46] text-left"
              style={{ borderColor: '#eff0ef', backgroundColor: '#ffffff' }}
            >
              <p className="font-medium mb-1" style={{ color: '#060606' }}>
                Tạo báo cáo ngoại lệ mới
              </p>
              <p className="text-sm" style={{ color: '#060606', opacity: 0.6 }}>
                Ghi nhận tình huống bất thường
              </p>
            </button>
            <button
              className="p-4 rounded-xl border-2 transition-all hover:scale-[1.02] hover:border-[#d7ee46] text-left"
              style={{ borderColor: '#eff0ef', backgroundColor: '#ffffff' }}
            >
              <p className="font-medium mb-1" style={{ color: '#060606' }}>
                Xem lịch sử ngoại lệ
              </p>
              <p className="text-sm" style={{ color: '#060606', opacity: 0.6 }}>
                Tra cứu các trường hợp đã xử lý
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
