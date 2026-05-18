import { useState } from 'react';
import { Search, Camera, QrCode, Printer, ChevronLeft } from 'lucide-react';

interface CreateParkingSessionProps {
  vehicleType: 'car' | 'bike' | 'truck';
  onBack: () => void;
  onSessionCreated: () => void;
}

interface SessionData {
  id: string;
  licensePlate: string;
  vehicleType: string;
  entryTime: Date;
  gate: string;
  floor: string;
  qrCode: string;
  ticketCode: string;
  staff: string;
}

export function CreateParkingSession({
  vehicleType,
  onBack,
  onSessionCreated,
}: CreateParkingSessionProps) {
  const [licensePlate, setLicensePlate] = useState('');
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [createdSession, setCreatedSession] = useState<SessionData | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const vehicleTypeLabels = {
    car: 'Ô tô',
    bike: 'Xe máy',
    truck: 'Xe tải',
  };

  const floors = [
    { id: 'B2', name: 'Tầng B2', available: 18, recommended: vehicleType === 'car' },
    { id: 'B1', name: 'Tầng B1', available: 12, recommended: vehicleType === 'bike' },
    { id: '1', name: 'Tầng 1', available: 15, recommended: vehicleType === 'truck' },
  ];

  const gates = ['Cổng A', 'Cổng B', 'Cổng C'];

  const handleCreateSession = () => {
    if (!licensePlate || !selectedFloor) return;

    setIsCreating(true);

    // Simulate session creation
    setTimeout(() => {
      const sessionId = `PS-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      const ticketCode = `T-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;
      const qrCode = `QR-${sessionId}`;

      const session: SessionData = {
        id: sessionId,
        licensePlate: licensePlate.toUpperCase(),
        vehicleType: vehicleTypeLabels[vehicleType],
        entryTime: new Date(),
        gate: 'Cổng A', // Would be selected by staff in real app
        floor: selectedFloor,
        qrCode,
        ticketCode,
        staff: 'Nguyễn Văn A',
      };

      setCreatedSession(session);
      setIsCreating(false);
    }, 1500);
  };

  const handleFinish = () => {
    onSessionCreated();
  };

  if (createdSession) {
    return (
      <div className="h-full overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Success Header */}
          <div className="text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#d7ee46' }}
            >
              <QrCode size={40} style={{ color: '#060606' }} />
            </div>
            <h1 className="text-2xl font-semibold" style={{ color: '#060606' }}>
              Lượt Gửi Xe Đã Được Tạo
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#060606', opacity: 0.6 }}>
              Vui lòng cấp thẻ xe/QR cho khách hàng
            </p>
          </div>

          {/* Session Details */}
          <div className="bg-white rounded-2xl p-8 border" style={{ borderColor: '#eff0ef' }}>
            <div className="text-center mb-6">
              <div
                className="inline-block px-6 py-3 rounded-xl font-mono text-2xl font-bold mb-4"
                style={{ backgroundColor: '#eff0ef', color: '#060606' }}
              >
                {createdSession.ticketCode}
              </div>
              <p className="text-sm" style={{ color: '#060606', opacity: 0.6 }}>
                Mã thẻ xe
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm mb-1" style={{ color: '#060606', opacity: 0.6 }}>
                  Mã lượt gửi
                </p>
                <p className="font-semibold" style={{ color: '#060606' }}>
                  {createdSession.id}
                </p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#060606', opacity: 0.6 }}>
                  Biển số xe
                </p>
                <p className="font-semibold text-lg" style={{ color: '#060606' }}>
                  {createdSession.licensePlate}
                </p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#060606', opacity: 0.6 }}>
                  Loại xe
                </p>
                <p className="font-semibold" style={{ color: '#060606' }}>
                  {createdSession.vehicleType}
                </p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#060606', opacity: 0.6 }}>
                  Cổng vào
                </p>
                <p className="font-semibold" style={{ color: '#060606' }}>
                  {createdSession.gate}
                </p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#060606', opacity: 0.6 }}>
                  Tầng đỗ xe
                </p>
                <p className="font-semibold" style={{ color: '#060606' }}>
                  {createdSession.floor}
                </p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#060606', opacity: 0.6 }}>
                  Thời gian vào
                </p>
                <p className="font-semibold" style={{ color: '#060606' }}>
                  {createdSession.entryTime.toLocaleString('vi-VN')}
                </p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#060606', opacity: 0.6 }}>
                  Nhân viên
                </p>
                <p className="font-semibold" style={{ color: '#060606' }}>
                  {createdSession.staff}
                </p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#060606', opacity: 0.6 }}>
                  QR Code
                </p>
                <p className="font-mono text-sm" style={{ color: '#060606' }}>
                  {createdSession.qrCode}
                </p>
              </div>
            </div>

            {/* QR Code Display */}
            <div
              className="p-6 rounded-xl text-center"
              style={{ backgroundColor: '#eff0ef' }}
            >
              <div
                className="w-48 h-48 mx-auto rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: '#ffffff' }}
              >
                <QrCode size={120} style={{ color: '#060606', opacity: 0.3 }} />
              </div>
              <p className="text-sm font-medium" style={{ color: '#060606' }}>
                Quét mã QR này khi ra bãi
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              className="flex-1 py-4 rounded-xl font-medium text-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              style={{ backgroundColor: '#060606', color: '#ffffff' }}
            >
              <Printer size={20} />
              In thẻ xe
            </button>
            <button
              onClick={handleFinish}
              className="flex-1 py-4 rounded-xl font-medium text-lg transition-all hover:scale-[1.02]"
              style={{ backgroundColor: '#d7ee46', color: '#060606' }}
            >
              Hoàn tất
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={24} style={{ color: '#060606' }} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: '#060606' }}>
              Tạo Lượt Gửi Xe
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#060606', opacity: 0.6 }}>
              FR-9.1: Tạo parking session mới cho {vehicleTypeLabels[vehicleType]}
            </p>
          </div>
        </div>

        {/* License Plate Input */}
        <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: '#eff0ef' }}>
          <h3 className="font-medium mb-4" style={{ color: '#060606' }}>
            Bước 2: Nhập biển số xe (FR-8.2)
          </h3>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                placeholder="Nhập biển số xe (VD: 29A-12345)"
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[#d7ee46] transition-colors text-lg font-semibold"
                style={{
                  borderColor: '#eff0ef',
                  color: '#060606',
                }}
              />
              <Search
                className="absolute right-4 top-1/2 -translate-y-1/2"
                size={20}
                style={{ color: '#060606', opacity: 0.4 }}
              />
            </div>
            <button
              className="px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
              style={{ backgroundColor: '#060606', color: '#ffffff' }}
            >
              <Camera size={20} />
              Quét biển số
            </button>
          </div>
          {licensePlate && (
            <p className="mt-3 text-sm" style={{ color: '#060606', opacity: 0.6 }}>
              ✓ Biển số đã được ghi nhận: <strong>{licensePlate}</strong>
            </p>
          )}
        </div>

        {/* Floor Selection */}
        <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: '#eff0ef' }}>
          <h3 className="font-medium mb-4" style={{ color: '#060606' }}>
            Bước 3: Chọn tầng đỗ xe (FR-8.3)
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {floors.map((floor) => {
              const isSelected = selectedFloor === floor.id;
              return (
                <button
                  key={floor.id}
                  onClick={() => setSelectedFloor(floor.id)}
                  className="p-5 rounded-xl border-2 transition-all hover:scale-[1.02] relative"
                  style={{
                    borderColor: isSelected ? '#d7ee46' : '#eff0ef',
                    backgroundColor: isSelected ? '#d7ee46' : '#ffffff',
                  }}
                >
                  {floor.recommended && (
                    <span
                      className="absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: '#4ecdc4', color: '#ffffff' }}
                    >
                      Gợi ý
                    </span>
                  )}
                  <p className="font-semibold text-lg" style={{ color: '#060606' }}>
                    {floor.name}
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#060606', opacity: 0.6 }}>
                    {floor.available} chỗ trống
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Session Summary */}
        {licensePlate && selectedFloor && (
          <div
            className="bg-white rounded-2xl p-6 border"
            style={{ borderColor: '#d7ee46' }}
          >
            <h3 className="font-medium mb-4" style={{ color: '#060606' }}>
              Xác nhận thông tin lượt gửi
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm" style={{ color: '#060606', opacity: 0.6 }}>
                  Loại xe
                </p>
                <p className="font-semibold" style={{ color: '#060606' }}>
                  {vehicleTypeLabels[vehicleType]}
                </p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#060606', opacity: 0.6 }}>
                  Biển số
                </p>
                <p className="font-semibold text-lg" style={{ color: '#060606' }}>
                  {licensePlate}
                </p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#060606', opacity: 0.6 }}>
                  Tầng đỗ
                </p>
                <p className="font-semibold" style={{ color: '#060606' }}>
                  {floors.find((f) => f.id === selectedFloor)?.name}
                </p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#060606', opacity: 0.6 }}>
                  Thời gian vào
                </p>
                <p className="font-semibold" style={{ color: '#060606' }}>
                  {new Date().toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleCreateSession}
            disabled={!licensePlate || !selectedFloor || isCreating}
            className="flex-1 py-4 rounded-xl font-medium text-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#d7ee46', color: '#060606' }}
          >
            {isCreating ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                Đang tạo lượt gửi...
              </div>
            ) : (
              'Xác nhận tạo lượt gửi'
            )}
          </button>
          <button
            onClick={onBack}
            disabled={isCreating}
            className="px-8 py-4 rounded-xl font-medium transition-all hover:scale-[1.02]"
            style={{ backgroundColor: '#eff0ef', color: '#060606' }}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
