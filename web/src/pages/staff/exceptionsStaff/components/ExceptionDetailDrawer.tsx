import { X } from "lucide-react";
import { ExceptionData } from "./ExceptionsList";

interface ExceptionDetailDrawerProps {
  selectedException: ExceptionData | null;
  onClose: () => void;
  onContinueCheckout: (plate: string) => void;
}

const STATUS_BADGE: Record<string, { bg: string; text: string; border: string; label: string }> = {
  RESOLVED:   { bg: "bg-[#e8f7f0]",  text: "text-[#1d7a4a]", border: "border-[#e8f7f0]",  label: "ĐÃ GIẢI QUYẾT ✓" },
  REJECTED:   { bg: "bg-[#fde8e8]",  text: "text-[#b03030]", border: "border-[#fde8e8]",  label: "TỪ CHỐI" },
  NEW:        { bg: "bg-[#fff3e0]",  text: "text-[#c77700]", border: "border-[#fff3e0]",  label: "MỚI" },
  PROCESSING: { bg: "bg-[#e3ecf8]",  text: "text-[#1a5fa8]", border: "border-[#e3ecf8]",  label: "ĐANG XỬ LÝ" },
};

export default function ExceptionDetailDrawer({
  selectedException,
  onClose,
  onContinueCheckout,
}: ExceptionDetailDrawerProps) {
  if (!selectedException) return null;

  const badge = STATUS_BADGE[selectedException.status] || STATUS_BADGE.NEW;
  const isPending =
    selectedException.status === "NEW" || selectedException.status === "PROCESSING";

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-[420px] w-full bg-white shadow-[-8px_0_32px_rgba(0,0,0,0.12)] border-l border-[#e8e9e8] flex flex-col animate-in slide-in-from-right duration-300 ease-out">
        {/* Header */}
        <div className="px-6 py-7 border-b border-[#e8e9e8] flex justify-between items-start">
          <div>
            <h3 className="text-[18px] font-bold text-[#060606]">Chi tiết Ngoại lệ</h3>
            <p className="text-[12px] text-[#6b6b6b] mt-1">
              Mã Vé · {selectedException.code}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#6b6b6b] hover:text-black p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-8">
          {/* VEHICLE INFO */}
          <div>
            <h4 className="text-[11px] font-semibold text-[#6b6b6b] uppercase tracking-wider mb-4 border-b border-[#e8e9e8] pb-2">
              Thông tin Xe
            </h4>
            <div className="space-y-3">
              <div>
                <div className="text-[12px] text-[#6b6b6b]">Biển số</div>
                <div className="font-mono text-[24px] font-bold text-[#060606]">
                  {selectedException.plate}
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6b6b6b]">Loại xe:</span>
                <span className="font-medium">{selectedException.vehicleType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6b6b6b]">Tầng / Slot:</span>
                <span className="font-medium">
                  {selectedException.floorName} · {selectedException.slotCode}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6b6b6b]">Giờ vào:</span>
                <span className="font-medium">{selectedException.checkInTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6b6b6b]">Cổng vào:</span>
                <span className="font-medium">{selectedException.gateIn}</span>
              </div>
            </div>
          </div>

          {/* REPORT INFO */}
          <div>
            <h4 className="text-[11px] font-semibold text-[#6b6b6b] uppercase tracking-wider mb-4 border-b border-[#e8e9e8] pb-2">
              Thông tin Báo cáo
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#6b6b6b]">Loại ngoại lệ:</span>
                <span className="font-medium">{selectedException.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6b6b6b]">Báo cáo lúc:</span>
                <span className="font-medium">{selectedException.time}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6b6b6b]">Người báo cáo:</span>
                <span className="font-medium">{selectedException.staffName} (bạn)</span>
              </div>
              {selectedException.surcharge > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b6b6b]">Phụ phí ngoại lệ:</span>
                  <span className="font-medium text-[#b03030]">
                    +{selectedException.surcharge.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* STATUS & MANAGER RESOLUTION */}
          <div>
            <h4 className="text-[11px] font-semibold text-[#6b6b6b] uppercase tracking-wider mb-4 border-b border-[#e8e9e8] pb-2">
              Quản lý Giải quyết
            </h4>

            {/* Status badge */}
            <span
              className={`inline-block px-2.5 py-1 rounded-[20px] text-[10px] font-bold uppercase tracking-wider mb-4 ${badge.bg} ${badge.text}`}
            >
              {badge.label}
            </span>

            {(selectedException.status === "RESOLVED" || selectedException.status === "REJECTED") && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b6b6b]">Giải quyết bởi:</span>
                  <span className="font-medium">
                    {selectedException.managerName
                      ? `Quản lý · ${selectedException.managerName}`
                      : "Quản lý hệ thống"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b6b6b]">Thời gian cập nhật:</span>
                  <span className="font-medium">{selectedException.updatedAt}</span>
                </div>
                {selectedException.managerNote && (
                  <div className="text-sm">
                    <span className="text-[#6b6b6b] block mb-1">
                      {selectedException.status === "RESOLVED"
                        ? "Ghi chú từ quản lý:"
                        : "Lý do từ chối:"}
                    </span>
                    <div
                      className={`p-3 rounded-md text-[#060606] font-medium border ${badge.border} ${badge.bg}/50`}
                    >
                      "{selectedException.managerNote}"
                    </div>
                  </div>
                )}
              </div>
            )}

            {isPending && (
              <div className="italic text-[#6b6b6b] text-sm py-4">
                Đang chờ quản lý xem xét…
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#e8e9e8] flex gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 h-11 border border-[#e8e9e8] bg-white rounded-[8px] text-[#060606] font-medium hover:bg-gray-50 transition-colors"
          >
            Đóng
          </button>
          {selectedException.status === "RESOLVED" && (
            <button
              onClick={() => {
                onClose();
                onContinueCheckout(selectedException.plate);
              }}
              className="flex-[2] h-11 bg-[#d7ee46] text-[#060606] font-bold rounded-[8px] hover:brightness-95 transition-all shadow-sm"
            >
              Check-out 🚙
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
