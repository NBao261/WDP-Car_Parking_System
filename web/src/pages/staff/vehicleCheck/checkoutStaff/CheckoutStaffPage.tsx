import React, { useState } from "react";
import { Search, AlertTriangle, RefreshCw, CheckCircle, DollarSign } from "lucide-react";
import { apiClient } from "../../../../services/api";

export default function CheckoutStaffPage({ onFlagException }: { onFlagException?: () => void }) {
  const [plate, setPlate] = useState("");
  const [session, setSession] = useState<any>(null);
  const [fee, setFee] = useState<any>(null);
  const [gateOut, _setGateOut] = useState("GATE-A");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"search" | "bill" | "success">("search");
  const [error, setError] = useState("");

  const handleSearchAndCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate.trim()) return;

    setLoading(true);
    setError("");

    try {
      // Tìm kiếm session theo biển số — không có offline mock
      const searchRes: any = await apiClient.get("/sessions/search", {
        params: { licensePlate: plate },
      });

      const sess = searchRes.data;
      setSession(sess);

      // Tính phí tạm tính
      const feeRes: any = await apiClient.get(`/sessions/${sess._id}/fee`);
      setFee(feeRes.data);

      // Check-out ngay lập tức
      await apiClient.post(`/sessions/${sess._id}/check-out`, { gateOut });

      setStep("success");
    } catch (err: any) {
      // Xử lý lỗi chi tiết từ BE
      const msg = err.message || "";
      if (msg.includes("không tìm thấy") || msg.includes("not found") || err?.status === 404) {
        setError("Không tìm thấy lượt gửi xe đang hoạt động cho biển số này.");
      } else if (msg.includes("đã kết thúc") || msg.includes("completed")) {
        setError("Lượt gửi xe này đã được check-out trước đó.");
      } else if (err?.status === 403 || msg.toLowerCase().includes("forbidden") || msg.toLowerCase().includes("không được phân công")) {
        setError("Bạn không có quyền xử lý session này. Kiểm tra lại bãi xe được phân công.");
      } else {
        setError(msg || "Thao tác thất bại. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPlate("");
    setSession(null);
    setFee(null);
    setStep("search");
    setError("");
  };

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[500px] justify-between">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-[#060606]">Check-out (Exit)</h2>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3.5 mb-5 rounded-xl text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {/* Step: Search */}
        {step === "search" && (
          <form onSubmit={handleSearchAndCheckout} className="space-y-6">
            <div className="flex flex-col items-center justify-center space-y-2 py-4">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-center">
                <h3 className="text-sm font-bold text-[#060606]">Search Active Session</h3>
                <p className="text-xs text-gray-400">Enter license plate to process exit</p>
              </div>
            </div>

            <input
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              placeholder="E.G. 29A-123.45"
              className="w-full text-center font-mono text-2xl font-bold uppercase tracking-widest text-[#060606] bg-gray-50 border border-gray-200 rounded-2xl py-4 focus:outline-none focus:border-gray-400 focus:bg-white transition-all shadow-sm placeholder:text-gray-300"
            />

            <button
              type="submit"
              disabled={loading || !plate.trim()}
              className="w-full py-4 bg-[#d7ee46] hover:bg-[#c4dc32] text-[#060606] font-bold rounded-2xl transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Check-out (Exit)"}
            </button>
          </form>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="space-y-6 py-2">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-base font-bold">Gate Released!</h3>
              <p className="text-xs text-gray-500 mt-1">Vehicle cleared successfully</p>
            </div>

            {session && fee && (
              <div className="space-y-6">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400 font-semibold">PLATE</span>
                    <span className="font-mono font-bold text-gray-800">{session.licensePlate}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400 font-semibold">SESSION</span>
                    <span className="font-mono font-bold text-gray-600">{session.code}</span>
                  </div>
                  {session.floorId && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 font-semibold">FLOOR</span>
                      <span className="font-bold text-gray-800">{session.floorId?.name ?? "—"}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400 font-semibold">PLAN</span>
                    <span className="font-bold text-gray-800">{fee.details?.pricingPlanName || "Standard Plan"}</span>
                  </div>
                  <div className="flex justify-between text-xs border-t pt-2 border-gray-200">
                    <span className="text-gray-400 font-semibold">DURATION</span>
                    <span className="font-bold text-gray-800">{fee.details?.durationHours ?? 0} Hours</span>
                  </div>
                </div>

                <div className="bg-[#060606] rounded-xl p-5 border border-gray-800 shadow-md">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#d7ee46] uppercase">Collected</span>
                    <div className="text-2xl font-bold text-[#d7ee46] flex items-center gap-0.5 font-mono">
                      <DollarSign className="w-5 h-5 shrink-0" />
                      <span>{fee.totalFee?.toLocaleString("vi-VN")} ₫</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleReset}
              className="w-full py-4 mt-6 bg-[#060606] text-white font-bold rounded-2xl hover:bg-gray-800 transition shadow-sm"
            >
              Ready for Next
            </button>
          </div>
        )}
      </div>

      {/* Flag Exception */}
      {step !== "success" && (
        <div className="flex justify-center mt-6">
          <button
            onClick={onFlagException || (() => alert("Exception flagged"))}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1.5 transition-colors"
          >
            <AlertTriangle className="w-4 h-4" /> Flag Exception
          </button>
        </div>
      )}
    </div>
  );
}
