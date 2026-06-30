import React from 'react';
import { useAuthStore } from '../../../store';
import { motion } from 'framer-motion';
import { RefreshCw, LayoutDashboard, Calendar } from 'lucide-react';
import { useDashboard } from './hooks/useDashboard';
import { DashboardCards } from './components/DashboardCards';
import { DashboardCharts } from './components/DashboardCharts';
import { Skeleton } from '../../../components/ui/Skeleton';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  }
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const {
    isLoading,
    trafficData,
    revenueData,
    occupancyData,
    fetchData,
  } = useDashboard();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 space-y-8 pb-12"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#062F28] flex items-center justify-center shadow-lg shadow-[#062F28]/20">
              <LayoutDashboard className="text-white" size={20} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Tổng quan hệ thống</h1>
          </div>
          <p className="text-gray-500 text-sm md:text-base max-w-2xl">
            Xin chào, <span className="font-semibold text-[#062F28]">{user?.name}</span> —{' '}
            {new Date().toLocaleDateString('vi-VN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm text-sm flex-1 sm:flex-none">
            <Calendar size={16} className="text-gray-400 mr-2" />
            <span className="text-gray-600 font-medium">7 ngày qua</span>
          </div>
          
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center justify-center p-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </motion.div>

      {isLoading ? (
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <Skeleton className="h-[400px] rounded-2xl" />
             <Skeleton className="h-[400px] rounded-2xl" />
          </div>
        </motion.div>
      ) : (
        <>
          <motion.div variants={itemVariants}>
            <DashboardCards 
              trafficData={trafficData} 
              revenueData={revenueData} 
              occupancyData={occupancyData} 
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <DashboardCharts 
              trafficData={trafficData}
              revenueData={revenueData}
            />
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
