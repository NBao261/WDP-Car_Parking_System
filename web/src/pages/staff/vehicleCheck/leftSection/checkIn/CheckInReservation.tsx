import { QrCode, X, CheckCircle2, AlertTriangle } from 'lucide-react';

interface CheckInReservationProps {
  inputReservationMode: 'qr' | 'code';
  setInputReservationMode: React.Dispatch<React.SetStateAction<'qr' | 'code'>>;
  reservationInfo: any;
  setReservationInfo: (info: any) => void;
  plateMatchStatus: 'idle' | 'match' | 'mismatch';
  setPlateMatchStatus: (status: 'idle' | 'match' | 'mismatch') => void;
  setReservationCode: (val: string) => void;
  manualReservationCode: string;
  setManualReservationCode: (val: string) => void;
  lookupReservation: (code: string) => void;
  showQrScanner: boolean;
  toggleQrScanner: () => void;
}

export function CheckInReservation({
  inputReservationMode,
  setInputReservationMode,
  reservationInfo,
  setReservationInfo,
  plateMatchStatus,
  setPlateMatchStatus,
  setReservationCode,
  manualReservationCode,
  setManualReservationCode,
  lookupReservation,
  showQrScanner,
  toggleQrScanner,
}: CheckInReservationProps) {
  return (
    <div className="flex-1 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-[10px] font-semibold text-[#6b6b6b]">
          {inputReservationMode === 'code' ? 'Nhập mã đặt chỗ' : 'Quét QR đặt chỗ'}
        </label>
        <button
          onClick={() => setInputReservationMode((prev) => (prev === 'code' ? 'qr' : 'code'))}
          className="text-[10px] text-blue-600 hover:underline"
        >
          {inputReservationMode === 'code' ? 'Quét QR' : 'Nhập mã đặt chỗ'}
        </button>
      </div>

      {reservationInfo ? (
        <div
          className={`flex-1 rounded-[6px] border p-3 flex flex-col gap-2 ${
            plateMatchStatus === 'match'
              ? 'bg-[#f0f9e8] border-[#9FE870]'
              : plateMatchStatus === 'mismatch'
                ? 'bg-[#fef2f2] border-[#ef4444]'
                : 'bg-[#f0f9e8] border-[#9FE870]/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                plateMatchStatus === 'match'
                  ? 'bg-[#9FE870] text-[#062F28]'
                  : plateMatchStatus === 'mismatch'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-[#9FE870]/30 text-[#2d6a1f]'
              }`}
            >
              {plateMatchStatus === 'match' ? (
                <>
                  <CheckCircle2 className="w-3 h-3" /> Biển khớp
                </>
              ) : plateMatchStatus === 'mismatch' ? (
                <>
                  <AlertTriangle className="w-3 h-3" /> Không khớp
                </>
              ) : (
                <>✓ Tìm thấy</>
              )}
            </div>
            <button
              onClick={() => {
                setReservationInfo(null);
                setReservationCode('');
                setPlateMatchStatus('idle');
              }}
              className="w-5 h-5 flex items-center justify-center text-[#aaa] hover:text-[#333]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-1 text-[10px] text-[#444] flex-1">
            <div className="flex justify-between">
              <span className="text-[#888]">Biển đặt</span>
              <span className="font-mono font-bold text-[#062F28]">
                {reservationInfo.licensePlate}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888]">Slot giữ</span>
              <span className="font-bold">
                {(reservationInfo.slotId as any)?.code || '?'}
                {(reservationInfo.slotId as any)?.floorId?.name && (
                  <span className="font-normal text-[#888]">
                    {' '}
                    · {(reservationInfo.slotId as any).floorId.name}
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888]">Giờ hẹn</span>
              <span className="font-bold">
                {new Date(reservationInfo.startTime).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888]">Mã</span>
              <span className="font-mono text-[9px] text-[#666]">{reservationInfo.code}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-[210px] w-full border border-dashed border-[#999] rounded-[6px] flex flex-col items-center justify-center gap-2 bg-[#fcfcfc] px-3 relative">
          {inputReservationMode === 'code' ? (
            <div className="w-full px-2">
              <input
                type="text"
                placeholder="Nhập mã đặt chỗ"
                value={manualReservationCode}
                onChange={(e) => setManualReservationCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    lookupReservation(manualReservationCode);
                  }
                }}
                className="w-full h-12 text-[16px] text-center px-4 border border-[#e8e9e8] bg-[#e5ecda] rounded-[6px] uppercase font-bold outline-none focus:border-[#9FE870] placeholder-[#6b6b6b] text-[#062F28]"
              />
            </div>
          ) : showQrScanner ? (
            <div className="w-full h-full flex flex-col py-1">
              <div id="ci-qr-reader" className="w-full flex-1 rounded-[4px] overflow-hidden" />
              <div className="shrink-0 flex flex-col items-center mt-1">
                <p className="text-[9px] text-center text-[#9FE870] font-medium">
                  Hướng vào mã QR trên điện thoại khách
                </p>
                <button
                  onClick={toggleQrScanner}
                  className="text-[9px] text-[#888] underline text-center"
                >
                  Đóng camera
                </button>
              </div>
            </div>
          ) : (
            <div
              className="flex flex-col items-center mb-1"
              onClick={toggleQrScanner}
              style={{ cursor: 'pointer' }}
            >
              <img src="/Logo_chu.png" alt="LYNC PARK" className="h-24 mb-2 object-contain" />
              <QrCode className="w-4 h-4 text-[#aaa] mb-2" />
              <span className="text-[10px] font-semibold text-[#6b6b6b]">
                Quét QR được cấp khi đặt chỗ
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
