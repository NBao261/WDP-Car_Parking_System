import { UserRole } from '../../../shared/types';

export type UserStatus = 'active' | 'inactive' | 'locked';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  assignedFacilities: string[];
  customPermissions: string[];
  mustChangePassword?: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface UserListResponse {
  success: boolean;
  data: User[];
  pagination: PaginationMeta;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  assignedFacilities?: string[];
}

export interface UpdateUserPayload {
  name?: string;
  phone?: string;
}
