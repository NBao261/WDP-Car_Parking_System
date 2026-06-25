import { useState, useEffect } from 'react';
import { reservationService, Reservation } from '../../../../services/reservation.service';
import { toast } from 'sonner';

export function useHistory() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedIdToCancel, setSelectedIdToCancel] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchReservations = async () => {
    try {
      const res = await reservationService.getMyReservations();
      setReservations(res.data);
    } catch (error) {
      toast.error('Không thể tải lịch sử');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const requestCancel = (id: string) => {
    setSelectedIdToCancel(id);
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!selectedIdToCancel) return;
    setIsCancelling(true);
    try {
      await reservationService.cancel(selectedIdToCancel);
      toast.success('Hủy đặt chỗ thành công');
      fetchReservations();
      setCancelModalOpen(false);
      setSelectedIdToCancel(null);
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi hủy đặt chỗ');
    } finally {
      setIsCancelling(false);
    }
  };

  const closeCancelModal = () => {
    setCancelModalOpen(false);
    setSelectedIdToCancel(null);
  };

  return {
    reservations,
    loading,
    requestCancel,
    confirmCancel,
    cancelModalOpen,
    closeCancelModal,
    isCancelling,
  };
}
