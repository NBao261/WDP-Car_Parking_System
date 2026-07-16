import { RefreshCw, X } from 'lucide-react';

export function CheckOutPayment({
  paymentSuccess,
  panelMsg,
  setPanelMsg,
  step,
  isMismatch,
  isNoPlateVehicle,
  isSubmitting,
  onFlagException,
  handleCashCheckOut,
  handleMomoCheckOut,
  setPaymentSuccess,
  handleReset,
  onCheckOut,
  momoQR,
  pollIntervalRef,
  setMomoQR,
}: any) {
  return (
    <>
      {!paymentSuccess && (
        <div className="flex flex-col gap-1 mt-1">
          <label className="block text-[10px] font-semibold text-[#060606]">
            {panelMsg
              ? 'Trạng thái'
              : step === 'CONFIRM' && !isMismatch && !isNoPlateVehicle
                ? 'Phương thức thanh toán'
                : 'Trạng thái'}
          </label>
          {panelMsg ? (
            <button
              onClick={() => setPanelMsg(null)}
              className={`w-full h-7 rounded-[6px] font-bold text-[11px] flex items-center justify-center transition-all ${panelMsg.type === 'error' ? 'bg-[#FEE2E2] text-[#EF4444] border border-[#EF4444]' : panelMsg.type === 'warning' ? 'bg-[#fff8e1] text-[#f57f17] border border-[#fbc02d]' : 'bg-[#ECFCCB] text-[#1A202C] border border-[#A3E635]'}`}
            >
              {panelMsg.text}
            </button>
          ) : step === 'CONFIRM' && isMismatch ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onFlagException) onFlagException();
              }}
              className="w-full h-7 rounded-[6px] font-bold text-[11px] flex items-center justify-center transition-all bg-[#EF4444] text-white border border-[#DC2626] hover:bg-[#DC2626]"
            >
              Cảnh báo không khớp (F9)
            </button>
          ) : step === 'CONFIRM' && isNoPlateVehicle ? (
            <button
              onClick={handleCashCheckOut}
              disabled={isSubmitting}
              className="w-full h-7 rounded-[6px] font-bold text-[11px] flex items-center justify-center transition-all bg-[#A3E635] text-[#1A202C] hover:bg-[#84CC16] border border-[#A3E635]"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận xe ra'}
            </button>
          ) : step === 'CONFIRM' ? (
            <div className="flex gap-2">
              <button
                onClick={handleCashCheckOut}
                disabled={isSubmitting}
                className="flex-1 h-7 font-bold rounded-[6px] transition-colors text-[11px] bg-[#dcdcdc] hover:bg-[#c9c9c9] text-[#333]"
              >
                Tiền Mặt
              </button>
              <button
                onClick={handleMomoCheckOut}
                disabled={isSubmitting}
                className="flex-1 h-7 font-bold rounded-[6px] transition-colors text-[11px] bg-[#A3E635] hover:bg-[#84CC16] text-[#1A202C]"
              >
                QR MoMo
              </button>
            </div>
          ) : (
            <div className="w-full h-7 rounded-[6px] font-bold text-[11px] flex items-center justify-center transition-all bg-[#fcfcfc] border border-[#e8e9e8] text-[#9b9b9b]">
              —
            </div>
          )}
        </div>
      )}

      {paymentSuccess && (
        <div className="flex flex-col gap-1.5 mt-2">
          <label className="block text-[10px] font-semibold text-[#060606]">Trạng thái</label>
          <button
            onClick={() => {
              setPaymentSuccess(false);
              handleReset();
              if (onCheckOut) onCheckOut(null);
            }}
            className="w-full h-9 bg-[#A3E635] text-[#1A202C] font-bold text-[14px] flex items-center justify-center rounded-[6px] hover:bg-[#84CC16] transition-colors cursor-pointer"
          >
            Mời xe ra (Bấm Enter mở chắn)
          </button>
        </div>
      )}

      {momoQR && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-[8px]">
          <div className="bg-white rounded-[16px] p-6 w-[90%] max-w-[360px] shadow-2xl border border-pink-100 flex flex-col items-center animate-in fade-in zoom-in duration-200">
            <h3 className="text-[16px] font-bold text-[#A50064] mb-1">Thanh toán Momo</h3>
            <p className="text-[11px] text-gray-500 mb-4 text-center">
              Tài xế sử dụng ứng dụng Momo hoặc ngân hàng để quét mã QR
            </p>
            <div className="bg-white p-2 rounded-xl border-2 border-pink-100 shadow-inner mb-4">
              <img src={momoQR} alt="Momo QR Code" className="w-40 h-40 object-contain" />
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#A50064] font-medium mb-4 bg-pink-50 px-4 py-2 rounded-full">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Đang chờ khách thanh toán...
            </div>
            <button
              onClick={() => {
                setMomoQR(null);
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              }}
              className="w-full h-9 border border-gray-200 text-gray-600 font-bold text-[12px] rounded-[6px] hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" /> Hủy giao dịch Momo
            </button>
          </div>
        </div>
      )}
    </>
  );
}
