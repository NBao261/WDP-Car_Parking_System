import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook trả về facilityId & facilityName mà Manager đã chọn ở màn hình facility-selection.
 * Nếu chưa chọn, trả về null và cung cấp hàm redirect.
 */
export function useManagerFacility() {
  const navigate = useNavigate();

  const facilityId = sessionStorage.getItem('manager_facility_id') || '';
  const facilityName = sessionStorage.getItem('manager_facility_name') || '';

  const redirectToSelection = () => {
    navigate('/manager/facility-selection', { replace: true });
  };

  return useMemo(
    () => ({ facilityId, facilityName, redirectToSelection }),
    [facilityId, facilityName]
  );
}
