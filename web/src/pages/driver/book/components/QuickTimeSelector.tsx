import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarClock, AlertCircle, Clock } from 'lucide-react';
import { CustomDateTimePicker } from './CustomDateTimePicker';

interface QuickTimeSelectorProps {
  timeMode: '30m' | '1h' | '2h' | 'custom';
  setTimeMode: (mode: '30m' | '1h' | '2h' | 'custom') => void;
  customTime: string;
  setCustomTime: (time: string) => void;
  isTimeValid: () => boolean;
  isSubmitting: boolean;
}

export const QuickTimeSelector: React.FC<QuickTimeSelectorProps> = ({
  timeMode,
  setTimeMode,
  customTime,
  setCustomTime,
  isTimeValid,
  isSubmitting,
}) => {
  return (
    <div>
      <label className="text-brand text-sm font-semibold mb-3 flex items-center gap-2">
        <CalendarClock size={16} className="text-accent-dark" /> Thời gian dự kiến đến
      </label>

      {/* Quick Selects */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        {(['30m', '1h', '2h', 'custom'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            disabled={isSubmitting}
            onClick={() => setTimeMode(mode)}
            className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            } ${
              timeMode === mode
                ? 'bg-brand text-white shadow-md'
                : 'bg-muted text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            {mode === '30m'
              ? 'Trong 30p'
              : mode === '1h'
                ? 'Trong 1 giờ'
                : mode === '2h'
                  ? 'Trong 2 giờ'
                  : 'Tùy chọn'}
          </button>
        ))}
      </div>

      {/* Custom Time Input */}
      <AnimatePresence>
        {timeMode === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <CustomDateTimePicker
              customTime={customTime}
              setCustomTime={setCustomTime}
              disabled={isSubmitting}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error/Info Alert */}
      <AnimatePresence mode="wait">
        {!isTimeValid() ? (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2 bg-red-50 text-red-700 p-3 rounded-lg border border-red-200 mt-2"
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium">
              Giờ tùy chọn không hợp lệ. Phải đặt trước ít nhất 30 phút.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2 bg-blue-50 text-blue-700 p-3 rounded-lg border border-blue-100 mt-2"
          >
            <Clock size={16} className="shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              Chỗ của bạn sẽ được giữ trong vòng <strong>30 phút</strong> tính từ giờ hẹn. Vui lòng
              đến đúng giờ để tránh bị hủy tự động.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
