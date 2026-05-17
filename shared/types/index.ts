export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  results?: number;
  total?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff',
  DRIVER = 'driver',
}

export enum SessionStatus {
  ACTIVE = 'active',
  PENDING_PAYMENT = 'pending_payment',
  COMPLETED = 'completed',
  EXCEPTION = 'exception',
}

export enum SlotStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  MAINTENANCE = 'maintenance',
  LOCKED = 'locked',
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}
