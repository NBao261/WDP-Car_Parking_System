import { useState } from 'react';
import { toast } from 'sonner';
import { ExceptionType, EXCEPTION_TYPE_LABELS } from '../../../../services/exception.service';

// ─── ExceptionForm: dùng khi tạo sự cố KHÔNG từ context check-out ─────────
// (vd: báo cáo sự cố từ luồng check-in, hoặc từ màn hình riêng)
export default function ExceptionForm({ onClose }: { onClose: () => void }) {
  const [exceptionType, setExceptionType] = useState<ExceptionType>(ExceptionType.OTHER);
  const [sessionCode, setSessionCode] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sessionCode.trim()) {
      toast.error('Vui lòng nhập mã vé / biển số liên quan!');
      return;
    }
    if (!note.trim()) {
      toast.error('Vui lòng mô tả chi tiết tình huống!');
      return;
    }

    // NOTE: ExceptionForm không có sessionId (MongoDB ObjectId) trực tiếp.
    // Flow đúng: Staff cần tìm session trước (qua CheckOutPanel) để có _id.
    // Form này chỉ dùng như fallback — thực tế nên dùng GlobalExceptionPanel.
    toast.warning('Vui lòng báo sự cố trực tiếp từ màn hình Kiểm Tra Xe để gắn đúng phiên gửi xe!');
    onClose();
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Loại sự cố</label>
        <select
          value={exceptionType}
          onChange={(e) => setExceptionType(e.target.value as ExceptionType)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"
        >
          {Object.entries(EXCEPTION_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Biển số / Mã vé liên quan
        </label>
        <input
          type="text"
          value={sessionCode}
          onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
          placeholder="Nhập biển số hoặc mã vé..."
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-red-500"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Ghi chú chi tiết</label>
        <textarea
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Mô tả chi tiết tình huống..."
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 resize-none"
        />
      </div>

      <div className="pt-4 border-t border-gray-100 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="w-1/3 py-4 border border-gray-300 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="w-2/3 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-sm"
        >
          Lưu Báo Cáo
        </button>
      </div>
    </form>
  );
}
