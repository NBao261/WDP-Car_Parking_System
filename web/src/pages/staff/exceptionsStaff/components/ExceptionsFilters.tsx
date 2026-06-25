import { ChevronDown, ChevronUp } from "lucide-react";

export const SortButton = ({ label, sortKey, currentSort, onSort }: { label: string, sortKey: string, currentSort: any, onSort: any }) => {
  const isActive = currentSort?.key === sortKey;
  return (
    <button 
      onClick={() => onSort(sortKey)}
      className={`flex items-center justify-between w-full px-3 py-1.5 border rounded-full text-[11px] font-bold transition-colors ${isActive ? 'border-[#9FE870] bg-[#f5ffe8] text-[#060606]' : 'border-gray-100 bg-white text-gray-600 hover:bg-gray-50'}`}
    >
      <span>{label}</span>
      {isActive && currentSort.direction === 'desc' ? <ChevronUp className="w-3.5 h-3.5 ml-1 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 ml-1 text-gray-400" />}
    </button>
  );
};

export const FilterDropdown = ({ label, options, value, onChange }: { label: string, options: { value: string, label: string }[], value: string, onChange: (val: string) => void }) => {
  return (
    <div className="relative w-full">
      <select 
        value={value} onChange={(e) => onChange(e.target.value)}
        className={`appearance-none w-full pl-3 pr-8 py-1.5 border rounded-full text-[11px] font-bold transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-[#9FE870]/50 ${value !== 'All' ? 'border-[#9FE870] bg-[#f5ffe8] text-[#060606]' : 'border-gray-100 bg-white text-gray-600 hover:bg-gray-50'}`}
      >
        <option value="All">{label}</option>
        {options.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
};
