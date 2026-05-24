import React from 'react';
import { Search, ChevronDown, LayoutGrid, List } from 'lucide-react';
import { VehicleType } from '../../../../services/vehicleType.service';

interface FacilityFilterBarProps {
  search: string;
  setSearch: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  vehicleFilter: string;
  setVehicleFilter: (val: string) => void;
  vehicleTypes: VehicleType[];
  viewMode: 'grid' | 'list';
  setViewMode: (val: 'grid' | 'list') => void;
}

const inputBase: React.CSSProperties = {
  height: 40, background: '#ffffff',
  border: '1.5px solid #e2e3e2', borderRadius: 10,
  fontSize: 14, outline: 'none', cursor: 'pointer',
};

function DropFilter({ value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const active = value !== 'all';
  return (
    <div className="relative" style={{ width: 160, flexShrink: 0 }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={e => { e.target.style.border = '1.5px solid #cce242'; e.target.style.boxShadow = '0 0 0 3px rgba(204,226,66,0.2)'; }}
        onBlur={e => { e.target.style.border = active ? '1.5px solid #cce242' : '1.5px solid #e2e3e2'; e.target.style.boxShadow = 'none'; }}
        style={{
          ...inputBase, width: '100%',
          padding: active ? '0 32px 0 24px' : '0 32px 0 14px',
          appearance: 'none',
          border: active ? '1.5px solid #cce242' : '1.5px solid #e2e3e2',
          color: active ? '#060606' : '#6b6e6b',
          fontWeight: active ? 600 : 400,
          transition: 'all 0.2s ease',
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {active && (
        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 6, height: 6, borderRadius: '50%', background: '#cce242' }} />
      )}
      <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#6b6e6b', pointerEvents: 'none' }} />
    </div>
  );
}

export function FacilityFilterBar({
  search, setSearch,
  statusFilter, setStatusFilter,
  vehicleFilter, setVehicleFilter,
  vehicleTypes,
  viewMode, setViewMode
}: FacilityFilterBarProps) {
  return (
    <div className="mb-5">
      <div className="flex flex-wrap items-center gap-3" style={{ minHeight: 48 }}>
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6b6e6b' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm tòa nhà, địa chỉ..."
            style={{ ...inputBase, width: '100%', boxSizing: 'border-box', paddingLeft: 40, paddingRight: 16, cursor: 'text', transition: 'all 0.2s ease' }}
            onFocus={e => { e.target.style.border = '1.5px solid #cce242'; e.target.style.boxShadow = '0 0 0 3px rgba(204,226,66,0.2)'; }}
            onBlur={e => { e.target.style.border = '1.5px solid #e2e3e2'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Dropdowns */}
        <DropFilter
          label="Trạng thái" value={statusFilter} onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'Tất cả trạng thái' },
            { value: 'active', label: 'Hoạt động' },
            { value: 'inactive', label: 'Đã tắt' },
          ]}
        />
        <DropFilter
          label="Loại xe" value={vehicleFilter} onChange={setVehicleFilter}
          options={[
            { value: 'all', label: 'Tất cả loại xe' },
            ...vehicleTypes.map(v => ({ value: v._id, label: v.name }))
          ]}
        />

        {/* View toggle */}
        <div className="flex gap-1 shrink-0">
          {(['grid', 'list'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                width: 40, height: 40, borderRadius: 10, border: 'none', cursor: 'pointer',
                background: viewMode === mode ? '#d7ee46' : '#f0f1f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
            >
              {mode === 'grid'
                ? <LayoutGrid size={16} style={{ color: viewMode === 'grid' ? '#060606' : '#6b6e6b' }} />
                : <List size={16} style={{ color: viewMode === 'list' ? '#060606' : '#6b6e6b' }} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
