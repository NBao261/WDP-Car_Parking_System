export interface Role {
  _id: string;
  code: string;
  name: string;
  description: string;
  permissions: string[];
  isDefault: boolean;
}

export interface UserPermissions {
  role: string;
  rolePermissions: string[];
  customPermissions: string[];
  mergedPermissions: string[];
}

export interface AssignRolePayload {
  userId: string;
  roleCode: string;
  customPermissions?: string[];
}

export interface CreateRolePayload {
  code: string;
  name: string;
  description?: string;
  permissions?: string[];
}
