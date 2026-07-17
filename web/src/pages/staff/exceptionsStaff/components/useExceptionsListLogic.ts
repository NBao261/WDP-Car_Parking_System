import { useState, useEffect } from "react";

export function useExceptionsListLogic({ exceptionsList, searchQuery, filterStatus, onSearchChange, onFilterChange }: any) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  const [filterType, setFilterType] = useState('All');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterStatus, filterType, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (!current || current.key !== key) return { key, direction: 'asc' };
      if (current.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
  };

  const hasActiveFilters = searchQuery !== '' || filterStatus !== 'ALL' || filterType !== 'All' || sortConfig !== null;

  const handleResetFilters = () => {
    onSearchChange(''); onFilterChange('ALL'); setFilterType('All'); setSortConfig(null); setCurrentPage(1);
  };

  const uniqueTypes = Array.from(new Set(exceptionsList.map((e:any) => e.type).filter(Boolean)));

  const filteredAndSortedList = exceptionsList
    .filter((e:any) => filterType === 'All' || e.type === filterType)
    .sort((a:any, b:any) => {
      if (!sortConfig) return 0;
      const modifier = sortConfig.direction === 'asc' ? 1 : -1;
      switch (sortConfig.key) {
        case 'cardCode': return modifier * (a.cardCode || a.code).localeCompare(b.cardCode || b.code);
        case 'plate': return modifier * a.plate.localeCompare(b.plate);
        case 'time': return modifier * a.time.localeCompare(b.time);
        case 'surcharge': return modifier * (a.surcharge - b.surcharge);
        default: return 0;
      }
    });

  return {
    currentPage, setCurrentPage, itemsPerPage, filterType, setFilterType, sortConfig, setSortConfig,
    handleSort, hasActiveFilters, handleResetFilters, uniqueTypes, filteredAndSortedList
  };
}
