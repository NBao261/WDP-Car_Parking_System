import { ExceptionType } from "../../../../services/exception.service";

export const ExceptionInfoBlocks = ({ selectedException, parkingLocation }: any) => {
  return (
    <>
      <div>
        <h4 className="text-[12px] font-bold text-[#060606] uppercase tracking-wider mb-4 flex items-center gap-2"><span className="w-1.5 h-4 bg-[#9FE870] rounded-sm"></span>Thông tin xe và lượt gửi</h4>
        <div className="bg-white border border-[#e8e9e8] rounded-[10px] p-4 space-y-3 shadow-sm">
          <div className="flex justify-between text-[13px]"><span className="text-[#6b6b6b]">Biển số:</span><span className="font-mono font-bold text-[14px] text-[#060606]">{selectedException.plate}</span></div>
          <div className="flex justify-between text-[13px]"><span className="text-[#6b6b6b]">Loại xe:</span><span className="font-medium text-[#060606]">{selectedException.vehicleType}</span></div>
          <div className="flex justify-between text-[13px]"><span className="text-[#6b6b6b]">Mã thẻ:</span><span className="font-mono font-medium text-[#060606]">{selectedException.cardCode}</span></div>
          <div className="flex justify-between text-[13px]"><span className="text-[#6b6b6b]">Giờ vào bãi:</span><span className="font-medium text-[#060606]">{selectedException.checkInTime}</span></div>
          <div className="flex justify-between text-[13px]"><span className="text-[#6b6b6b]">Vị trí đỗ hiện tại:</span><span className="font-medium text-[#060606]">{parkingLocation}</span></div>
        </div>
      </div>
      <div>
        <h4 className="text-[12px] font-bold text-[#060606] uppercase tracking-wider mb-4 flex items-center gap-2"><span className="w-1.5 h-4 bg-[#ef4444] rounded-sm"></span>Thông tin sự cố</h4>
        <div className="bg-white border border-[#e8e9e8] rounded-[10px] p-4 space-y-3 shadow-sm">
          <div className="flex justify-between text-[13px]"><span className="text-[#6b6b6b]">Loại sự cố:</span><span className="font-medium text-[#060606]">{selectedException.type}</span></div>
          <div className="flex justify-between text-[13px]"><span className="text-[#6b6b6b]">Thời gian ghi nhận:</span><span className="font-medium text-[#060606]">{selectedException.time}</span></div>
          <div className="flex justify-between text-[13px]"><span className="text-[#6b6b6b]">Người báo cáo:</span><span className="font-medium text-[#060606]">{selectedException.staffName}</span></div>
          <div className="flex justify-between text-[13px]"><span className="text-[#6b6b6b]">Phụ phí yêu cầu:</span><span className="font-bold text-[#b03030]">{selectedException.surcharge > 0 ? `${selectedException.surcharge.toLocaleString("vi-VN")} VNĐ` : "0 VNĐ"}</span></div>
          <div className="mt-3 pt-3 border-t border-[#e8e9e8]"><span className="text-[12px] text-[#6b6b6b] block mb-1">Mô tả chi tiết từ người báo cáo:</span><p className="text-[13px] text-[#060606] leading-relaxed">{selectedException.description || "Không có mô tả chi tiết."}</p></div>
        </div>
      </div>
    </>
  );
};
