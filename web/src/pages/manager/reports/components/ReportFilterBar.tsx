import { ChevronDown } from 'lucide-react';
import { ReportGroupBy } from '../../../../services/report.service';
import { FacilitySelector } from '../../components/FacilitySelector';
import { DateRangePicker, DateRange } from '../../components/DateRangePicker';

interface ReportFilterBarProps {
  facilityId: string;
  onFacilityChange: (id: string) => void;
  groupBy: ReportGroupBy;
  onGroupByChange: (g: ReportGroupBy) => void;
  dateRange: DateRange;
  onDateRangeChange: (r: DateRange) => void;
}

/**
 * ReportFilterBar — Shared filter bar cho Revenue và Traffic report pages.
 */
export function ReportFilterBar({
  facilityId,
  onFacilityChange,
  groupBy,
  onGroupByChange,
  dateRange,
  onDateRangeChange,
}: ReportFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <FacilitySelector
        value={facilityId}
        onChange={onFacilityChange}
        placeholder="Tất cả bãi xe"
        className="w-52"
      />

      <div className="relative">
        <select
          value={groupBy}
          onChange={(e) => onGroupByChange(e.target.value as ReportGroupBy)}
          className="appearance-none pl-3 pr-8 h-[38px] border border-[#e8e9e8] rounded-lg bg-white text-[13px] text-[#060606] font-medium outline-none cursor-pointer focus:border-[#d7ee46]"
        >
          <option value="day">Theo ngày</option>
          <option value="week">Theo tuần</option>
          <option value="month">Theo tháng</option>
        </select>
        <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6b6b6b] pointer-events-none" />
      </div>

      <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
    </div>
  );
}
