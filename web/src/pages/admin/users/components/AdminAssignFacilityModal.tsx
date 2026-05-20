import { useState, useEffect } from 'react';
import { X, MapPin, Square, CheckSquare, AlertCircle, RefreshCw, CheckCircle, Building2 } from 'lucide-react';
import { User, AssignedFacility } from '../../../../types/user.types';
import { userService } from '../../../../services/user.service';
import { facilityService, Facility } from '../../../../services/facility.service';
import { toast } from 'sonner';

interface AdminAssignFacilityModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal nhanh (Quick-Action) để Admin phân công Tòa nhà
 * trực tiếp từ bảng danh sách User — không cần vào Edit wizard.
 * Hiển thị TẤT CẢ facilities đang active trong hệ thống.
 */
export function AdminAssignFacilityModal({ user, onClose, onSuccess }: AdminAssignFacilityModalProps) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loadingFacilities, setLoadingFacilities] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const currentIds = (user.assignedFacilities ?? []).map((f) =>
    typeof f === 'string' ? f : (f as AssignedFacility)._id
  );
  const [selectedIds, setSelectedIds] = useState<string[]>(currentIds);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoadingFacilities(true);
      setFetchError('');
      try {
        const res = await facilityService.getAll({ status: 'active', limit: 100 });
        setFacilities(res.data ?? []);
      } catch (err: any) {
        setFetchError(err.message || 'Không thể tải danh sách tòa nhà.');
      } finally {
        setLoadingFacilities(false);
      }
    };
    load();
  }, []);

  const toggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      await userService.assignFacilities(user._id, selectedIds);
      toast.success(`Đã cập nhật phân công tòa nhà cho ${user.name}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      setSaveError(err.message || 'Không thể lưu phân công. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const roleLabel = user.role === 'manager' ? 'Manager' : 'Staff';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col" style={{ maxHeight: '82vh' }}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#d7ee46]/20 flex items-center justify-center shrink-0">
              <Building2 size={18} className="text-[#5a9e0f]" />
            </div>
            <div>
              <h3 className="font-bold text-[#060606] leading-tight">Phân công Tòa nhà</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                <span className="font-semibold text-gray-600">{user.name}</span>
                <span className="mx-1">·</span>
                <span className="capitalize">{roleLabel}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors shrink-0 mt-0.5"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          {loadingFacilities ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <RefreshCw className="w-5 h-5 animate-spin mb-2" />
              <p className="text-xs">Đang tải danh sách tòa nhà...</p>
            </div>
          ) : fetchError ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fetchError}
            </div>
          ) : facilities.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">
              Chưa có tòa nhà active nào trong hệ thống.
            </p>
          ) : (
            <div className="space-y-2">
              {facilities.map((facility) => {
                const selected = selectedIds.includes(facility._id);
                return (
                  <button
                    key={facility._id}
                    type="button"
                    onClick={() => toggle(facility._id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                      selected
                        ? 'bg-[#f0f9dc] border-[#d7ee46]'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {selected ? (
                        <CheckSquare className="w-4 h-4 text-[#5a9e0f]" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-[#060606] truncate">{facility.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <p className="text-[11px] text-gray-400 truncate">{facility.address}</p>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {facility.openTime} – {facility.closeTime}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Save error */}
        {saveError && (
          <div className="mx-4 mb-2 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {saveError}
          </div>
        )}

        {/* Summary bar */}
        {selectedIds.length > 0 && (
          <div className="mx-4 mb-2 px-3 py-2 bg-[#f0f9dc] border border-[#d7ee46] rounded-xl">
            <p className="text-xs font-semibold text-[#5a9e0f] text-center">
              ✓ Đã chọn {selectedIds.length} tòa nhà
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-3.5 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="w-1/3 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loadingFacilities}
            className="flex-1 py-2.5 text-sm font-bold bg-[#d7ee46] text-[#060606] rounded-xl hover:bg-[#c4dc32] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? (
              <><RefreshCw size={14} className="animate-spin" /> Đang lưu...</>
            ) : (
              <><CheckCircle size={14} /> Lưu phân công</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
