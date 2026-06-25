import React from 'react';

interface PricingPaginationProps {
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  totalItems: number;
  pageLimit: number;
  itemLabel?: string;
}

export function PricingPagination({
  currentPage, setCurrentPage,
  totalPages, totalItems,
  pageLimit, itemLabel = "bảng giá"
}: PricingPaginationProps) {
  if (totalItems === 0 || totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
      <span className="text-sm text-gray-500">
        Hiển thị {((currentPage - 1) * pageLimit) + 1} - {Math.min(currentPage * pageLimit, totalItems)} trong số {totalItems} {itemLabel}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Trước
        </button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1 ? 'bg-[#cce242] text-[#060606] border border-[#b8cc30]' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
