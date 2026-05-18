import { useState } from 'react';
import { Search, QrCode, Camera, Clock, DollarSign } from 'lucide-react';

interface ParkingSession {
  id: string;
  licensePlate: string;
  vehicleType: string;
  entryTime: Date;
  floor: string;
  fee: number;
}

export function CheckOutView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState<ParkingSession | null>(null);

  const mockSession: ParkingSession = {
    id: 'PS-20260514-001',
    licensePlate: '29A-12345',
    vehicleType: 'Ô tô',
    entryTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    floor: 'B1',
    fee: 45000,
  };

  const calculateDuration = (entryTime: Date) => {
    const hours = Math.floor((Date.now() - entryTime.getTime()) / (1000 * 60 * 60));
    const minutes = Math.floor(((Date.now() - entryTime.getTime()) % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} giờ ${minutes} phút`;
  };

  const handleSearch = () => {
    if (searchQuery) {
      setSelectedSession(mockSession);
    }
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: '#060606' }}>
            Xe Ra Bãi
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#060606', opacity: 0.6 }}>
            Tìm kiếm và xử lý xe ra bãi
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: '#eff0ef' }}>
          <h3 className="font-medium mb-4" style={{ color: '#060606' }}>
            Tìm lượt gửi xe
          </h3>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                placeholder="Nhập biển số hoặc mã thẻ xe"
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[#d7ee46] transition-colors"
                style={{ borderColor: '#eff0ef', color: '#060606' }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Search
                className="absolute right-4 top-1/2 -translate-y-1/2"
                size={20}
                style={{ color: '#060606', opacity: 0.4 }}
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02]"
              style={{ backgroundColor: '#060606', color: '#ffffff' }}
            >
              Tìm kiếm
            </button>
            <button
              className="px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
              style={{ backgroundColor: '#eff0ef', color: '#060606' }}
            >
              <Camera size={20} />
              Quét
            </button>
            <button
              className="px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
              style={{ backgroundColor: '#eff0ef', color: '#060606' }}
            >
              <QrCode size={20} />
              QR
            </button>
          </div>
        </div>

        {/* Session Details */}
        {selectedSession && (
          <>
            <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: '#eff0ef' }}>
              <h3 className="font-medium mb-4" style={{ color: '#060606' }}>
                Thông tin lượt gửi
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm mb-1" style={{ color: '#060606', opacity: 0.6 }}>
                    Mã lượt gửi
                  </p>
                  <p className="font-semibold" style={{ color: '#060606' }}>
                    {selectedSession.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: '#060606', opacity: 0.6 }}>
                    Biển số xe
                  </p>
                  <p className="font-semibold" style={{ color: '#060606' }}>
                    {selectedSession.licensePlate}
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: '#060606', opacity: 0.6 }}>
                    Loại xe
                  </p>
                  <p className="font-semibold" style={{ color: '#060606' }}>
                    {selectedSession.vehicleType}
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: '#060606', opacity: 0.6 }}>
                    Tầng đỗ
                  </p>
                  <p className="font-semibold" style={{ color: '#060606' }}>
                    {selectedSession.floor}
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: '#060606', opacity: 0.6 }}>
                    Thời gian vào
                  </p>
                  <p className="font-semibold" style={{ color: '#060606' }}>
                    {selectedSession.entryTime.toLocaleString('vi-VN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: '#060606', opacity: 0.6 }}>
                    Thời gian gửi
                  </p>
                  <p className="font-semibold flex items-center gap-2" style={{ color: '#060606' }}>
                    <Clock size={16} />
                    {calculateDuration(selectedSession.entryTime)}
                  </p>
                </div>
              </div>
            </div>

            {/* Fee Calculation */}
            <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: '#eff0ef' }}>
              <h3 className="font-medium mb-4" style={{ color: '#060606' }}>
                Tính phí
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span style={{ color: '#060606', opacity: 0.6 }}>Phí gửi xe</span>
                  <span className="font-semibold" style={{ color: '#060606' }}>
                    {selectedSession.fee.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: '#060606', opacity: 0.6 }}>Phụ phí</span>
                  <span className="font-semibold" style={{ color: '#060606' }}>
                    0 đ
                  </span>
                </div>
                <div className="h-px" style={{ backgroundColor: '#eff0ef' }}></div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg" style={{ color: '#060606' }}>
                    Tổng cộng
                  </span>
                  <span className="font-bold text-2xl flex items-center gap-2" style={{ color: '#060606' }}>
                    <DollarSign size={24} />
                    {selectedSession.fee.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: '#eff0ef' }}>
              <h3 className="font-medium mb-4" style={{ color: '#060606' }}>
                Phương thức thanh toán
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {['Tiền mặt', 'Chuyển khoản', 'Ví điện tử'].map((method) => (
                  <button
                    key={method}
                    className="p-4 rounded-xl border-2 transition-all hover:scale-[1.02] hover:border-[#d7ee46]"
                    style={{ borderColor: '#eff0ef', backgroundColor: '#ffffff' }}
                  >
                    <p className="font-medium" style={{ color: '#060606' }}>
                      {method}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                className="flex-1 py-4 rounded-xl font-medium text-lg transition-all hover:scale-[1.02]"
                style={{ backgroundColor: '#d7ee46', color: '#060606' }}
              >
                Xác nhận thanh toán
              </button>
              <button
                onClick={() => setSelectedSession(null)}
                className="px-8 py-4 rounded-xl font-medium transition-all hover:scale-[1.02]"
                style={{ backgroundColor: '#eff0ef', color: '#060606' }}
              >
                Hủy
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
