import { ShieldAlert, Shield, User, Eye } from 'lucide-react';
import { UserRole } from '@shared/types';

interface RoleIconProps {
  role: UserRole | string;
  size?: number;
}

/**
 * Shared role icon component — renders the correct icon for each UserRole.
 * Used in UserTable, RoleCard, and any future role-aware UI.
 */
export function RoleIcon({ role, size = 16 }: RoleIconProps) {
  switch (role) {
    case UserRole.ADMIN:
      return <ShieldAlert size={size} className="text-red-500" />;
    case UserRole.MANAGER:
      return <Shield size={size} className="text-blue-500" />;
    case UserRole.STAFF:
      return <User size={size} className="text-green-500" />;
    case UserRole.DRIVER:
      return <Eye size={size} className="text-gray-500" />;
    default:
      return <User size={size} className="text-gray-400" />;
  }
}
