import { ExceptionType } from "../../../../services/exception.service";
import { SelectedSessionInfo } from "./SessionLookupStep";

interface ExceptionTypeStepProps {
  session: SelectedSessionInfo;
  selectedType: ExceptionType | null;
  onSelectType: (type: ExceptionType) => void;
}

interface TypeCard {
  type: ExceptionType;
  icon: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
}

const TYPE_CARDS: TypeCard[] = [
  {
    type: ExceptionType.LOST_CARD,
    icon: "🎫",
    title: "Mất vé / Mất thẻ",
    subtitle: "Xe vào không còn thẻ từ. Áp dụng phụ phí mất thẻ.",
    badge: "Có phụ phí",
    badgeColor: "bg-[#fff3e0] text-[#c77700]",
  },
  {
    type: ExceptionType.WRONG_PLATE,
    icon: "🚗",
    title: "Sai biển số",
    subtitle: "Biển số ghi nhận lúc vào không khớp với xe thực tế.",
    badge: "Cần Manager duyệt",
    badgeColor: "bg-[#e3ecf8] text-[#1a5fa8]",
  },
  {
    type: ExceptionType.OVERTIME,
    icon: "⏰",
    title: "Xe quá giờ",
    subtitle: "Xe ở lại quá thời gian cho phép hoặc quá đêm.",
    badge: "Ghi nhận tình huống",
    badgeColor: "bg-[#fde8e8] text-[#b03030]",
  },
  {
    type: ExceptionType.WRONG_ZONE,
    icon: "📍",
    title: "Sai khu vực đỗ",
    subtitle: "Xe đang đỗ không đúng tầng / khu vực được ghi nhận.",
    badge: "Cập nhật vị trí",
    badgeColor: "bg-[#e8f7f0] text-[#1d7a4a]",
  },
];

export default function ExceptionTypeStep({
  session,
  selectedType,
  onSelectType,
}: ExceptionTypeStepProps) {
  return (
    <div className="space-y-4">
      {/* Selected session summary */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 border border-[#e8e9e8] rounded-[10px]">
        <div className="w-8 h-8 rounded-full bg-[#d7ee46] flex items-center justify-center text-base shrink-0">
          🚙
        </div>
        <div className="min-w-0">
          <p className="font-mono font-bold text-[15px] text-[#060606] truncate">
            {session.licensePlate}
          </p>
          <p className="text-[11px] text-[#6b6b6b]">
            {session.floorName} · {session.slotCode} · Vào: {session.checkInTime}
          </p>
        </div>
      </div>

      <p className="text-[13px] text-[#6b6b6b]">Chọn loại ngoại lệ cần báo cáo:</p>

      {/* Type cards grid */}
      <div className="grid grid-cols-1 gap-3">
        {TYPE_CARDS.map((card) => {
          const isSelected = selectedType === card.type;
          return (
            <button
              key={card.type}
              onClick={() => onSelectType(card.type)}
              className={`flex items-start gap-4 p-4 rounded-[12px] border-2 text-left transition-all ${
                isSelected
                  ? "border-[#060606] bg-[#f5f5f5]"
                  : "border-[#e8e9e8] bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <span className="text-2xl shrink-0 mt-0.5">{card.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-[14px] text-[#060606]">{card.title}</span>
                  {card.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${card.badgeColor}`}
                    >
                      {card.badge}
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-[#6b6b6b] mt-1">{card.subtitle}</p>
              </div>
              {/* Selection indicator */}
              <div
                className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                  isSelected
                    ? "border-[#060606] bg-[#060606]"
                    : "border-[#e8e9e8] bg-white"
                }`}
              >
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
