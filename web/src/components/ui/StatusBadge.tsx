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
        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[#ffffff] text-[#9FE870] border border-[#9FE870]">
          Active
        </span>
      );
    case 'inactive':
      return (
        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[#ffffff] text-[#060606] border border-[#060606]">
          Inactive
        </span>
      );
    case 'locked':
      return (
        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[#ffffff] text-[#060606] border border-[#060606]">
          Locked
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[#ffffff] text-[#060606] border border-[#060606]">
          {status}
        </span>
      );
  }
}
