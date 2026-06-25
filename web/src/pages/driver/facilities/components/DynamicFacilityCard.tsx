import React from 'react';
import { motion } from 'framer-motion';
import { CircleDollarSign } from 'lucide-react';
import { Facility } from '../../../../services/facility.service';

interface DynamicFacilityCardProps {
  facility: Facility;
  index: number;
  onPricingClick: (id: string, name: string) => void;
  onBookClick: (id: string) => void;
}

export const DynamicFacilityCard: React.FC<DynamicFacilityCardProps> = ({
  facility,
  index,
  onPricingClick,
  onBookClick
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      onClick={() => onBookClick(facility._id)}
      className="group relative bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-brand/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col h-full"
    >
      {/* Image Section */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        {facility.images && facility.images.length > 0 ? (
          <img
            src={facility.images[0]}
            alt={facility.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 via-sky-100 to-indigo-50 flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
            <span className="text-blue-400 font-bold text-4xl tracking-widest uppercase opacity-70">
              {facility.name.substring(0, 2)}
            </span>
          </div>
        )}
        {/* Soft overlay only when there's an image */}
        {facility.images && facility.images.length > 0 && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-50" />
        )}

        {/* Floating Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-white/90 backdrop-blur-md text-emerald-600 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border border-white/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Đang hoạt động
          </span>
        </div>
        <div className="absolute bottom-4 left-4 flex gap-2">
          <span className="bg-brand text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            ⚡ {facility.openTime} - {facility.closeTime}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-brand transition-colors line-clamp-1">{facility.name}</h3>
          <p className="text-slate-500 text-sm mb-4 line-clamp-2">{facility.address}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPricingClick(facility._id, facility.name);
            }}
            className="p-3 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200"
            title="Xem bảng giá"
          >
            <CircleDollarSign size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookClick(facility._id);
            }}
            className="flex-1 bg-accent hover:bg-accent-dark text-brand font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg text-sm"
          >
            Đặt Chỗ Ngay
          </button>
        </div>
      </div>
    </motion.div>
  );
};
