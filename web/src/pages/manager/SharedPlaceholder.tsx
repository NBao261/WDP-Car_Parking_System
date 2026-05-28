import { Hammer } from 'lucide-react';

export default function SharedPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] bg-white rounded-xl border border-[#e8e9e8] p-8 text-center">
      <div className="w-16 h-16 bg-[#f9f9f9] rounded-full flex items-center justify-center mb-6">
        <Hammer size={32} className="text-[#a0a0a0]" />
      </div>
      <h2 className="text-xl font-bold text-[#060606] mb-2">Đang tái cấu trúc UI</h2>
      <p className="text-[#6b6b6b] max-w-md">
        Chức năng này đã có sẵn ở giao diện Admin. Các lập trình viên đang tiến hành di chuyển UI sang Shared Components để Manager có thể tái sử dụng.
      </p>
    </div>
  );
}
