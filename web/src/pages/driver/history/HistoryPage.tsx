import React from 'react';
import { useHistory } from './hooks/useHistory';
import { BoardingPassTicket } from './components/BoardingPassTicket';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const HistorySkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col h-[200px]">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-6 w-24 rounded-md" />
        </div>
        <div className="space-y-4 mb-6 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    ))}
  </div>
);

const EmptyStateIllustration = () => (
  <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-6">
    {/* Background Circle */}
    <circle cx="80" cy="80" r="80" fill="#F8FAFC" />
    {/* Dashed Border */}
    <circle cx="80" cy="80" r="70" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="8 8" />
    {/* Car shape */}
    <path d="M107.5 90H52.5C49.7386 90 47.5 87.7614 47.5 85V75L55 60H105L112.5 75V85C112.5 87.7614 110.261 90 107.5 90Z" fill="#CBD5E1"/>
    <path d="M55 60H105L112.5 75H47.5L55 60Z" fill="#94A3B8"/>
    {/* Wheels */}
    <circle cx="60" cy="90" r="8" fill="#64748B"/>
    <circle cx="100" cy="90" r="8" fill="#64748B"/>
    {/* Ticket slot */}
    <rect x="70" y="45" width="20" height="15" rx="2" fill="#38BDF8"/>
    {/* Search icon / magnifying glass */}
    <circle cx="95" cy="55" r="12" fill="white" stroke="#CBD5E1" strokeWidth="3"/>
    <path d="M105 65L115 75" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();

  const { 
    reservations, 
    loading, 
    requestCancel,
    confirmCancel,
    cancelModalOpen,
    closeCancelModal,
    isCancelling
  } = useHistory();

  if (loading) {
    return (
      <div className="w-full h-full pb-20">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-brand mb-2 font-outfit">Lịch Sử Của Bạn</h1>
          <p className="text-muted-foreground">Đang tải lịch sử đặt chỗ...</p>
        </div>
        <HistorySkeleton />
      </div>
    );
  }

  return (
    <div className="w-full h-full pb-20">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-brand mb-2 font-outfit">Lịch Sử Của Bạn</h1>
        <p className="text-muted-foreground">Xem lại các lần đặt chỗ và lịch sử gửi xe trước đây.</p>
      </div>

      {reservations.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 px-4 bg-card rounded-[2rem] border border-border shadow-sm flex flex-col items-center justify-center"
        >
          <EmptyStateIllustration />
          <h3 className="text-xl font-bold text-brand mb-2">Chưa có lượt gửi xe nào</h3>
          <p className="text-muted-foreground mb-8 max-w-md">Bạn chưa có đặt chỗ hoặc lịch sử gửi xe nào. Hãy bắt đầu bằng việc tìm bãi xe và đặt chỗ trước nhé.</p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/driver')}
            className="px-8 py-3.5 bg-brand hover:bg-slate-800 text-white rounded-xl font-bold transition-colors shadow-lg"
          >
            Đặt chỗ ngay
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reservations.map((res, index) => (
            <BoardingPassTicket 
              key={res._id} 
              reservation={res} 
              index={index} 
              onCancel={requestCancel} 
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={cancelModalOpen}
        onClose={closeCancelModal}
        onConfirm={confirmCancel}
        title="Xác nhận hủy đặt chỗ"
        message="Bạn có chắc chắn muốn hủy đặt chỗ này? Nếu hủy trong vòng 2 giờ trước khi bắt đầu, bạn có thể phải chịu phí hủy theo quy định."
        confirmText="Hủy đặt chỗ"
        cancelText="Quay lại"
        variant="danger"
        isLoading={isCancelling}
      />
    </div>
  );
};

export default HistoryPage;
