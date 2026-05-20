import { UserRole } from '../../../shared/types';

export type UserStatus = 'active' | 'inactive' | 'locked';

/**
 * Facility object after population from BE (GET /users/me returns populated data).
 * The raw assignedFacilities array on User contains ObjectId strings,
 * but /users/me populates them into full objects.
 */
export interface AssignedFacility {
  _id: string;
  name: string;
  address: string;
  status: 'active' | 'inactive';
  openTime: string;
  closeTime: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  /** Raw IDs when fetching user list; populated objects when fetching /users/me */
  assignedFacilities: AssignedFacility[] | string[];
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

export interface AssignFacilitiesPayload {
  facilityIds: string[];
}
