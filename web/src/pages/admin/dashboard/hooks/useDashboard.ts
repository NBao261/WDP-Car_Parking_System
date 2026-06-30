import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { reportService, TrafficReportData, RevenueReportData, OccupancyReportData } from '../../../../services/report.service';
import { format, subDays } from 'date-fns';

export function useDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [trafficData, setTrafficData] = useState<TrafficReportData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueReportData | null>(null);
  const [occupancyData, setOccupancyData] = useState<OccupancyReportData | null>(null);

  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [trafficRes, revenueRes, occupancyRes] = await Promise.all([
        reportService.getTrafficReport({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          groupBy: 'day',
        }),
        reportService.getRevenueReport({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          groupBy: 'day',
        }),
        reportService.getOccupancyReport(), // Realtime occupancy
      ]);

      if (trafficRes.success) setTrafficData(trafficRes.data);
      if (revenueRes.success) setRevenueData(revenueRes.data);
      if (occupancyRes.success) setOccupancyData(occupancyRes.data);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error(error.message || 'Lỗi khi tải dữ liệu thống kê');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    isLoading,
    trafficData,
    revenueData,
    occupancyData,
    dateRange,
    setDateRange,
    fetchData,
  };
}
