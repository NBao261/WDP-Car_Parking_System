import { Calendar } from 'lucide-react';

export interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

// Preset ranges
const PRESETS = [
  { label: '7 ngày', days: 7 },
  { label: '30 ngày', days: 30 },
  { label: '90 ngày', days: 90 },
];

function toISODate(d: Date) {
  return d.toISOString().split('T')[0];
}

/**
 * DateRangePicker — Chọn khoảng thời gian cho report filters.
 * Có preset nhanh (7/30/90 ngày) và input thủ công.
 */
export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const applyPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days + 1);
    onChange({ startDate: toISODate(start), endDate: toISODate(end) });
  };

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className ?? ''}`}>
      {/* Preset buttons */}
      {PRESETS.map((p) => (
        <button
          key={p.days}
          type="button"
          onClick={() => applyPreset(p.days)}
          className="h-[38px] px-3 text-[13px] font-medium border border-[#e8e9e8] bg-white rounded-lg hover:border-[#d7ee46] hover:bg-[#d7ee46]/10 transition-all"
        >
          {p.label}
        </button>
      ))}

      {/* Custom inputs */}
      <div className="flex items-center gap-1.5">
        <Calendar size={14} className="text-[#a0a0a0] shrink-0" />
        <input
          type="date"
          value={value.startDate}
          onChange={(e) => onChange({ ...value, startDate: e.target.value })}
          className="h-[38px] px-3 border border-[#e8e9e8] rounded-lg bg-white text-[13px] outline-none focus:border-[#d7ee46] focus:ring-2 focus:ring-[#d7ee46]/30 transition-all"
        />
        <span className="text-[#a0a0a0] text-[13px]">→</span>
        <input
          type="date"
          value={value.endDate}
          onChange={(e) => onChange({ ...value, endDate: e.target.value })}
          className="h-[38px] px-3 border border-[#e8e9e8] rounded-lg bg-white text-[13px] outline-none focus:border-[#d7ee46] focus:ring-2 focus:ring-[#d7ee46]/30 transition-all"
        />
      </div>
    </div>
  );
}
