import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  reportService,
  TrafficReportData,
  RevenueReportData,
  OccupancyReportData,
  PeakHoursReportData,
} from '../../../../services/report.service';
import { userService } from '../../../../services/user.service';
import { facilityService } from '../../../../services/facility.service';
import { UserRole } from '../../../../../../shared/types';
import { format, subDays, startOfMonth, startOfYear } from 'date-fns';

export interface UserStats {
  totalAdmin: number;
  totalManager: number;
  totalStaff: number;
  totalDriver: number;
  totalFacilities: number;
}

export type TimeFilter = 'today' | 'week' | 'month' | 'year';

export const TIME_FILTER_OPTIONS = [
  { value: 'today', label: 'Hôm nay' },
  { value: 'week', label: '7 ngày qua' },
  { value: 'month', label: 'Tháng này' },
  { value: 'year', label: 'Năm nay' },
] as const;

function getDateRange(filter: TimeFilter): {
  startDate: string;
  endDate: string;
  groupBy: 'day' | 'week' | 'month';
} {
  const now = new Date();
  const endDate = format(now, 'yyyy-MM-dd');
  switch (filter) {
    case 'today':
      return { startDate: endDate, endDate, groupBy: 'day' };
    case 'month':
      return { startDate: format(startOfMonth(now), 'yyyy-MM-dd'), endDate, groupBy: 'day' };
    case 'year':
      return { startDate: format(startOfYear(now), 'yyyy-MM-dd'), endDate, groupBy: 'month' };
    case 'week':
    default:
      return { startDate: format(subDays(now, 6), 'yyyy-MM-dd'), endDate, groupBy: 'day' };
  }
}

export function useDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');

  const [trafficData, setTrafficData] = useState<TrafficReportData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueReportData | null>(null);
  const [occupancyData, setOccupancyData] = useState<OccupancyReportData | null>(null);
  const [peakHoursData, setPeakHoursData] = useState<PeakHoursReportData | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  // Fetch user & facility stats once (not time-filtered)
  const fetchSystemStats = useCallback(async () => {
    try {
      const [adminRes, managerRes, staffRes, driverRes, facilityRes] = await Promise.allSettled([
        userService.getAllUsers({ role: UserRole.ADMIN, limit: 1 }),
        userService.getAllUsers({ role: UserRole.MANAGER, limit: 1 }),
        userService.getAllUsers({ role: UserRole.STAFF, limit: 1 }),
        userService.getAllUsers({ role: UserRole.DRIVER, limit: 1 }),
        facilityService.getAll({ limit: 1 }),
      ]);
      setUserStats({
        totalAdmin: adminRes.status === 'fulfilled' ? (adminRes.value.pagination?.total ?? 0) : 0,
        totalManager: managerRes.status === 'fulfilled' ? (managerRes.value.pagination?.total ?? 0) : 0,
        totalStaff: staffRes.status === 'fulfilled' ? (staffRes.value.pagination?.total ?? 0) : 0,
        totalDriver: driverRes.status === 'fulfilled' ? (driverRes.value.pagination?.total ?? 0) : 0,
        totalFacilities: facilityRes.status === 'fulfilled' ? (facilityRes.value.pagination?.total ?? 0) : 0,
      });
    } catch (err) {
      console.error('Error fetching system stats:', err);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setTrafficData(null);
    setRevenueData(null);
    setPeakHoursData(null);
    const { startDate, endDate, groupBy } = getDateRange(timeFilter);
    try {
      const [trafficRes, revenueRes, occupancyRes, peakRes] = await Promise.allSettled([
        reportService.getTrafficReport({ startDate, endDate, groupBy }),
        reportService.getRevenueReport({ startDate, endDate, groupBy }),
        reportService.getOccupancyReport(),
        reportService.getPeakHoursReport({ startDate, endDate }),
      ]);

      if (trafficRes.status === 'fulfilled' && trafficRes.value.success)
        setTrafficData(trafficRes.value.data);
      if (revenueRes.status === 'fulfilled' && revenueRes.value.success)
        setRevenueData(revenueRes.value.data);
      if (occupancyRes.status === 'fulfilled' && occupancyRes.value.success)
        setOccupancyData(occupancyRes.value.data);
      if (peakRes.status === 'fulfilled' && peakRes.value.success)
        setPeakHoursData(peakRes.value.data);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error(error.message || 'Lỗi khi tải dữ liệu thống kê');
    } finally {
      setIsLoading(false);
    }
  }, [timeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchSystemStats();
  }, [fetchSystemStats]);

  return {
    isLoading,
    timeFilter,
    setTimeFilter,
    trafficData,
    revenueData,
    occupancyData,
    peakHoursData,
    userStats,
    fetchData,
  };
}
