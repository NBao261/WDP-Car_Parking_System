import { useState, useEffect, useMemo } from 'react';
import { publicService } from '../../../../services/public.service';
import { reservationService } from '../../../../services/reservation.service';
import { PricingPlan } from '../../../../services/pricing.service';
import { toast } from 'sonner';

export const formatLicensePlate = (value: string) => {
  // UX Architect Fix: Không tự động chèn dấu '-' vì format xe máy và ô tô khác nhau (vd: 59E1 vs 51H).
  // Tự động chèn sẽ làm kẹt phím Backspace khi người dùng muốn xoá.
  // Chỉ chuyển in hoa và cho phép nhập chữ, số, dấu gạch ngang, dấu chấm và khoảng trắng.
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9\-\.\s]/g, '')
    .slice(0, 15);
};

export const getFutureISO = (minutes: number, baseDate: Date = new Date()) => {
  const now = new Date(baseDate);
  now.setMinutes(now.getMinutes() + minutes);
  return now.toISOString();
};

export const getLocalISOTime = (minutes: number, baseDate: Date = new Date()) => {
  const now = new Date(baseDate);
  now.setMinutes(now.getMinutes() + minutes);
  const tzOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
};

export function useReservation(facilityId?: string) {
  const [facility, setFacility] = useState<any>(null);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleTypeId, setVehicleTypeId] = useState('');

  const [timeMode, setTimeMode] = useState<'30m' | '1h' | '2h' | 'custom'>('30m');
  const [customTime, setCustomTime] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservationResult, setReservationResult] = useState<any>(null);
  const [serverTimeOffset, setServerTimeOffset] = useState<number>(0);

  const getServerTime = () => new Date(Date.now() + serverTimeOffset);

  useEffect(() => {
    if (!facilityId) return;
    const fetchData = async () => {
      try {
        let offset = 0;
        try {
          const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
          const rawResponse = await fetch(`${apiBase}/public/facilities`, { method: 'HEAD' });
          const dateHeader = rawResponse.headers.get('date');
          if (dateHeader) {
            const serverTime = new Date(dateHeader).getTime();
            const clientTime = Date.now();
            offset = serverTime - clientTime;
            setServerTimeOffset(offset);
          }
        } catch (e) {
          console.warn('Could not sync server time, falling back to client time');
        }

        const [facRes, pricingRes, slotsRes] = await Promise.all([
          publicService.getFacilities(),
          publicService.getPricing(facilityId),
          publicService.getAvailableSlots(facilityId),
        ]);

        const f = facRes.data.find((x) => x._id === facilityId);
        setFacility(f);
        setPlans(pricingRes.data || []);
        setAvailableSlots(slotsRes.data || []);

        const validPlan = pricingRes.data?.find((p: any) => p.vehicleTypeId?._id || p.vehicleTypeId?.id);
        if (validPlan) {
          setVehicleTypeId(validPlan.vehicleTypeId._id || validPlan.vehicleTypeId.id);
        } else if (slotsRes.data && slotsRes.data.length > 0) {
          setVehicleTypeId(slotsRes.data[0].vehicleTypeId);
        }

        const baseDate = new Date(Date.now() + offset);
        setCustomTime(getLocalISOTime(35, baseDate));
      } catch (error) {
        toast.error('Không thể tải dữ liệu bãi xe');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [facilityId]);

  const getSelectedTime = () => {
    const baseDate = getServerTime();
    if (timeMode === '30m') return getFutureISO(35, baseDate); // 5m buffer
    if (timeMode === '1h') return getFutureISO(65, baseDate); // 5m buffer
    if (timeMode === '2h') return getFutureISO(125, baseDate); // 5m buffer
    return new Date(customTime).toISOString();
  };

  const isTimeValid = () => {
    if (timeMode !== 'custom') return true;
    if (!customTime) return false;
    const selectedDate = new Date(customTime).getTime();
    const minValidDate = getServerTime().getTime() + 34 * 60 * 1000; // 34 mins tolerance from server time
    return selectedDate >= minValidDate;
  };

  const isFormValid = useMemo(() => {
    // Đảm bảo đếm ký tự thực (không tính khoảng trắng/gạch ngang) >= 5
    const cleanPlate = licensePlate.replace(/[^A-Z0-9]/g, '');
    const hasActivePlan = plans.some((p) => (p.vehicleTypeId as any)?._id === vehicleTypeId);
    return Boolean(vehicleTypeId && hasActivePlan && cleanPlate.length >= 5 && isTimeValid());
  }, [vehicleTypeId, licensePlate, timeMode, customTime, plans]);

  const handleSubmit = async () => {
    if (!isFormValid || !facilityId) {
      toast.error('Vui lòng điền thông tin hợp lệ');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await reservationService.create({
        facilityId,
        vehicleTypeId,
        licensePlate: licensePlate.trim(),
        startTime: getSelectedTime(),
      });
      toast.success('Đặt chỗ thành công!');
      setReservationResult(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi đặt chỗ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const uniqueVehicleTypes = useMemo(() => {
    const typesMap = new Map();
    // 1. From active plans
    plans.forEach((p) => {
      const v = p.vehicleTypeId as any;
      if (v && (v._id || v.id)) {
        const id = v._id || v.id;
        typesMap.set(id, { _id: id, name: v.name || 'Unknown', code: v.code || '' });
      }
    });
    // 2. From available slots
    availableSlots.forEach((s) => {
      if (s.vehicleTypeId) {
        typesMap.set(s.vehicleTypeId, {
          _id: s.vehicleTypeId,
          name: s.vehicleTypeName,
          code: s.vehicleTypeCode,
        });
      }
    });
    return Array.from(typesMap.values());
  }, [plans, availableSlots]);
  const activePlan = plans.find((p) => (p.vehicleTypeId as any)?._id === vehicleTypeId);

  const currentAvailableCount = useMemo(() => {
    if (!vehicleTypeId) return null;
    const slotData = availableSlots.find((s) => s.vehicleTypeId === vehicleTypeId);
    return slotData ? slotData.availableCount : 0;
  }, [availableSlots, vehicleTypeId]);

  return {
    facility,
    plans,
    availableSlots,
    currentAvailableCount,
    loading,
    licensePlate,
    setLicensePlate,
    vehicleTypeId,
    setVehicleTypeId,
    timeMode,
    setTimeMode,
    customTime,
    setCustomTime,
    isSubmitting,
    reservationResult,
    closeTicketModal: () => setReservationResult(null),
    isTimeValid,
    isFormValid,
    handleSubmit,
    uniqueVehicleTypes,
    activePlan,
  };
}
