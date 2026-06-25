import { useState, useEffect } from 'react';
import { apiClient } from '../../../../../services/api';
import { vehicleTypeService, VehicleType } from '../../../../../services/vehicleType.service';
import { userService } from '../../../../../services/user.service';
import { useAuthStore } from '../../../../../store/useAuthStore';
import { AssignedFacility } from '../../../../../types/user.types';

export function useCheckinFlow() {
  const { user, setAssignedFacilities } = useAuthStore();

  // ── Form fields ────────────────────────────────────────────────
  const [gate, setGate] = useState('GATE-A');
  const [vehicleTypeId, setVehicleTypeId] = useState('');
  const [plate, setPlate] = useState('');
  const [checkInImage, setCheckInImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ── Catalog data ───────────────────────────────────────────────
  const [assignedFacilities, setLocalFacilities] = useState<AssignedFacility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<AssignedFacility | null>(null);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);

  // ── Flow state machine ─────────────────────────────────────────
  // "facility"  → Step chọn bãi (chỉ khi staff có > 1 facility)
  // "input"     → Nhập biển số + loại xe + cổng
  // "suggest"   → Chọn tầng gợi ý
  // "success"   → Check-in thành công
  const [step, setStep] = useState<'facility' | 'input' | 'suggest' | 'success'>('input');
  const [suggestedFloors, setSuggestedFloors] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  // ── Khởi tạo dữ liệu khi component mount ──────────────────────
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      setError('');

      try {
        // 1. Lấy assignedFacilities từ store (đã được set khi login)
        let facilities = (user?.assignedFacilities ?? []) as AssignedFacility[];

        // Fallback: Nếu store rỗng (reload trang), gọi /users/me để lấy lại
        if (facilities.length === 0) {
          const profileRes = await userService.getMe();
          facilities = (profileRes.data.assignedFacilities ?? []) as AssignedFacility[];
          // Cập nhật lại store để các lần sau không phải gọi lại
          setAssignedFacilities(facilities);
        }

        setLocalFacilities(facilities);

        // Xác định facility hiển thị ban đầu
        if (facilities.length === 1) {
          // Chỉ 1 bãi → auto-select, đi thẳng vào input
          setSelectedFacility(facilities[0]);
          setStep('input');
        } else if (facilities.length > 1) {
          // Nhiều bãi → hiển thị bước chọn bãi
          setSelectedFacility(null);
          setStep('facility');
        } else {
          // Chưa được phân công bãi nào
          setError('Tài khoản chưa được phân công bãi xe. Liên hệ quản lý để được hỗ trợ.');
          setStep('input');
        }

        // 2. Lấy danh sách loại xe
        const vtRes = await vehicleTypeService.getAll();
        if (vtRes.data && vtRes.data.length > 0) {
          setVehicleTypes(vtRes.data);
          setVehicleTypeId(vtRes.data[0]._id);
        }
      } catch (err: any) {
        setError(err.message || 'Không thể tải dữ liệu. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Chọn bãi xe (khi có nhiều bãi) ───────────────────────────
  const handleSelectFacility = (facility: AssignedFacility) => {
    setSelectedFacility(facility);
    setStep('input');
    setError('');
  };

  // ── Bước 1: Kiểm tra điều kiện + gợi ý tầng ─────────────────
  const handleCheckAvailability = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const selectedType = vehicleTypes.find((v) => v._id === vehicleTypeId);
    const isNoPlate = selectedType?.requiresPlate === false;
    if ((!isNoPlate && !plate.trim()) || !selectedFacility || !vehicleTypeId) return;

    setLoading(true);
    setError('');

    try {
      // 1a. Check conditions
      const condRes: any = await apiClient.post('/sessions/check-conditions', {
        facilityId: selectedFacility._id,
        vehicleTypeId,
      });

      if (condRes.data?.eligible === false) {
        setError(condRes.data.reason || 'Bãi đỗ xe không còn chỗ trống cho loại xe này.');
        return;
      }

      // 1b. Suggest floors
      const suggestRes: any = await apiClient.get('/sessions/suggest-floor', {
        params: { facilityId: selectedFacility._id, vehicleTypeId },
      });

      const floors = suggestRes.data ?? [];
      if (floors.length === 0) {
        setError('Không tìm thấy tầng phù hợp. Vui lòng thử lại.');
        return;
      }

      setSuggestedFloors(floors);
      setStep('suggest');
    } catch (err: any) {
      setError(err.message || 'Lỗi kiểm tra điều kiện vào bãi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // ── Bước 2: Thực hiện Check-in với tầng đã chọn ──────────────
  const handleFinalCheckIn = async (floorId: string) => {
    if (!selectedFacility) return;

    setLoading(true);
    setError('');

    try {
      const selectedType = vehicleTypes.find((v) => v._id === vehicleTypeId);
      const isNoPlate = selectedType?.requiresPlate === false;
      const actualPlate = isNoPlate ? `NOPLATE-AUTO` : plate;

      const checkinRes: any = await apiClient.post('/sessions/check-in', {
        facilityId: selectedFacility._id,
        vehicleTypeId,
        licensePlate: actualPlate,
        gateIn: gate,
        floorId,
        checkInImage,
      });

      setResult(checkinRes.data);
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Lỗi tạo phiên gửi xe. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // ── Reset về trạng thái ban đầu ───────────────────────────────
  const resetFlow = () => {
    setPlate('');
    setCheckInImage(null);
    setResult(null);
    setSuggestedFloors([]);
    setError('');
    setLoading(false);
    // Quay về bước input (giữ facility đã chọn)
    setStep(selectedFacility ? 'input' : 'facility');
  };

  // ── Đổi bãi (nếu Staff có nhiều bãi) ─────────────────────────
  const handleChangeFacility = () => {
    if (assignedFacilities.length > 1) {
      setSelectedFacility(null);
      setStep('facility');
      setPlate('');
      setCheckInImage(null);
      setError('');
      setSuggestedFloors([]);
      setResult(null);
    }
  };

  return {
    // Form fields
    gate,
    setGate,
    vehicleTypeId,
    setVehicleTypeId,
    plate,
    setPlate,
    checkInImage,
    setCheckInImage,
    loading,
    // Facility data
    assignedFacilities,
    selectedFacility,
    vehicleTypes,
    // Flow
    step,
    suggestedFloors,
    result,
    error,
    // Actions
    handleSelectFacility,
    handleCheckAvailability,
    handleFinalCheckIn,
    resetFlow,
    handleChangeFacility,
  };
}
