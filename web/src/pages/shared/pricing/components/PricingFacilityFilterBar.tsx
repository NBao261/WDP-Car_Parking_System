import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, LayoutGrid, List, X } from 'lucide-react';

interface PricingFacilityFilterBarProps {
  search: string;
  setSearch: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  viewMode?: 'grid' | 'list';
  setViewMode?: (val: 'grid' | 'list') => void;
  hideViewMode?: boolean;
  sortOptions?: { value: string; label: string }[];
  sortValue?: string;
  onSortChange?: (val: string) => void;
}

const inputBase: React.CSSProperties = {
  height: 40,
  background: '#ffffff',
  border: '1.5px solid #e2e3e2',
  borderRadius: 10,
  fontSize: 14,
  outline: 'none',
  cursor: 'pointer',
};

function DropFilter({
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
  const active = value !== 'all' && value !== 'default' && value !== 'none';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div className="relative" style={{ width: 180, flexShrink: 0 }} ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...inputBase,
          display: 'flex',
          alignItems: 'center',
          padding: '0 32px 0 14px',
          border: isOpen || active ? '1.5px solid #cce242' : '1.5px solid #e2e3e2',
          boxShadow: isOpen ? '0 0 0 3px rgba(204,226,66,0.2)' : 'none',
          color: active ? '#060606' : '#6b6e6b',
          fontWeight: active ? 600 : 400,
          transition: 'all 0.2s ease',
          userSelect: 'none',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption?.label}
        </span>
      </div>

      <ChevronDown
        size={15}
        style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: `translateY(-50%) ${isOpen ? 'rotate(180deg)' : ''}`,
          color: '#6b6e6b',
          pointerEvents: 'none',
          transition: 'transform 0.2s ease',
        }}
      />

      {isOpen && (
        <div
          className="custom-scrollbar"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: '#ffffff',
            border: '1px solid #e2e3e2',
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            zIndex: 50,
            overflowY: 'auto',
            overflowX: 'hidden',
            maxHeight: 280,
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <style>
            {`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-4px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
                margin: 4px 0;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #e2e3e2;
                border-radius: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #c0c0c0;
              }
            `}
          </style>
          {options.map((o) => (
            <div
              key={o.value}
              onClick={() => {
                onChange(o.value);
                setIsOpen(false);
              }}
              style={{
                padding: '10px 14px',
                fontSize: 14,
                cursor: 'pointer',
                color: value === o.value ? '#060606' : '#4a4a4a',
                background: value === o.value ? '#f8fce2' : '#ffffff',
                fontWeight: value === o.value ? 500 : 400,
                display: 'flex',
                alignItems: 'center',
                transition: 'background 0.15s ease, color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (value !== o.value) {
                  e.currentTarget.style.background = '#f5f5f5';
                }
              }}
              onMouseLeave={(e) => {
                if (value !== o.value) {
                  e.currentTarget.style.background = '#ffffff';
                }
              }}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PricingFacilityFilterBar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  viewMode,
  setViewMode,
  hideViewMode = false,
  sortOptions,
  sortValue,
  onSortChange,
}: PricingFacilityFilterBarProps) {
  const hasActiveFilters =
    search !== '' ||
    statusFilter !== 'all' ||
    (sortValue &&
      sortValue !== 'none' &&
      sortValue !== 'default' &&
      sortValue !== 'createdAt_desc');

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    if (onSortChange && sortOptions) {
      onSortChange(sortOptions[0].value);
    }
  };

  return (
    <div
      className="mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-3"
      style={{ minHeight: 48 }}
    >
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm tòa nhà, địa chỉ..."
          className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:border-transparent transition-all"
        />
      </div>

      {/* Dropdowns */}
      <DropFilter
        label="Trạng thái"
        value={statusFilter}
        onChange={setStatusFilter}
        options={[
          { value: 'all', label: 'Tất cả trạng thái' },
          { value: 'active', label: 'Hoạt động' },
          { value: 'inactive', label: 'Đã vô hiệu hóa' },
        ]}
      />

      {sortOptions && sortValue !== undefined && onSortChange && (
        <>
          <div className="h-6 w-px bg-gray-200 hidden xl:block mx-1" />
          <span className="text-sm text-gray-500 font-medium shrink-0">Sắp xếp:</span>
          <DropFilter
            label="Sắp xếp"
            value={sortValue}
            onChange={onSortChange}
            options={sortOptions}
          />
        </>
      )}

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          style={{
            height: 40,
            padding: '0 16px',
            borderRadius: 10,
            border: 'none',
            background: '#fff1f1',
            color: '#d32f2f',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#fce4e4')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#fff1f1')}
        >
          <X size={15} />
          Bỏ lọc
        </button>
      )}

      {/* View toggle */}
      {!hideViewMode && viewMode && setViewMode && (
        <div className="flex gap-1 shrink-0 ml-auto">
          {(['grid', 'list'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === mode ? '#000000' : '#f0f1f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s',
              }}
            >
              {mode === 'grid' ? (
                <LayoutGrid
                  size={16}
                  style={{ color: viewMode === 'grid' ? '#ffffff' : '#6b6e6b' }}
                />
              ) : (
                <List size={16} style={{ color: viewMode === 'list' ? '#ffffff' : '#6b6e6b' }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
