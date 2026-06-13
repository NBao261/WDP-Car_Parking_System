import React, { useState } from 'react';
import { ChevronDown, X, LayoutGrid, List } from 'lucide-react';
import { Facility } from '../../../../services/facility.service';

const inputBase: React.CSSProperties = {
  height: 40, background: '#ffffff',
  border: '1.5px solid #e2e3e2', borderRadius: 10,
  fontSize: 14, outline: 'none', cursor: 'pointer',
};

function DropFilter({ value, onChange, options, width = 180 }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
  width?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const active = value !== 'all';

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div className="relative" style={{ width, flexShrink: 0 }} ref={dropdownRef}>
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
          position: 'absolute', right: 12, top: '50%', transform: `translateY(-50%) ${isOpen ? 'rotate(180deg)' : ''}`,
          color: '#6b6e6b', pointerEvents: 'none',
          transition: 'transform 0.2s ease'
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
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          <style>
            {`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-4px); }
                to { opacity: 1; transform: translateY(0); }
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
                transition: 'background 0.15s ease, color 0.15s ease'
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

interface PricingFilterBarProps {
  filterStatus: 'all' | 'active' | 'inactive';
  setFilterStatus: (v: 'all' | 'active' | 'inactive') => void;
  filterFacility: string;
  setFilterFacility: (v: string) => void;
  facilities: Facility[];
  hideFacilityFilter?: boolean;
}

export function PricingFilterBar({
  filterStatus, setFilterStatus,
  filterFacility, setFilterFacility,
  facilities, hideFacilityFilter
}: PricingFilterBarProps) {
  const hasActiveFilters = filterStatus !== 'all' || (!hideFacilityFilter && filterFacility !== 'all');

  const clearFilters = () => {
    setFilterStatus('all');
    setFilterFacility('all');
  };

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-4 border-b border-gray-100 pb-4">
      <DropFilter
        value={filterStatus}
        onChange={(v) => setFilterStatus(v as any)}
        options={[
          { value: 'all', label: 'Tất cả trạng thái' },
          { value: 'active', label: 'Hoạt động' },
          { value: 'inactive', label: 'Đã tắt' },
        ]}
      />

      {!hideFacilityFilter && (
        <DropFilter
          width={220}
          value={filterFacility}
          onChange={setFilterFacility}
          options={[
            { value: 'all', label: 'Tất cả cơ sở' },
            ...facilities.map(f => ({ value: f._id, label: f.name }))
          ]}
        />
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
          onMouseEnter={e => e.currentTarget.style.background = '#fce4e4'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff1f1'}
        >
          <X size={15} />
          Bỏ lọc
        </button>
      )}

    </div>
  );
}
