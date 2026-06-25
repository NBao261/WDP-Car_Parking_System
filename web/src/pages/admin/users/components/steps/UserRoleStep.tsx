import { UserRole } from '@shared/types';

interface RoleOption {
  value: UserRole;
  label: string;
  desc: string;
  color: string;
  bg: string;
}

export const ROLE_OPTIONS: RoleOption[] = [
  {
    value: UserRole.ADMIN,
    label: 'System Admin',
    desc: 'Toàn quyền hệ thống',
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
  },
  {
    value: UserRole.MANAGER,
    label: 'Facility Manager',
    desc: 'Quản lý vận hành bãi xe',
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
  },
  {
    value: UserRole.STAFF,
    label: 'Parking Staff',
    desc: 'Vận hành trực tiếp tại cổng',
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-200',
  },
  {
    value: UserRole.DRIVER,
    label: 'Driver / Customer',
    desc: 'Người gửi xe',
    color: 'text-gray-600',
    bg: 'bg-gray-50 border-gray-200',
  },
];

interface UserRoleStepProps {
  isEdit: boolean;
  selectedRole: UserRole;
  currentRoleLabel?: string;
  onChange: (role: UserRole) => void;
}

/**
 * Step 2 of UserFormModal: radio-card role selection.
 * Animation handled by parent UserFormModal motion.div wrapper.
 */
export function UserRoleStep({
  isEdit,
  selectedRole,
  currentRoleLabel,
  onChange,
}: UserRoleStepProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 mb-4">
        Chọn <strong>1 vai trò</strong> cho tài khoản này. Vai trò xác định quyền hạn cơ bản.
      </p>

      {ROLE_OPTIONS.map((opt) => {
        const isSelected = selectedRole === opt.value;
        return (
          <label
            key={opt.value}
            className={`
              flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
              ${isSelected ? `${opt.bg} border-opacity-100` : 'border-gray-100 hover:border-gray-200 bg-white'}
            `}
          >
            <div
              className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                ${isSelected ? 'border-[#96a827] bg-[#d7ee46]' : 'border-gray-300 bg-white'}
              `}
            >
              {isSelected && <div className="w-2 h-2 rounded-full bg-[#060606]" />}
            </div>
            <div className="flex-1">
              <div className={`font-bold text-sm ${opt.color}`}>{opt.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
            </div>
            <input
              type="radio"
              name="role"
              className="sr-only"
              value={opt.value}
              checked={isSelected}
              onChange={() => onChange(opt.value)}
            />
          </label>
        );
      })}

      {isEdit && currentRoleLabel && (
        <p className="text-xs text-gray-400 pt-1">
          Vai trò hiện tại: <span className="font-semibold capitalize">{currentRoleLabel}</span>
        </p>
      )}
    </div>
  );
}
