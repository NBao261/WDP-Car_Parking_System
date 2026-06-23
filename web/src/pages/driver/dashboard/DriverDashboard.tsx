import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { PaymentModal } from './components/PaymentModal';
import { useDashboard } from './hooks/useDashboard';
import { NoSessionCard } from './components/NoSessionCard';
import { ActiveSessionCard } from './components/ActiveSessionCard';

const DriverDashboard: React.FC = () => {
  const { 
    loading, 
    activeSession, 
    checkInDate, 
    diffHrs, 
    diffMins, 
    qrUrl 
  } = useDashboard();
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="text-accent-dark animate-spin" />
      </div>
    );
  }

  if (!activeSession) {
    return <NoSessionCard />;
  }

  return (
    <div className="w-full h-full flex flex-col items-center pt-6 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <div className="flex items-center justify-between mb-6 px-2">
          <h1 className="text-3xl font-bold text-brand font-outfit">Bảng Điều Khiển</h1>
          <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Đang Gửi Xe
          </span>
        </div>

        <ActiveSessionCard 
          activeSession={activeSession}
          qrUrl={qrUrl}
          diffHrs={diffHrs}
          diffMins={diffMins}
          checkInDate={checkInDate!}
          onShowPayment={() => setShowPaymentModal(true)}
        />
      </motion.div>

      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        sessionId={activeSession._id}
        amount={activeSession.totalFee || 0}
      />
    </div>
  );
};

export default DriverDashboard;
