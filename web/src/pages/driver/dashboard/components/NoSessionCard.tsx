import React from 'react';
import { motion } from 'framer-motion';
import { Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NoSessionCard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center pt-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border p-10 rounded-3xl max-w-lg text-center shadow-sm flex flex-col items-center"
      >
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <Car size={40} className="text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-brand mb-3 font-outfit">Bạn chưa có xe trong bãi</h2>
        <p className="text-muted-foreground mb-8 text-sm">
          Hiện tại hệ thống không ghi nhận chiếc xe nào của bạn đang được gửi tại các bãi xe. Hãy đặt chỗ trước để có trải nghiệm tốt nhất.
        </p>
        <button 
          onClick={() => navigate('/driver/facilities')}
          className="px-8 py-3 bg-brand text-white font-semibold rounded-xl hover:-translate-y-1 hover:shadow-md transition-all"
        >
          Tìm Bãi Xe Ngay
        </button>
      </motion.div>
    </div>
  );
};
