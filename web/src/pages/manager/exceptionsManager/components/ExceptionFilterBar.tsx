import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, ArrowUpDown, X } from 'lucide-react';
import { ExceptionStatus, ExceptionType, EXCEPTION_STATUS_LABELS, EXCEPTION_TYPE_LABELS } from '../../../../services/exception.service';

const inputBase: React.CSSProperties = {
  height: 40,
  background: '#ffffff',
  border: '1.5px solid #e2e3e2',
  borderRadius: 10,
  fontSize: 14,
  outline: 'none',
  cursor: 'pointer',
};

// ─── DropFilter Component ───
function DropFilter({
  label,
  value,
  onChange,
  options,
  width = 200,
  icon: Icon
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  width?: number | string;
  icon?: React.ElementType;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const active = value !== 'all' && value !== 'none';

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
    <div className="relative" style={{ width, flexShrink: 0 }} ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...inputBase,
          display: 'flex',
          alignItems: 'center',
          padding: Icon ? '0 32px 0 32px' : '0 32px 0 14px',
          border: isOpen || active ? '1.5px solid #cce242' : '1.5px solid #e2e3e2',
          boxShadow: isOpen ? '0 0 0 3px rgba(204,226,66,0.2)' : 'none',
          color: active ? '#060606' : '#6b6e6b',
          fontWeight: active ? 600 : 400,
          transition: 'all 0.2s ease',
          userSelect: 'none',
        }}
      >
        {Icon && (
          <Icon size={14} style={{ position: 'absolute', left: 12, color: '#9ca3af' }} />
        )}
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
                justifyContent: 'space-between',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (value !== o.value) {
                  e.currentTarget.style.background = '#fafafa';
                }
              }}
              onMouseLeave={(e) => {
                if (value !== o.value) {
                  e.currentTarget.style.background = '#ffffff';
                }
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {o.label}
              </span>
              {value === o.value && (
                <Check size={16} color="#10b981" style={{ flexShrink: 0, marginLeft: 8 }} />
              )}
            </div>
          ))}
        </div>
      )}
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
  sortValue?: string;
  setSortValue?: (val: string) => void;
}

export function ExceptionFilterBar({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
  sortValue = 'createdAt_desc',
  setSortValue,
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

  const sortOptions = [
    { value: 'createdAt_desc', label: 'Ngày tạo (Mới nhất)' },
    { value: 'createdAt_asc', label: 'Ngày tạo (Cũ nhất)' },
    { value: 'sessionId_asc', label: 'Mã lượt gửi (A-Z)' },
    { value: 'sessionId_desc', label: 'Mã lượt gửi (Z-A)' },
    { value: 'licensePlate_asc', label: 'Xe (A-Z)' },
    { value: 'licensePlate_desc', label: 'Xe (Z-A)' },
    { value: 'staffId_asc', label: 'Người tạo (A-Z)' },
    { value: 'staffId_desc', label: 'Người tạo (Z-A)' },
  ];

  const [sortField, sortDir] = (sortValue || 'createdAt_desc').split('_');

  return (
    <div style={{
      marginBottom: 24,
      background: '#ffffff',
      padding: '16px',
      borderRadius: 16,
      border: '1px solid #f0f1f0',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}>
      {/* Top Row: Search and Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, width: '100%' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 300px', minWidth: 200 }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9b9e9b',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã lượt gửi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              ...inputBase,
              width: '100%',
              padding: '0 16px 0 38px',
              color: '#060606',
              transition: 'all 0.2s ease',
              cursor: 'text'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#cce242';
              e.target.style.boxShadow = '0 0 0 3px rgba(204,226,66,0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e3e2';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {/* Type Filter */}
          <div className="relative w-auto sm:w-48 shrink-0">
            <DropFilter
              width="100%"
              label="Loại ngoại lệ"
              value={filterType}
              onChange={(v) => setFilterType(v as ExceptionType | 'all')}
              options={typeOptions}
            />
          </div>

          {/* Status Filter */}
          <div className="relative w-auto sm:w-48 shrink-0">
            <DropFilter
              width="100%"
              label="Trạng thái"
              value={filterStatus}
              onChange={(v) => setFilterStatus(v as ExceptionStatus | 'all')}
              options={statusOptions}
            />
          </div>
        </div>
      </div>

      {/* Bottom Row: Sorting and Clear Filters */}
      {setSortValue && (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, width: '100%' }}>
          <span className="text-sm text-gray-500 font-medium shrink-0">Sắp xếp:</span>

          {/* Sort: Ngày tạo */}
          <div className="relative w-auto sm:w-36 shrink-0">
            <DropFilter
              width="100%"
              label="Ngày tạo"
              value={sortField === 'createdAt' ? sortDir : 'none'}
              onChange={(v) => {
                if (v === 'none') setSortValue('createdAt_desc');
                else setSortValue(`createdAt_${v}`);
              }}
              icon={ArrowUpDown}
              options={[
                { value: 'none', label: 'Ngày tạo' },
                { value: 'desc', label: 'Mới nhất' },
                { value: 'asc', label: 'Cũ nhất' },
              ]}
            />
          </div>

          {/* Sort: Mã lượt gửi */}
          <div className="relative w-auto sm:w-40 shrink-0">
            <DropFilter
              width="100%"
              label="Mã lượt gửi"
              value={sortField === 'sessionId' ? sortDir : 'none'}
              onChange={(v) => {
                if (v === 'none') setSortValue('createdAt_desc');
                else setSortValue(`sessionId_${v}`);
              }}
              icon={ArrowUpDown}
              options={[
                { value: 'none', label: 'Mã lượt gửi' },
                { value: 'asc', label: 'Mã (A-Z)' },
                { value: 'desc', label: 'Mã (Z-A)' },
              ]}
            />
          </div>

          {/* Sort: Xe */}
          <div className="relative w-auto sm:w-32 shrink-0">
            <DropFilter
              width="100%"
              label="Xe"
              value={sortField === 'licensePlate' ? sortDir : 'none'}
              onChange={(v) => {
                if (v === 'none') setSortValue('createdAt_desc');
                else setSortValue(`licensePlate_${v}`);
              }}
              icon={ArrowUpDown}
              options={[
                { value: 'none', label: 'Xe' },
                { value: 'asc', label: 'Xe (A-Z)' },
                { value: 'desc', label: 'Xe (Z-A)' },
              ]}
            />
          </div>

          {/* Sort: Người tạo */}
          <div className="relative w-auto sm:w-40 shrink-0">
            <DropFilter
              width="100%"
              label="Người tạo"
              value={sortField === 'staffId' ? sortDir : 'none'}
              onChange={(v) => {
                if (v === 'none') setSortValue('createdAt_desc');
                else setSortValue(`staffId_${v}`);
              }}
              icon={ArrowUpDown}
              options={[
                { value: 'none', label: 'Người tạo' },
                { value: 'asc', label: 'Tên (A-Z)' },
                { value: 'desc', label: 'Tên (Z-A)' },
              ]}
            />
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || filterType !== 'all' || filterStatus !== 'all' || sortValue !== 'createdAt_desc') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterStatus('all');
                if (setSortValue) setSortValue('createdAt_desc');
              }}
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
              className="shrink-0"
            >
              <X size={15} />
              Bỏ lọc
            </button>
          )}
        </div>
      )}
    </div>
  );
}
