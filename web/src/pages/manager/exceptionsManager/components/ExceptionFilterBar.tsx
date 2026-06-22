import { Search, ChevronDown, Check } from 'lucide-react';
import { ExceptionStatus, ExceptionType, EXCEPTION_STATUS_LABELS, EXCEPTION_TYPE_LABELS } from '../../../../services/exception.service';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── DropFilter Component ───
function DropFilter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find((opt) => opt.value === value)?.label || label;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 px-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 flex items-center justify-between hover:border-gray-300 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      >
        <span className="truncate pr-2 font-medium">{selectedLabel}</span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50 py-1"
          >
            <div className="max-h-60 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
              {options.map((opt) => {
                const isSelected = value === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between group
                      ${isSelected ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <span className="truncate pr-2">{opt.label}</span>
                    {isSelected && <Check size={16} className="text-emerald-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Filter Bar Component ───
interface ExceptionFilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: ExceptionStatus | 'all';
  setFilterStatus: (status: ExceptionStatus | 'all') => void;
  filterType: ExceptionType | 'all';
  setFilterType: (type: ExceptionType | 'all') => void;
}

export function ExceptionFilterBar({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
}: ExceptionFilterBarProps) {
  
  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    ...Object.values(ExceptionStatus).map(status => ({
      value: status,
      label: EXCEPTION_STATUS_LABELS[status]
    }))
  ];

  const typeOptions = [
    { value: 'all', label: 'Tất cả loại ngoại lệ' },
    ...Object.values(ExceptionType).map(type => ({
      value: type,
      label: EXCEPTION_TYPE_LABELS[type]
    }))
  ];

  return (
    <div className="mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-200 flex flex-wrap items-center gap-4">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[250px]">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm theo mã lượt gửi..."
          className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow"
        />
      </div>

      {/* Type Filter */}
      <div className="w-full sm:w-[200px]">
        <DropFilter
          label="Loại ngoại lệ"
          value={filterType}
          onChange={(v) => setFilterType(v as ExceptionType | 'all')}
          options={typeOptions}
        />
      </div>

      {/* Status Filter */}
      <div className="w-full sm:w-[200px]">
        <DropFilter
          label="Trạng thái"
          value={filterStatus}
          onChange={(v) => setFilterStatus(v as ExceptionStatus | 'all')}
          options={statusOptions}
        />
      </div>
    </div>
  );
}
