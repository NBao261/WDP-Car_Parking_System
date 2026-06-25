import { UserStatus } from '../../types/user.types';

interface StatusBadgeProps {
  status: UserStatus | string;
}

/**
 * Shared status badge component — renders a styled pill for user account status.
 * Used in UserTable and any future status-aware UI.
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'active':
      return (
        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#dbeafe] text-[#1e40af] border border-[#93c5fd]/60">
          Active
        </span>
      );
    case 'inactive':
      return (
        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
          Inactive
        </span>
      );
    case 'locked':
      return (
        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#fef3c7] text-[#92400e] border border-[#fcd34d]/60">
          Locked
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
          {status}
        </span>
      );
  }
}
