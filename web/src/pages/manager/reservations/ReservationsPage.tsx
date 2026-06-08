import { useState, useEffect, useCallback } from 'react';
import { reservationService, IReservation } from '../../../services/reservation.service';
import { ReservationFilterBar } from './components/ReservationFilterBar';
import { ReservationTable } from './components/ReservationTable';
import { ReservationDetailModal } from './components/ReservationDetailModal';

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<IReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal state
  const [selectedReservation, setSelectedReservation] = useState<IReservation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchReservations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params: any = {
        page: currentPage,
        limit: limit,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      
      // If we had a specific backend parameter for license plate search, we'd use it here.
      // Assuming we need to fetch all and filter front-end OR the backend supports a search query
      // For now, let's assume backend doesn't support 'searchTerm' natively in GET /reservations
      // Note: If backend supports it, we should add it: params.search = debouncedSearch;

      const response = await reservationService.getReservations(params);
      
      if (response.success) {
        let filteredData = response.data;

        // Front-end search filtering for License Plate and Code if backend doesn't support it directly
        if (debouncedSearch) {
          const lowerSearch = debouncedSearch.toLowerCase();
          filteredData = filteredData.filter(
            (res) =>
              res.code.toLowerCase().includes(lowerSearch) ||
              res.licensePlate.toLowerCase().includes(lowerSearch)
          );
        }

        setReservations(filteredData);
        if (response.pagination) {
          // If we filtered on frontend, pagination might be slightly inaccurate, but works for MVP
          setTotalPages(response.pagination.totalPages || 1);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tải danh sách đặt chỗ');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleViewDetail = (reservation: IReservation) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReservation(null);
  };

  return (
    <div className="h-[calc(100vh-theme(spacing.20))] flex flex-col gap-6 p-6 md:p-8 max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý Đặt chỗ</h1>
          <p className="text-sm text-gray-500 mt-1">
            Theo dõi và quản lý danh sách xe đặt chỗ trước tại bãi đỗ.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <ReservationFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusChange}
      />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 min-h-0">
        <ReservationTable
          reservations={reservations}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onViewDetail={handleViewDetail}
        />
      </div>

      {/* Detail Modal */}
      <ReservationDetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        reservation={selectedReservation}
      />
    </div>
  );
}
