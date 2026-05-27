import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit-table';

// ── Interfaces for type-safety ──────────────────────────────────────────

interface RevenueTimePeriod {
  label: string;
  totalRevenue: number;
  transactionCount: number;
  avgRevenue: number;
}

interface RevenueMethod {
  method: string;
  totalRevenue: number;
  count: number;
}

interface RevenueReportData {
  byTimePeriod?: RevenueTimePeriod[];
  byMethod?: RevenueMethod[];
}

interface TrafficRow {
  label: string;
  checkIn: number;
  checkOut: number;
}

interface TrafficReportData {
  data?: TrafficRow[];
}

interface OccupancyRow {
  facilityName: string;
  floorName: string;
  total: number;
  occupied: number;
  available: number;
  occupancyRate: number;
}

interface OccupancyReportData {
  floors?: OccupancyRow[];
}

interface PeakHourRow {
  label: string;
  checkIn: number;
  checkOut: number;
  totalActivity: number;
}

interface PeakHoursReportData {
  hourlyDistribution?: PeakHourRow[];
}

type ReportData = RevenueReportData | TrafficReportData | OccupancyReportData | PeakHoursReportData;

// ── Export Service ──────────────────────────────────────────────────────

export class ExportService {
  static async generateReport(reportType: string, format: string, data: any): Promise<Buffer> {
    if (format === 'excel') {
      return this.generateExcel(reportType, data);
    } else if (format === 'pdf') {
      return this.generatePdf(reportType, data);
    }
    throw new Error('Unsupported format');
  }

  private static async generateExcel(reportType: string, data: any): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Smart Parking System';
    
    if (reportType === 'revenue') {
      const sheet = workbook.addWorksheet('Doanh Thu');
      sheet.columns = [
        { header: 'Thời gian', key: 'label', width: 20 },
        { header: 'Tổng doanh thu', key: 'totalRevenue', width: 20 },
        { header: 'Số giao dịch', key: 'transactionCount', width: 15 },
        { header: 'Trung bình/Giao dịch', key: 'avgRevenue', width: 25 },
      ];
      data.byTimePeriod?.forEach((row: any) => sheet.addRow(row));
      
      const methodSheet = workbook.addWorksheet('Theo Hình Thức');
      methodSheet.columns = [
        { header: 'Phương thức', key: 'method', width: 20 },
        { header: 'Tổng doanh thu', key: 'totalRevenue', width: 20 },
        { header: 'Số giao dịch', key: 'count', width: 15 },
      ];
      data.byMethod?.forEach((row: any) => methodSheet.addRow(row));
    } else if (reportType === 'traffic') {
      const sheet = workbook.addWorksheet('Lượt Xe Vào Ra');
      sheet.columns = [
        { header: 'Thời gian', key: 'label', width: 20 },
        { header: 'Xe vào', key: 'checkIn', width: 15 },
        { header: 'Xe ra', key: 'checkOut', width: 15 },
      ];
      data.data?.forEach((row: any) => sheet.addRow(row));
    } else if (reportType === 'occupancy') {
      const sheet = workbook.addWorksheet('Tỷ Lệ Lấp Đầy');
      sheet.columns = [
        { header: 'Bãi xe', key: 'facilityName', width: 25 },
        { header: 'Tầng', key: 'floorName', width: 20 },
        { header: 'Tổng slot', key: 'total', width: 15 },
        { header: 'Đang dùng', key: 'occupied', width: 15 },
        { header: 'Trống', key: 'available', width: 15 },
        { header: 'Tỷ lệ lấp đầy (%)', key: 'occupancyRate', width: 20 },
      ];
      data.floors?.forEach((row: any) => sheet.addRow(row));
    } else if (reportType === 'peak-hours') {
      const sheet = workbook.addWorksheet('Khung Giờ Cao Điểm');
      sheet.columns = [
        { header: 'Giờ', key: 'label', width: 20 },
        { header: 'Xe vào', key: 'checkIn', width: 15 },
        { header: 'Xe ra', key: 'checkOut', width: 15 },
        { header: 'Tổng hoạt động', key: 'totalActivity', width: 20 },
      ];
      data.hourlyDistribution?.forEach((row: any) => sheet.addRow(row));
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer as ArrayBuffer);
  }

  private static async generatePdf(reportType: string, data: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Simple font configuration - for a real app, a custom font supporting Vietnamese is needed
      // Here we rely on standard fonts, which might lack full UTF-8 accent support.
      doc.font('Helvetica-Bold').fontSize(18).text(`Bao Cao ${reportType.toUpperCase()}`, { align: 'center' });
      doc.moveDown();

      if (reportType === 'revenue' && data.byTimePeriod) {
        const table = {
          title: "Doanh thu theo thoi gian",
          headers: ["Thoi gian", "Tong doanh thu", "Giao dich", "Trung binh"],
          rows: data.byTimePeriod.map((r: any) => [r.label, String(r.totalRevenue), String(r.transactionCount), String(r.avgRevenue)])
        };
        doc.table(table, { width: 500 });
      } else if (reportType === 'traffic' && data.data) {
        const table = {
          title: "Luot xe vao ra",
          headers: ["Thoi gian", "Xe vao", "Xe ra"],
          rows: data.data.map((r: any) => [r.label, String(r.checkIn), String(r.checkOut)])
        };
        doc.table(table, { width: 500 });
      } else if (reportType === 'occupancy' && data.floors) {
        const table = {
          title: "Ty le lap day",
          headers: ["Bai xe", "Tang", "Tong", "Dang dung", "Trong", "Ty le (%)"],
          rows: data.floors.map((r: any) => [r.facilityName, r.floorName, String(r.total), String(r.occupied), String(r.available), String(r.occupancyRate)])
        };
        doc.table(table, { width: 500 });
      } else if (reportType === 'peak-hours' && data.hourlyDistribution) {
        const table = {
          title: "Khung gio",
          headers: ["Gio", "Vao", "Ra", "Tong"],
          rows: data.hourlyDistribution.map((r: any) => [r.label, String(r.checkIn), String(r.checkOut), String(r.totalActivity)])
        };
        doc.table(table, { width: 500 });
      }

      doc.end();
    });
  }
}
