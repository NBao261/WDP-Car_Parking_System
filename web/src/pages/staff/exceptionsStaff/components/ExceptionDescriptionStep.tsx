import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { ExceptionType, EXCEPTION_TYPE_LABELS } from "../../../../services/exception.service";
import { SelectedSessionInfo } from "./SessionLookupStep";

interface ExceptionDescriptionStepProps {
  session: SelectedSessionInfo;
  exceptionType: ExceptionType;
  description: string;
  surcharge: number;
  onDescriptionChange: (v: string) => void;
  onSurchargeChange: (v: number) => void;
}

const DEFAULT_SURCHARGE_LOST_CARD = 50000; // 50,000 VND

const TYPE_HINTS: Partial<Record<ExceptionType, string>> = {
  [ExceptionType.LOST_CARD]:
    "Mô tả tình huống mất vé (ví dụ: khách không tìm thấy thẻ, thẻ bị hỏng...). Phụ phí sẽ được cộng vào tổng phí khi check-out.",
  [ExceptionType.WRONG_PLATE]:
    "Ghi rõ biển số thực tế của xe và biển số được ghi nhận. Ngoại lệ sẽ chuyển cho Manager duyệt.",
  [ExceptionType.OVERTIME]:
    "Mô tả tình huống quá hạn (ví dụ: xe không ra đúng giờ, liên hệ chủ xe không được...). Phí quá hạn tính tự động theo bảng giá.",
  [ExceptionType.WRONG_ZONE]:
    "Mô tả tầng / slot thực tế xe đang đỗ so với ghi nhận ban đầu. Hệ thống sẽ cập nhật vị trí.",
};

export default function ExceptionDescriptionStep({
  session,
  exceptionType,
  description,
  surcharge,
  onDescriptionChange,
  onSurchargeChange,
}: ExceptionDescriptionStepProps) {
  const isLostCard = exceptionType === ExceptionType.LOST_CARD;
  const [surchargeStr, setSurchargeStr] = useState<string>(
    isLostCard ? (surcharge || DEFAULT_SURCHARGE_LOST_CARD).toLocaleString("vi-VN") : "0"
  );

  const handleSurchargeChange = (raw: string) => {
    // Remove non-digits
    const digits = raw.replace(/\D/g, "");
    setSurchargeStr(digits ? Number(digits).toLocaleString("vi-VN") : "");
    onSurchargeChange(Number(digits) || 0);
  };

  const descLength = description.trim().length;
  const isDescValid = descLength >= 20;

  return (
    <div className="space-y-5">
      {/* Summary header */}
      <div className="bg-gray-50 border border-[#e8e9e8] rounded-[10px] p-4 space-y-1.5">
        <div className="flex justify-between text-[13px]">
          <span className="text-[#6b6b6b]">Biển số</span>
          <span className="font-mono font-bold text-[#060606]">{session.licensePlate}</span>
        </div>
        <div className="flex justify-between text-[13px]">
          <span className="text-[#6b6b6b]">Tầng / Slot</span>
          <span className="font-medium">{session.floorName} · {session.slotCode}</span>
        </div>
        <div className="flex justify-between text-[13px]">
          <span className="text-[#6b6b6b]">Loại ngoại lệ</span>
          <span className="font-semibold text-[#060606]">
            {EXCEPTION_TYPE_LABELS[exceptionType] || exceptionType}
          </span>
        </div>
      </div>

      {/* Hint */}
      {TYPE_HINTS[exceptionType] && (
        <div className="flex items-start gap-2 p-3 rounded-[8px] bg-[#fffbe6] border border-[#ffe580]">
          <AlertTriangle className="w-4 h-4 text-[#c77700] shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#7a5800]">{TYPE_HINTS[exceptionType]}</p>
        </div>
      )}

      {/* Description textarea */}
      <div>
        <label className="block text-[12px] font-semibold text-[#060606] mb-2 uppercase tracking-wider">
          Mô tả sự việc <span className="text-red-500">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Mô tả chi tiết tình huống ngoại lệ (tối thiểu 20 ký tự)..."
          rows={4}
          className={`w-full px-4 py-3 border rounded-[10px] text-[13px] text-[#060606] resize-none focus:outline-none transition-colors ${
            description && !isDescValid
              ? "border-red-400 focus:border-red-500"
              : "border-[#e8e9e8] focus:border-[#060606]"
          }`}
        />
        <div className="flex justify-between mt-1">
          {description && !isDescValid ? (
            <p className="text-[11px] text-red-500">Cần ít nhất 20 ký tự</p>
          ) : (
            <span />
          )}
          <p className={`text-[11px] ml-auto ${isDescValid ? "text-[#1d7a4a]" : "text-[#6b6b6b]"}`}>
            {descLength} / 20+ ký tự
          </p>
        </div>
      </div>

      {/* Surcharge field — only for lost_card */}
      {isLostCard && (
        <div>
          <label className="block text-[12px] font-semibold text-[#060606] mb-2 uppercase tracking-wider">
            Phụ phí mất thẻ (₫)
          </label>
          <div className="relative">
            <input
              type="text"
              value={surchargeStr}
              onChange={(e) => handleSurchargeChange(e.target.value)}
              className="w-full h-11 px-4 border border-[#e8e9e8] rounded-[10px] text-[14px] font-semibold text-[#060606] focus:outline-none focus:border-[#060606]"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-[#6b6b6b]">₫</span>
          </div>
          <p className="text-[11px] text-[#6b6b6b] mt-1">
            Mặc định {DEFAULT_SURCHARGE_LOST_CARD.toLocaleString("vi-VN")}₫ — có thể điều chỉnh theo quy định bãi.
          </p>
        </div>
      )}
    </div>
  );
}
