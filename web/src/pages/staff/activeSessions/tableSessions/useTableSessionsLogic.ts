import { useState, useEffect } from 'react';
import { sessionService } from '../../../../services/session.service';
import { facilityService } from '../../../../services/facility.service';
import { VehicleType } from '../../../../services/vehicleType.service';

export interface Session {
  _id: string; code: string; cardCode?: string; licensePlate: string; status: string;
  checkInTime: string; totalFee: number; vehicleTypeId: { _id: string, name: string, code: string, icon?: string };
  gateIn: string; floorId?: { name: string }; slotId?: { code: string };
}

export function useTableSessionsLogic(onTotalChange?: (total: number) => void) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [facilityVehicleTypes, setFacilityVehicleTypes] = useState<VehicleType[]>([]);
  const [filterVehicleTypeId, setFilterVehicleTypeId] = useState('All');
  const [filterGate, setFilterGate] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState<Session | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    const facilityId = sessionStorage.getItem("staff_facility_id") || undefined;
    if (facilityId) {
      facilityService.getOperationsConfig(facilityId).then(res => {
        if (res.success && res.data?.allowedVehicleTypes) setFacilityVehicleTypes(res.data.allowedVehicleTypes);
      }).catch(console.error);
    }
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const facilityId = sessionStorage.getItem("staff_facility_id") || undefined;
      const vehicleTypeId = filterVehicleTypeId !== 'All' ? filterVehicleTypeId : undefined;
      const res = await sessionService.getActiveSessions({ limit: 100, facilityId, vehicleTypeId });
      if (res.success && res.data) {
        setSessions(res.data as any);
        onTotalChange?.((res as any).total ?? res.data.length);
      } else { setSessions([]); onTotalChange?.(0); }
    } catch (error) {
      setSessions([]); onTotalChange?.(0);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchSessions(); }, [filterVehicleTypeId]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value.replace(/\s+/g, '').toUpperCase());
    setCurrentPage(1); setToastMessage('');
  };

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (!current || current.key !== key) return { key, direction: 'asc' };
      if (current.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearch(''); setFilterVehicleTypeId('All'); setFilterLocation('All'); setFilterGate('All');
    setFilterStatus('All'); setSortConfig(null); setCurrentPage(1); setToastMessage('');
  };

  const hasActiveFilters = search !== '' || filterVehicleTypeId !== 'All' || filterLocation !== 'All' || filterGate !== 'All' || filterStatus !== 'All' || sortConfig !== null;

  const filteredSessions = sessions
    .filter(s => search === '' || s.licensePlate.toUpperCase().includes(search) || s.code.toUpperCase().includes(search))
    .filter(s => filterGate === 'All' || s.gateIn === filterGate)
    .filter(s => filterLocation === 'All' || filterLocation === '' || (s.floorId && s.slotId ? `${s.floorId.name} - ${s.slotId.code}` : '').toUpperCase().includes(filterLocation.toUpperCase()))
    .filter(s => filterStatus === 'All' || s.status === filterStatus)
    .sort((a, b) => {
      if (!sortConfig) return new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime();
      const modifier = sortConfig.direction === 'asc' ? 1 : -1;
      switch (sortConfig.key) {
        case 'cardCode': return modifier * (a.cardCode || a.code).localeCompare(b.cardCode || b.code);
        case 'licensePlate': return modifier * a.licensePlate.localeCompare(b.licensePlate);
        case 'vehicleType': return modifier * (a.vehicleTypeId?.name || '').localeCompare(b.vehicleTypeId?.name || '');
        case 'location': return modifier * ((a.floorId && a.slotId ? `${a.floorId.name}-${a.slotId.code}` : '').localeCompare(b.floorId && b.slotId ? `${b.floorId.name}-${b.slotId.code}` : ''));
        case 'gateIn': return modifier * (a.gateIn || '').localeCompare(b.gateIn || '');
        case 'checkInTime': return modifier * (new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime());
        case 'duration': return modifier * (new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
        case 'status': return modifier * a.status.localeCompare(b.status);
        default: return 0;
      }
    });

  useEffect(() => {
    if (search && filteredSessions.length === 0) setToastMessage('Không tìm thấy xe');
    else setToastMessage('');
  }, [search, filteredSessions.length]);

  return {
    sessions, loading, search, setSearch, facilityVehicleTypes, filterVehicleTypeId, setFilterVehicleTypeId,
    filterGate, setFilterGate, filterLocation, setFilterLocation, filterStatus, setFilterStatus,
    selectedSession, setSelectedSession, showCheckoutModal, setShowCheckoutModal, toastMessage, setToastMessage,
    currentPage, setCurrentPage, itemsPerPage, sortConfig, setSortConfig, fetchSessions,
    handleSearchChange, handleSort, handleResetFilters, hasActiveFilters, filteredSessions
  };
}
