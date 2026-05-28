import { apiClient } from './api';

// ─── Types — mirrors backend report.service.ts ────────────────────────────────

export type ReportGroupBy = 'day' | 'week' | 'month';

// FR-6.1 Traffic
export interface TrafficReportParams {
  facilityId?: string;
  floorId?: string;
  vehicleTypeId?: string;
  startDate?: string;
  endDate?: string;
  groupBy?: ReportGroupBy;
}

export interface TrafficDataPoint {
  label: string;
  checkIn: number;
  checkOut: number;
}

export interface TrafficReportResponse {
  groupBy: ReportGroupBy;
  summary: {
    totalCheckIn: number;
    totalCheckOut: number;
    currentlyParked: number;
  };
  data: TrafficDataPoint[];
}

// FR-6.2 Revenue
export interface RevenueReportParams {
  facilityId?: string;
  vehicleTypeId?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  groupBy?: ReportGroupBy;
}

export interface RevenueDataPoint {
  label: string;
  totalRevenue: number;
  transactionCount: number;
  avgRevenue: number;
}

export interface RevenueByMethod {
  method: string;
  totalRevenue: number;
  count: number;
}

export interface RevenueByVehicleType {
  vehicleTypeId: string;
  vehicleTypeName: string;
  totalRevenue: number;
  count: number;
}

export interface RevenueReportResponse {
  groupBy: ReportGroupBy;
  summary: {
    grandTotal: number;
    totalTransactions: number;
    avgRevenuePerDay: number;
  };
  byTimePeriod: RevenueDataPoint[];
  byMethod: RevenueByMethod[];
  byVehicleType: RevenueByVehicleType[];
}

// FR-6.3 Occupancy
export interface OccupancyReportParams {
  facilityId?: string;
  vehicleTypeId?: string;
}

export interface FloorOccupancy {
  floorId: string;
  floorName: string;
  facilityId: string;
  facilityName: string;
  total: number;
  occupied: number;
  reserved: number;
  available: number;
  maintenance: number;
  locked: number;
  occupancyRate: number;
  effectiveOccupancy: number;
}

export interface OccupancyReportResponse {
  summary: {
    totalSlots: number;
    totalOccupied: number;
    totalReserved: number;
    totalAvailable: number;
    overallOccupancyRate: number;
    effectiveOccupancyRate: number;
  };
  floors: FloorOccupancy[];
}

// FR-6.4 Peak Hours
export interface PeakHoursReportParams {
  facilityId?: string;
  vehicleTypeId?: string;
  startDate?: string;
  endDate?: string;
}

export interface HourlyDataPoint {
  hour: number;
  label: string;
  checkIn: number;
  checkOut: number;
  totalActivity: number;
}

export interface PeakHour {
  hour: number;
  label: string;
  totalActivity: number;
  checkIn: number;
  checkOut: number;
}

export interface PeakHoursReportResponse {
  summary: {
    totalActivity: number;
    avgActivityPerHour: number;
    peakHours: PeakHour[];
  };
  hourlyDistribution: HourlyDataPoint[];
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const reportService = {
  /**
   * FR-6.1: Báo cáo lượt xe vào/ra
   * GET /api/v1/reports/traffic
   */
  getTrafficReport: async (
    params?: TrafficReportParams
  ): Promise<{ success: boolean; data: TrafficReportResponse }> => {
    return apiClient.get('/reports/traffic', { params });
  },

  /**
   * FR-6.2: Báo cáo doanh thu
   * GET /api/v1/reports/revenue
   */
  getRevenueReport: async (
    params?: RevenueReportParams
  ): Promise<{ success: boolean; data: RevenueReportResponse }> => {
    return apiClient.get('/reports/revenue', { params });
  },

  /**
   * FR-6.3: Báo cáo tỷ lệ lấp đầy (realtime)
   * GET /api/v1/reports/occupancy
   */
  getOccupancyReport: async (
    params?: OccupancyReportParams
  ): Promise<{ success: boolean; data: OccupancyReportResponse }> => {
    return apiClient.get('/reports/occupancy', { params });
  },

  /**
   * FR-6.4: Báo cáo khung giờ cao điểm
   * GET /api/v1/reports/peak-hours
   */
  getPeakHoursReport: async (
    params?: PeakHoursReportParams
  ): Promise<{ success: boolean; data: PeakHoursReportResponse }> => {
    return apiClient.get('/reports/peak-hours', { params });
  },
};
