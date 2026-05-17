// ─── Permission Constants (Frontend Mirror) ────────────────────────────────
// Đồng bộ với server/src/config/permissions.ts
// Format: module:action (KHÔNG thay đổi keys này)

export const PERMISSIONS = {
  // ── 3.1 Module Quản lý Tòa nhà & Cơ sở vật chất ──
  FACILITY_READ: 'facility:read',
  FACILITY_CREATE: 'facility:create',
  FACILITY_UPDATE: 'facility:update',
  FACILITY_DELETE: 'facility:delete',
  FLOOR_MANAGE: 'floor:manage',
  VEHICLE_TYPE_MANAGE: 'vehicle_type:manage',

  // ── 3.2 Module Quản lý Slot đỗ xe ──
  SLOT_READ: 'slot:read',
  SLOT_CREATE: 'slot:create',
  SLOT_UPDATE_STATUS: 'slot:update_status',
  SLOT_DELETE: 'slot:delete',
  SLOT_RESERVE: 'slot:reserve',

  // ── 3.3 Module Bảng giá & Chính sách phí ──
  PRICING_READ: 'pricing:read',
  PRICING_CREATE: 'pricing:create',
  PRICING_UPDATE: 'pricing:update',
  PRICING_DELETE: 'pricing:delete',

  // ── 3.4 Module Lượt gửi xe (Parking Session) ──
  SESSION_CREATE: 'session:create',
  SESSION_READ: 'session:read',
  SESSION_CLOSE: 'session:close',
  SESSION_EXCEPTION: 'session:exception',

  // ── 3.5 Module Thanh toán ──
  PAYMENT_COLLECT: 'payment:collect',
  PAYMENT_ONLINE: 'payment:online',
  PAYMENT_HISTORY: 'payment:history',

  // ── 3.6 Module Báo cáo & Thống kê ──
  REPORT_REVENUE: 'report:revenue',
  REPORT_TRAFFIC: 'report:traffic',
  REPORT_OCCUPANCY: 'report:occupancy',
  REPORT_PEAK_HOURS: 'report:peak_hours',
  REPORT_EXCEPTIONS: 'report:exceptions',

  // ── 3.7 Module Quản trị hệ thống ──
  USER_MANAGE: 'user:manage',
  ROLE_MANAGE: 'role:manage',
  CONFIG_MANAGE: 'config:manage',
  LOG_VIEW: 'log:view',

  // ── 3.8 Module Phản hồi & Sự cố ──
  FEEDBACK_CREATE: 'feedback:create',
  FEEDBACK_READ: 'feedback:read',
  FEEDBACK_PROCESS: 'feedback:process',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: PermissionKey[] = Object.values(PERMISSIONS);

// ─── Grouped for UI display ────────────────────────────────────────────────
export interface PermissionItem {
  id: PermissionKey;
  label: string;
}

export interface PermissionGroup {
  id: string;
  name: string;
  icon: string;
  permissions: PermissionItem[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: 'facility',
    name: 'Quản lý Bãi xe & Cơ sở vật chất',
    icon: '🏢',
    permissions: [
      { id: PERMISSIONS.FACILITY_READ, label: 'Xem danh sách bãi xe' },
      { id: PERMISSIONS.FACILITY_CREATE, label: 'Tạo bãi xe mới' },
      { id: PERMISSIONS.FACILITY_UPDATE, label: 'Chỉnh sửa bãi xe' },
      { id: PERMISSIONS.FACILITY_DELETE, label: 'Xóa bãi xe' },
      { id: PERMISSIONS.FLOOR_MANAGE, label: 'Quản lý tầng / khu vực' },
      { id: PERMISSIONS.VEHICLE_TYPE_MANAGE, label: 'Quản lý loại phương tiện' },
    ],
  },
  {
    id: 'slot',
    name: 'Quản lý Slot đỗ xe',
    icon: '🅿️',
    permissions: [
      { id: PERMISSIONS.SLOT_READ, label: 'Xem danh sách slot' },
      { id: PERMISSIONS.SLOT_CREATE, label: 'Tạo slot mới' },
      { id: PERMISSIONS.SLOT_UPDATE_STATUS, label: 'Cập nhật trạng thái slot' },
      { id: PERMISSIONS.SLOT_DELETE, label: 'Xóa slot' },
      { id: PERMISSIONS.SLOT_RESERVE, label: 'Đặt trước chỗ đỗ (Driver)' },
    ],
  },
  {
    id: 'pricing',
    name: 'Bảng giá & Chính sách phí',
    icon: '💰',
    permissions: [
      { id: PERMISSIONS.PRICING_READ, label: 'Xem bảng giá' },
      { id: PERMISSIONS.PRICING_CREATE, label: 'Tạo bảng giá mới' },
      { id: PERMISSIONS.PRICING_UPDATE, label: 'Cập nhật bảng giá' },
      { id: PERMISSIONS.PRICING_DELETE, label: 'Xóa bảng giá' },
    ],
  },
  {
    id: 'session',
    name: 'Vận hành & Lượt gửi xe',
    icon: '🚗',
    permissions: [
      { id: PERMISSIONS.SESSION_CREATE, label: 'Tạo lượt gửi xe (Check-in)' },
      { id: PERMISSIONS.SESSION_READ, label: 'Xem lượt gửi xe' },
      { id: PERMISSIONS.SESSION_CLOSE, label: 'Kết thúc lượt gửi (Check-out)' },
      { id: PERMISSIONS.SESSION_EXCEPTION, label: 'Xử lý ngoại lệ lượt gửi' },
    ],
  },
  {
    id: 'payment',
    name: 'Thanh toán',
    icon: '💳',
    permissions: [
      { id: PERMISSIONS.PAYMENT_COLLECT, label: 'Thu phí trực tiếp tại bãi' },
      { id: PERMISSIONS.PAYMENT_ONLINE, label: 'Thanh toán online (Driver)' },
      { id: PERMISSIONS.PAYMENT_HISTORY, label: 'Xem lịch sử thanh toán' },
    ],
  },
  {
    id: 'report',
    name: 'Báo cáo & Thống kê',
    icon: '📊',
    permissions: [
      { id: PERMISSIONS.REPORT_REVENUE, label: 'Báo cáo doanh thu' },
      { id: PERMISSIONS.REPORT_TRAFFIC, label: 'Báo cáo lưu lượng xe' },
      { id: PERMISSIONS.REPORT_OCCUPANCY, label: 'Báo cáo tỷ lệ lấp đầy' },
      { id: PERMISSIONS.REPORT_PEAK_HOURS, label: 'Báo cáo giờ cao điểm' },
      { id: PERMISSIONS.REPORT_EXCEPTIONS, label: 'Báo cáo ngoại lệ' },
    ],
  },
  {
    id: 'admin',
    name: 'Quản trị hệ thống',
    icon: '⚙️',
    permissions: [
      { id: PERMISSIONS.USER_MANAGE, label: 'Quản lý người dùng' },
      { id: PERMISSIONS.ROLE_MANAGE, label: 'Quản lý vai trò & phân quyền' },
      { id: PERMISSIONS.CONFIG_MANAGE, label: 'Cấu hình hệ thống' },
      { id: PERMISSIONS.LOG_VIEW, label: 'Xem nhật ký hệ thống' },
    ],
  },
  {
    id: 'feedback',
    name: 'Phản hồi & Sự cố',
    icon: '💬',
    permissions: [
      { id: PERMISSIONS.FEEDBACK_CREATE, label: 'Gửi phản hồi / báo sự cố' },
      { id: PERMISSIONS.FEEDBACK_READ, label: 'Xem phản hồi' },
      { id: PERMISSIONS.FEEDBACK_PROCESS, label: 'Xử lý phản hồi' },
    ],
  },
];
