import { useState } from 'react';
import { Car, Bike, Truck, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface CheckResult {
  passed: boolean;
  checks: {
    vehicleTypeSupported: boolean;
    slotsAvailable: boolean;
    withinOperatingHours: boolean;
    notBlacklisted: boolean;
  };
  message: string;
}

interface VehicleConditionCheckProps {
  onConditionPassed: (vehicleType: 'car' | 'bike' | 'truck') => void;
}

export function VehicleConditionCheck({ onConditionPassed }: VehicleConditionCheckProps) {
  const [selectedVehicleType, setSelectedVehicleType] = useState<'car' | 'bike' | 'truck' | null>(
    null
  );
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const vehicleTypes = [
    { id: 'car' as const, label: 'Ô tô', icon: Car, slotsAvailable: 45, totalSlots: 100 },
    { id: 'bike' as const, label: 'Xe máy', icon: Bike, slotsAvailable: 120, totalSlots: 200 },
    { id: 'truck' as const, label: 'Xe tải', icon: Truck, slotsAvailable: 0, totalSlots: 10 },
  ];

  const currentHour = new Date().getHours();
  const isOperatingHours = currentHour >= 6 && currentHour < 22;

  const handleCheckCondition = () => {
    if (!selectedVehicleType) return;

    setIsChecking(true);

    // Simulate checking process
    setTimeout(() => {
      const vehicleInfo = vehicleTypes.find((v) => v.id === selectedVehicleType);

      const checks = {
        vehicleTypeSupported: true, // All types are supported
        slotsAvailable: vehicleInfo ? vehicleInfo.slotsAvailable > 0 : false,
        withinOperatingHours: isOperatingHours,
        notBlacklisted: true, // Simulated - would check against blacklist in real app
      };

      const allPassed = Object.values(checks).every((check) => check);

      let message = '';
      if (!checks.slotsAvailable) {
        message = `Bãi đầy cho loại xe ${vehicleInfo?.label}`;
      } else if (!checks.withinOperatingHours) {
        message = 'Bãi xe đang đóng (Giờ hoạt động: 6:00 - 22:00)';
      } else if (!checks.notBlacklisted) {
        message = 'Xe nằm trong danh sách cấm';
      } else {
        message = 'Xe đủ điều kiện vào bãi';
      }

      setCheckResult({
        passed: allPassed,
        checks,
        message,
      });
      setIsChecking(false);
    }, 1000);
  };

  const handleProceed = () => {
    if (selectedVehicleType && checkResult?.passed) {
      onConditionPassed(selectedVehicleType);
    }
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: '#060606' }}>
            Kiểm Tra Điều Kiện Xe Vào Bãi
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#060606', opacity: 0.6 }}>
            FR-8.1: Kiểm tra xe có đủ điều kiện vào bãi hay không
          </p>
        </div>

        {/* Operating Hours Status */}
        <div
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{
            backgroundColor: isOperatingHours ? '#d7ee46' : '#ff6b6b',
            color: '#060606',
          }}
        >
          <Clock size={24} />
          <div>
            <p className="font-semibold">
              {isOperatingHours ? 'Bãi xe đang hoạt động' : 'Bãi xe đang đóng'}
            </p>
            <p className="text-sm opacity-80">
              Giờ hoạt động: 6:00 - 22:00 • Hiện tại: {new Date().toLocaleTimeString('vi-VN')}
            </p>
          </div>
        </div>

        {/* Vehicle Type Selection */}
        <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: '#eff0ef' }}>
          <h3 className="font-medium mb-4" style={{ color: '#060606' }}>
            Bước 1: Chọn loại xe
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {vehicleTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedVehicleType === type.id;
              const hasSlots = type.slotsAvailable > 0;

              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedVehicleType(type.id)}
                  disabled={!hasSlots}
                  className="p-6 rounded-xl border-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
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
                    {type.slotsAvailable}/{type.totalSlots} chỗ trống
                  </p>
                  {!hasSlots && (
                    <p
                      className="text-xs mt-1 font-semibold"
                      style={{ color: '#ff6b6b' }}
                    >
                      Bãi đầy
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Check Button */}
        {selectedVehicleType && !checkResult && (
          <button
            onClick={handleCheckCondition}
            disabled={isChecking}
            className="w-full py-4 rounded-xl font-medium text-lg transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: '#060606', color: '#ffffff' }}
          >
            {isChecking ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Đang kiểm tra...
              </>
            ) : (
              'Kiểm tra điều kiện'
            )}
          </button>
        )}

        {/* Check Results */}
        {checkResult && (
          <>
            <div
              className="rounded-2xl p-6 border-2"
              style={{
                borderColor: checkResult.passed ? '#4ecdc4' : '#ff6b6b',
                backgroundColor: '#ffffff',
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                {checkResult.passed ? (
                  <CheckCircle size={32} style={{ color: '#4ecdc4' }} />
                ) : (
                  <XCircle size={32} style={{ color: '#ff6b6b' }} />
                )}
                <div>
                  <h3
                    className="font-semibold text-lg"
                    style={{ color: checkResult.passed ? '#4ecdc4' : '#ff6b6b' }}
                  >
                    {checkResult.passed ? 'ĐỦ ĐIỀU KIỆN' : 'KHÔNG ĐỦ ĐIỀU KIỆN'}
                  </h3>
                  <p className="text-sm" style={{ color: '#060606', opacity: 0.6 }}>
                    {checkResult.message}
                  </p>
                </div>
              </div>

              {/* Detailed Checks */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm mb-3" style={{ color: '#060606' }}>
                  Chi tiết kiểm tra:
                </h4>
                {[
                  {
                    label: 'Loại xe được bãi phục vụ',
                    passed: checkResult.checks.vehicleTypeSupported,
                  },
                  {
                    label: 'Còn chỗ trống cho loại xe này',
                    passed: checkResult.checks.slotsAvailable,
                  },
                  {
                    label: 'Trong giờ hoạt động',
                    passed: checkResult.checks.withinOperatingHours,
                  },
                  {
                    label: 'Không trong danh sách cấm',
                    passed: checkResult.checks.notBlacklisted,
                  },
                ].map((check, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {check.passed ? (
                      <CheckCircle size={16} style={{ color: '#4ecdc4' }} />
                    ) : (
                      <XCircle size={16} style={{ color: '#ff6b6b' }} />
                    )}
                    <span className="text-sm" style={{ color: '#060606' }}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {checkResult.passed ? (
                <button
                  onClick={handleProceed}
                  className="flex-1 py-4 rounded-xl font-medium text-lg transition-all hover:scale-[1.02]"
                  style={{ backgroundColor: '#d7ee46', color: '#060606' }}
                >
                  Tiếp tục tạo lượt gửi xe
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 py-4 rounded-xl font-medium text-lg opacity-50 cursor-not-allowed"
                  style={{ backgroundColor: '#eff0ef', color: '#060606' }}
                >
                  Không thể tiếp tục
                </button>
              )}
              <button
                onClick={() => {
                  setCheckResult(null);
                  setSelectedVehicleType(null);
                }}
                className="px-8 py-4 rounded-xl font-medium transition-all hover:scale-[1.02]"
                style={{ backgroundColor: '#eff0ef', color: '#060606' }}
              >
                Kiểm tra lại
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
