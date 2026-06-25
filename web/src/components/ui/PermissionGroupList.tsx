import { Check, RefreshCw } from 'lucide-react';
import { PERMISSION_GROUPS } from '../../constants/permissions';

interface PermissionGroupListProps {
  /** Set of currently selected permission IDs. */
  selectedPerms: Set<string>;
  /** Callback when a single permission is toggled. */
  onToggle: (permId: string) => void;
  /** Whether permissions are being loaded (shows spinner). */
  isLoading?: boolean;
  /**
   * If true, group headers act as "select all in group" toggles.
   * Used in PermissionMatrixModal. Defaults to false.
   */
  allowGroupToggle?: boolean;
  /** Callback when a whole group is toggled (used with allowGroupToggle). */
  onToggleGroup?: (permIds: string[]) => void;
  /** Set of permissions inherited from the user's base role (cannot be toggled here) */
  basePerms?: Set<string>;
}

/**
 * Shared permission group list component.
 * Used by:
 *  - UserFormModal (Step 3 — custom permission overrides)
 *  - PermissionMatrixModal (full role permission editor)
 *
 * UX fix: replaced <label>+<sr-only input> pattern with explicit onClick
 * to avoid browser inconsistency with absolutely-positioned hidden inputs.
 */
export function PermissionGroupList({
  selectedPerms,
  onToggle,
  isLoading = false,
  allowGroupToggle = false,
  onToggleGroup,
  basePerms = new Set(),
}: PermissionGroupListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
        <RefreshCw size={16} className="animate-spin" />
        <span>Đang tải quyền hiện tại...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {PERMISSION_GROUPS.map((group) => {
        const groupIds = group.permissions.map((p) => p.id);
        const checkedCount = groupIds.filter(
          (id) => selectedPerms.has(id) || basePerms.has(id)
        ).length;
        const allChecked = checkedCount === groupIds.length;
        const someChecked = checkedCount > 0 && !allChecked;

        return (
          <div key={group.id} className="border border-gray-100 rounded-xl overflow-hidden">
            {/* Group Header */}
            {allowGroupToggle ? (
              <button
                type="button"
                onClick={() => onToggleGroup?.(groupIds)}
                className="w-full bg-gray-50/80 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between hover:bg-gray-100/60 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{group.icon}</span>
                  <span className="font-bold text-[#060606] text-xs">{group.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                    {checkedCount} / {groupIds.length}
                  </span>
                  <div
                    className={`
                      w-5 h-5 rounded flex items-center justify-center border-2 transition-all
                      ${
                        allChecked
                          ? 'bg-[#d7ee46] border-[#c4dc32]'
                          : someChecked
                            ? 'bg-[#d7ee46]/40 border-[#c4dc32]/60'
                            : 'bg-white border-gray-300'
                      }
                    `}
                  >
                    {(allChecked || someChecked) && (
                      <Check size={12} className="text-[#060606]" strokeWidth={3} />
                    )}
                  </div>
                </div>
              </button>
            ) : (
              <div className="bg-gray-50/80 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{group.icon}</span>
                  <span className="font-bold text-[#060606] text-xs">{group.name}</span>
                </div>
                {checkedCount > 0 && (
                  <span className="text-[10px] font-bold text-[#96a827] bg-[#d7ee46]/20 px-2 py-0.5 rounded">
                    +{checkedCount}
                  </span>
                )}
              </div>
            )}

            {/* Permission Items */}
            <div className="divide-y divide-gray-50">
              {group.permissions.map((perm) => {
                const isBase = basePerms.has(perm.id);
                const isCustom = selectedPerms.has(perm.id);
                const isChecked = isBase || isCustom;

                return (
                  <div
                    key={perm.id}
                    role="checkbox"
                    aria-checked={isChecked}
                    tabIndex={isBase ? -1 : 0}
                    onClick={() => {
                      if (!isBase) onToggle(perm.id);
                    }}
                    onKeyDown={(e) => {
                      if (isBase) return;
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        onToggle(perm.id);
                      }
                    }}
                    className={`flex items-center justify-between px-4 py-3 transition-colors select-none ${
                      isBase
                        ? 'bg-gray-50/50 opacity-80 cursor-not-allowed'
                        : 'hover:bg-gray-50/80 cursor-pointer group'
                    }`}
                  >
                    <div className="flex flex-col flex-1 min-w-0 pr-4">
                      <span className="text-sm font-medium text-gray-700 group-hover:text-[#060606] transition-colors leading-snug">
                        {perm.label}
                      </span>
                      <span className="text-[11px] text-gray-400 font-mono mt-0.5 truncate">
                        {perm.id}
                      </span>
                    </div>
                    <div
                      className={`
                        w-5 h-5 rounded border-2 flex items-center justify-center transition-all shrink-0
                        ${
                          isBase
                            ? 'bg-gray-200 border-gray-300 text-gray-500'
                            : isCustom
                              ? 'bg-[#d7ee46] border-[#c4dc32] text-[#060606]'
                              : 'bg-white border-gray-300 group-hover:border-gray-400 text-transparent'
                        }
                      `}
                    >
                      {isChecked && <Check size={12} className="currentColor" strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
