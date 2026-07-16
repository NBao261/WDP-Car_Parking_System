import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { LogsFilterBar } from './components/LogsFilterBar';
import { LogsTable } from './components/LogsTable';
import { useLogsList } from './hooks/useLogsList';
import { Pagination } from '../../../components/ui/Pagination';

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

export default function LogsPage() {
  const {
    logs,
    isLoading,
    actionFilter,
    setActionFilter,
    entityFilter,
    setEntityFilter,
    currentPage,
    setCurrentPage,
    pagination,
    PAGE_LIMIT,
    fetchLogs,
  } = useLogsList();

  const indexOffset = (currentPage - 1) * PAGE_LIMIT;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 w-full pb-12"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Lịch sử hoạt động</h1>
          <p className="text-gray-500 text-sm mt-1">
            Theo dõi và kiểm toán mọi thao tác được thực hiện trên hệ thống.
          </p>
        </div>
        
        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </motion.div>

      {/* Filter Section */}
      <motion.div variants={itemVariants}>
        <LogsFilterBar
          actionFilter={actionFilter}
          onActionFilterChange={setActionFilter}
          entityFilter={entityFilter}
          onEntityFilterChange={setEntityFilter}
        />
      </motion.div>

      {/* Table Section */}
      <motion.div variants={itemVariants}>
        <LogsTable
          logs={logs}
          isLoading={isLoading}
          indexOffset={indexOffset}
        />
      </motion.div>

      {/* Pagination Section */}
      {!isLoading && pagination.pages > 1 && (
        <motion.div variants={itemVariants} className="flex justify-center pt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            pageLimit={PAGE_LIMIT}
            onPageChange={setCurrentPage}
            itemLabel="nhật ký"
          />
        </motion.div>
      )}
    </motion.div>
  );
}
