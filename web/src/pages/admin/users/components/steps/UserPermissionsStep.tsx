import { Key } from 'lucide-react';
import { PermissionGroupList } from '../../../../../components/ui/PermissionGroupList';

interface UserPermissionsStepProps {
  customPerms: Set<string>;
  basePerms: Set<string>;
  onToggle: (permId: string) => void;
  isLoading: boolean;
}

/**
 * Step 3 of UserFormModal (edit mode only): custom permission overrides.
 * Animation is handled by the parent UserFormModal — no motion.div here
 * to avoid double-animation and layout conflicts.
 */
export function UserPermissionsStep({ customPerms, basePerms, onToggle, isLoading }: UserPermissionsStepProps) {
  return (
    <div>
      <div className="mb-4">
        <p className="text-sm text-gray-600 leading-relaxed">
          Bổ sung quyền <strong>ngoài vai trò</strong> cho tài khoản này. Các quyền được tích sẽ
          thêm vào quyền của vai trò.
        </p>
        {customPerms.size > 0 && (
          <div className="mt-2 inline-flex items-center gap-1.5 bg-[#d7ee46]/20 border border-[#d7ee46]/40 text-[#5a6b00] text-xs font-semibold px-3 py-1 rounded-lg">
            <Key size={12} />
            {customPerms.size} quyền bổ sung đang áp dụng
          </div>
        )}
      </div>

      <PermissionGroupList
        selectedPerms={customPerms}
        basePerms={basePerms}
        onToggle={onToggle}
        isLoading={isLoading}
        allowGroupToggle={false}
      />
    </div>
  );
}
