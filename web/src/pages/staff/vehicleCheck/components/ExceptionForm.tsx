import { useState } from "react";

// ─── Exception Form (stateful — resets each time modal opens) ────────────────
export default function ExceptionForm({ onClose }: { onClose: () => void }) {
  const [exceptionType, setExceptionType] = useState("Mất thẻ / Không tìm thấy phiên gửi");
  const [relatedPlate, setRelatedPlate] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire to real API — POST /exceptions { exceptionType, licensePlate: relatedPlate, note }
    alert(`Ngoại lệ đã được ghi nhận!\nLoại: ${exceptionType}\nBiển số: ${relatedPlate || "N/A"}`);
    onClose();
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Loại sự cố</label>
        <select
          value={exceptionType}
          onChange={(e) => setExceptionType(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"
        >
          <option>Mất thẻ / Không tìm thấy phiên gửi</option>
          <option>Camera OCR nhận diện sai biển số</option>
          <option>Biển số xe bị mờ / hỏng</option>
          <option>Đỗ xe sai khu vực quy định</option>
          <option>Sự cố Barie không mở</option>
          <option>Khác</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Biển số / Mã vé liên quan</label>
        <input
          type="text"
          value={relatedPlate}
          onChange={(e) => setRelatedPlate(e.target.value.toUpperCase())}
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
