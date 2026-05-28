import { useState } from "react";
import { Search, Loader2, CheckCircle2, AlertCircle, Car } from "lucide-react";
import { sessionService, ParkingSession, SessionStatus } from "../../../../services/session.service";

export interface SelectedSessionInfo {
  id: string;
  code: string;
  licensePlate: string;
  checkInTime: string;
  vehicleType: string;
  floorName: string;
  slotCode: string;
  gateIn: string;
}

interface SessionLookupStepProps {
  onSessionSelected: (session: SelectedSessionInfo) => void;
  initialPlate?: string;
}

export default function SessionLookupStep({
  onSessionSelected,
  initialPlate = "",
}: SessionLookupStepProps) {
  const [plate, setPlate] = useState(initialPlate.toUpperCase());
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<ParkingSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    const trimmed = plate.trim().toUpperCase();
    if (!trimmed) return;
    setIsSearching(true);
    setError(null);
    setResult(null);
    setSearched(true);
    try {
      const res = await sessionService.searchSession({ licensePlate: trimmed });
      if (res.success && res.data) {
        const session = res.data;
        // Only allow active or exception sessions
        if (
          session.status === SessionStatus.ACTIVE ||
          session.status === SessionStatus.EXCEPTION
        ) {
          setResult(session);
        } else {
          setError(
            `Phiên gửi xe (${session.code}) có trạng thái "${session.status}" — không thể tạo ngoại lệ.`
          );
        }
      } else {
        setError("Không tìm thấy xe đang gửi với biển số này.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không tìm thấy xe đang gửi với biển số này.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirm = () => {
    if (!result) return;
    onSessionSelected({
      id: result._id,
      code: result.code,
      licensePlate: result.licensePlate,
      checkInTime: new Date(result.checkInTime).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      vehicleType: (result.vehicleTypeId as any)?.name || "—",
      floorName: (result.floorId as any)?.name || "—",
      slotCode: (result.slotId as any)?.code || "—",
      gateIn: result.gateIn || "—",
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[13px] text-[#6b6b6b] mb-4">
          Nhập biển số xe để tìm phiên gửi xe đang hoạt động.
        </p>

        {/* Search input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Car className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={plate}
              onChange={(e) => {
                setPlate(e.target.value.toUpperCase());
                setResult(null);
                setError(null);
                setSearched(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Ví dụ: 51A-12345"
              className="w-full h-11 pl-9 pr-4 border border-[#e8e9e8] rounded-[10px] text-[15px] font-mono font-bold tracking-wider text-[#060606] focus:outline-none focus:border-[#060606] uppercase placeholder:font-normal placeholder:tracking-normal placeholder:text-gray-400"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !plate.trim()}
            className="h-11 px-5 bg-[#060606] text-white font-semibold text-[13px] rounded-[10px] hover:opacity-80 transition-all disabled:opacity-40 flex items-center gap-2"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {isSearching ? "Đang tìm..." : "Tìm xe"}
          </button>
        </div>
      </div>

      {/* Result */}
      {searched && !isSearching && (
        <>
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-[10px] bg-[#fde8e8] border border-[#f5c6c6]">
              <AlertCircle className="w-5 h-5 text-[#b03030] shrink-0 mt-0.5" />
              <p className="text-[13px] text-[#b03030] font-medium">{error}</p>
            </div>
          )}

          {result && (
            <div className="border border-[#d7ee46] rounded-[12px] overflow-hidden bg-[#fafff0]">
              {/* Session found header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#d7ee46]/30 border-b border-[#d7ee46]">
                <CheckCircle2 className="w-4 h-4 text-[#4a7a00]" />
                <span className="text-[12px] font-semibold text-[#4a7a00] uppercase tracking-wider">
                  Tìm thấy phiên gửi xe
                </span>
                <span className="ml-auto font-mono text-[11px] text-[#6b6b6b]">{result.code}</span>
              </div>

              {/* Details */}
              <div className="p-4 space-y-2">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#6b6b6b]">Biển số:</span>
                  <span className="font-mono font-bold text-[15px] text-[#060606]">
                    {result.licensePlate}
                  </span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#6b6b6b]">Loại xe:</span>
                  <span className="font-medium">
                    {(result.vehicleTypeId as any)?.name || "—"}
                  </span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#6b6b6b]">Tầng / Slot:</span>
                  <span className="font-medium">
                    {(result.floorId as any)?.name || "—"} ·{" "}
                    {(result.slotId as any)?.code || "—"}
                  </span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#6b6b6b]">Giờ vào:</span>
                  <span className="font-medium">
                    {new Date(result.checkInTime).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#6b6b6b]">Cổng vào:</span>
                  <span className="font-medium">{result.gateIn || "—"}</span>
                </div>
              </div>

              {/* Confirm button */}
              <div className="px-4 pb-4">
                <button
                  onClick={handleConfirm}
                  className="w-full h-10 bg-[#060606] text-white font-semibold text-[13px] rounded-[8px] hover:opacity-80 transition-all"
                >
                  Chọn xe này → Tiếp tục
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
