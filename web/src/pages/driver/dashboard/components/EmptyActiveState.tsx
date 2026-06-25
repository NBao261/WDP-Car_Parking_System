import React from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EmptyActiveState: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center pt-12 pb-24 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md flex flex-col items-center text-center"
      >
        {/* Animated Illustration Area */}
        <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
          {/* Background glowing blobs */}
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="absolute inset-0 bg-accent/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 1 }}
            className="absolute inset-4 bg-emerald-300/30 rounded-full blur-2xl"
          />

          {/* Main Visuals */}
          <div className="relative z-10 w-32 h-32 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 flex items-center justify-center overflow-hidden">
            {/* Map background grid */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: 'radial-gradient(circle at center, #000 1.5px, transparent 1.5px)',
                backgroundSize: '16px 16px',
              }}
            />

            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="relative"
            >
              <MapPin size={48} className="text-slate-800 drop-shadow-md" strokeWidth={1.5} />
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -top-2 -right-2"
              >
                <Navigation
                  size={22}
                  className="text-emerald-500 drop-shadow-sm fill-emerald-500"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Copywriting */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-3xl font-black text-slate-900 mb-4 tracking-tight"
        >
          Chưa có chuyến đỗ xe nào!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-slate-500 mb-10 text-[15px] leading-relaxed max-w-[85%]"
        >
          Bạn chưa gửi chiếc xe nào tại hệ thống của chúng tôi. Khám phá các bãi đỗ xe thông minh
          ngay gần bạn nhé!
        </motion.p>

        {/* Vibrant CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/driver/facilities')}
          className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 hover:bg-accent text-white hover:text-brand font-black rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.15)] hover:shadow-[0_8px_30px_rgba(204,255,0,0.4)] transition-all overflow-hidden"
        >
          <span className="relative z-10 text-base uppercase tracking-wide">Tìm Bãi Xe Ngay</span>
          <Search size={20} strokeWidth={2.5} className="relative z-10 group-hover:animate-pulse" />

          {/* Hover highlight effect */}
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        </motion.button>
      </motion.div>
    </div>
  );
};
