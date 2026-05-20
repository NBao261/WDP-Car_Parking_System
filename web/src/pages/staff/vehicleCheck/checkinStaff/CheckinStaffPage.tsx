import { AlertTriangle, ArrowRight, RefreshCw, CheckCircle, ChevronDown } from "lucide-react";
import SuggestionPanel from "./components/SuggestionPanel";
import FacilitySelectorStep from "./components/FacilitySelectorStep";
import { useCheckinFlow } from "./hooks/useCheckinFlow";

export default function CheckinStaffPage({ onFlagException }: { onFlagException?: () => void }) {
  const {
    gate, setGate,
    vehicleTypeId, setVehicleTypeId,
    plate, setPlate,
    loading,
    assignedFacilities,
    selectedFacility,
    vehicleTypes,
    step,
    suggestedFloors,
    result,
    error,
    handleSelectFacility,
    handleCheckAvailability,
    handleFinalCheckIn,
    resetFlow,
    handleChangeFacility,
  } = useCheckinFlow();

  return (
    <div className="relative flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[500px] justify-between">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-[#060606]">Check-in (Entry)</h2>
          <span className="text-xs text-gray-400 font-medium">Manual Input</span>
        </div>

        {/* Facility Badge — hiển thị khi đã chọn bãi */}
        {selectedFacility && step !== "facility" && (
          <div className="mb-4">
            <button
              onClick={handleChangeFacility}
              disabled={assignedFacilities.length <= 1}
              className="w-full flex items-center justify-between px-3 py-2 bg-[#f0f9dc] border border-[#d7ee46] rounded-xl text-xs font-semibold text-[#060606] transition-colors hover:bg-[#e6f4a8] disabled:cursor-default disabled:hover:bg-[#f0f9dc]"
            >
              <span className="truncate">📍 {selectedFacility.name}</span>
              {assignedFacilities.length > 1 && (
                <ChevronDown className="w-3.5 h-3.5 shrink-0 ml-2 text-gray-500" />
              )}
            </button>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="p-3.5 mb-5 rounded-xl text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {/* Loading spinner khi khởi tạo */}
        {loading && step === "input" && !selectedFacility && !error && (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mb-2" />
            <p className="text-xs">Đang tải dữ liệu...</p>
          </div>
        )}

        {/* Step: Chọn bãi xe (khi có nhiều bãi) */}
        {step === "facility" && (
          <FacilitySelectorStep
            facilities={assignedFacilities}
            onSelect={handleSelectFacility}
          />
        )}

        {/* Step: Success */}
        {step === "success" && result ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-green-800 font-bold text-sm">
              <CheckCircle className="w-5 h-5" /> Barrier Opened!
            </div>
            <div className="text-xs space-y-1.5 text-green-700 font-medium">
              <div>Session: <strong>{result.code}</strong></div>
              <div>Card: <strong className="font-mono">{result.cardCode}</strong></div>
              <div>License Plate: <strong className="font-mono">{result.licensePlate}</strong></div>
              {result.slotId && <div>Assigned Slot: <strong>{result.slotId.code}</strong></div>}
              {result.floorId && <div>Floor: <strong>{result.floorId.name}</strong></div>}
            </div>
            <button
              onClick={resetFlow}
              className="w-full mt-2 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition"
            >
              Ready for Next
            </button>
          </div>
        ) : step === "input" || step === "suggest" ? (
          <form onSubmit={handleCheckAvailability} className="space-y-6">
            <div>

              {/* Vehicle Type */}
              <div>
                <label className="block text-xs font-bold text-[#060606] mb-2">Vehicle Type</label>
                <select
                  value={vehicleTypeId}
                  onChange={(e) => setVehicleTypeId(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-gray-400 cursor-pointer appearance-none"
                  disabled={step === "suggest"}
                >
                  {vehicleTypes.map((vt) => (
                    <option key={vt._id} value={vt._id}>{vt.name}</option>
                  ))}
                  {vehicleTypes.length === 0 && (
                    <option value="" disabled>Loading...</option>
                  )}
                </select>
              </div>
            </div>

            {/* License Plate */}
            <div className="space-y-2 py-2">
              <label className="block text-xs font-bold text-[#060606] text-center">
                Enter License Plate
              </label>
              <input
                type="text"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                placeholder="E.G. 29A-123.45"
                disabled={step === "suggest"}
                className="w-full text-center font-mono text-2xl font-bold uppercase tracking-widest text-[#060606] bg-gray-50 border border-gray-200 rounded-2xl py-4 focus:outline-none focus:border-gray-400 focus:bg-white transition-all shadow-sm placeholder:text-gray-300 disabled:opacity-60"
              />
            </div>

            {/* Check button */}
            {step === "input" && (
              <button
                type="submit"
                disabled={loading || !plate.trim() || !selectedFacility || !vehicleTypeId}
                className="w-full py-4 bg-[#e6f4a8] hover:bg-[#d7ee46] text-[#060606] font-bold rounded-2xl transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading
                  ? <RefreshCw className="w-4 h-4 animate-spin" />
                  : <>Check Availability <ArrowRight className="w-4 h-4" /></>
                }
              </button>
            )}
          </form>
        ) : null}

        {/* Suggestion Panel */}
        {step === "suggest" && (
          <SuggestionPanel
            suggestedFloors={suggestedFloors}
            loading={loading}
            onSelectFloor={handleFinalCheckIn}
            onCancel={resetFlow}
          />
        )}
      </div>

      {/* Flag Exception button */}
      {step !== "success" && step !== "facility" && (
        <div className="flex justify-center mt-6">
          <button
            type="button"
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
