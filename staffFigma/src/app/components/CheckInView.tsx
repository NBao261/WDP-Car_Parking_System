import { useState } from 'react';
import { Search, Car, Bike, Truck, QrCode, Camera } from 'lucide-react';

export function CheckInView() {
  const [vehicleType, setVehicleType] = useState<'car' | 'bike' | 'truck'>('car');
  const [licensePlate, setLicensePlate] = useState('');

  const vehicleTypes = [
    { id: 'car' as const, label: 'Ô tô', icon: Car, available: 45 },
    { id: 'bike' as const, label: 'Xe máy', icon: Bike, available: 120 },
    { id: 'truck' as const, label: 'Xe tải', icon: Truck, available: 8 },
  ];

  const floors = [
    { id: 'B1', name: 'Tầng B1', available: 12 },
    { id: 'B2', name: 'Tầng B2', available: 18 },
    { id: '1', name: 'Tầng 1', available: 15 },
  ];

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: '#060606' }}>
            Xe Vào Bãi
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#060606', opacity: 0.6 }}>
            Kiểm tra điều kiện và tạo lượt gửi xe mới
          </p>
        </div>

        {/* Vehicle Type Selection */}
        <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: '#eff0ef' }}>
          <h3 className="font-medium mb-4" style={{ color: '#060606' }}>
            Chọn loại xe
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {vehicleTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = vehicleType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setVehicleType(type.id)}
                  className="p-6 rounded-xl border-2 transition-all hover:scale-[1.02]"
                  style={{
                    borderColor: isSelected ? '#d7ee46' : '#eff0ef',
                    backgroundColor: isSelected ? '#d7ee46' : '#ffffff',
                  }}
                >
                  <Icon
                    size={32}
                    className="mx-auto mb-3"
                    style={{ color: '#060606', opacity: isSelected ? 1 : 0.6 }}
                  />
                  <p className="font-medium text-sm" style={{ color: '#060606' }}>
                    {type.label}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#060606', opacity: 0.6 }}>
                    {type.available} chỗ trống
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* License Plate Input */}
        <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: '#eff0ef' }}>
          <h3 className="font-medium mb-4" style={{ color: '#060606' }}>
            Biển số xe
          </h3>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                placeholder="Nhập biển số xe (VD: 29A-12345)"
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[#d7ee46] transition-colors"
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
            <button
              className="px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
              style={{ backgroundColor: '#eff0ef', color: '#060606' }}
            >
              <QrCode size={20} />
              Quét QR
            </button>
          </div>
        </div>

        {/* Floor Selection */}
        <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: '#eff0ef' }}>
          <h3 className="font-medium mb-4" style={{ color: '#060606' }}>
            Chọn tầng đỗ xe
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {floors.map((floor) => (
              <button
                key={floor.id}
                className="p-4 rounded-xl border-2 transition-all hover:scale-[1.02] hover:border-[#d7ee46]"
                style={{ borderColor: '#eff0ef', backgroundColor: '#ffffff' }}
              >
                <p className="font-semibold text-lg" style={{ color: '#060606' }}>
                  {floor.name}
                </p>
                <p className="text-sm mt-1" style={{ color: '#060606', opacity: 0.6 }}>
                  {floor.available} chỗ trống
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            className="flex-1 py-4 rounded-xl font-medium text-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#d7ee46', color: '#060606' }}
            disabled={!licensePlate}
          >
            Tạo lượt gửi xe
          </button>
          <button
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
