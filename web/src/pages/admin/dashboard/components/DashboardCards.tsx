import React from 'react';
import { TrafficReportData, RevenueReportData, OccupancyReportData } from '../../../../services/report.service';
import { LogIn, LogOut, Wallet, Car } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardCardsProps {
  trafficData: TrafficReportData | null;
  revenueData: RevenueReportData | null;
  occupancyData: OccupancyReportData | null;
}

export function DashboardCards({ trafficData, revenueData, occupancyData }: DashboardCardsProps) {
  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const cards = [
    {
      title: 'Tổng doanh thu',
      value: revenueData ? formatVND(revenueData.summary.grandTotal) : '0 ₫',
      icon: <Wallet size={28} className="text-emerald-600" />,
      bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
      subtitle: revenueData ? `${revenueData.summary.totalTransactions} giao dịch` : '',
    },
    {
      title: 'Lượt xe vào',
      value: trafficData ? trafficData.summary.totalCheckIn.toLocaleString('vi-VN') : '0',
      icon: <LogIn size={28} className="text-blue-600" />,
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      subtitle: 'Trong khoảng thời gian',
    },
    {
      title: 'Lượt xe ra',
      value: trafficData ? trafficData.summary.totalCheckOut.toLocaleString('vi-VN') : '0',
      icon: <LogOut size={28} className="text-orange-600" />,
      bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
      subtitle: 'Trong khoảng thời gian',
    },
    {
      title: 'Tỷ lệ lấp đầy (HT)',
      value: occupancyData ? `${(occupancyData.summary.overallOccupancyRate * 100).toFixed(1)}%` : '0%',
      icon: <Car size={28} className="text-purple-600" />,
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      subtitle: occupancyData ? `${occupancyData.summary.totalOccupied} / ${occupancyData.summary.totalSlots} chỗ` : '',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-white p-7 rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100/50 flex flex-col hover:shadow-xl hover:border-gray-200 transition-all duration-300"
        >
          <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${card.bg} shadow-inner`}>
              {card.icon}
            </div>
          </div>
          <div className="mt-auto">
            <p className="text-base font-semibold text-gray-500 mb-2">{card.title}</p>
            <h3 className="text-3xl xl:text-4xl font-black text-[#062F28] tracking-tight">{card.value}</h3>
            {card.subtitle && (
              <p className="text-sm font-medium text-gray-400 mt-3">{card.subtitle}</p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
