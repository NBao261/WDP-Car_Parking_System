import {
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  CheckCircle,
  ChevronDown,
  Camera,
  X,
  ImagePlus,
  ScanLine,
} from 'lucide-react';
import { useRef, useState } from 'react';
import axios from 'axios';
import { formatPlate } from '../../../../utils/format';
import SuggestionPanel from './components/SuggestionPanel';
import FacilitySelectorStep from './components/FacilitySelectorStep';
import { useCheckinFlow } from './hooks/useCheckinFlow';

export default function CheckinStaffPage({ onFlagException }: { onFlagException?: () => void }) {
  const {
    gate: _gate,
    setGate: _setGate,
    vehicleTypeId,
    setVehicleTypeId,
    plate,
    setPlate,
    setCheckInImage,
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrSuccess, setOcrSuccess] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setOcrSuccess(false);

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
      const response = await axios.post(`${API_BASE_URL}/alpr/scan`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success && response.data.data.normalizedPlate) {
        setPlate(response.data.data.normalizedPlate);
        if (response.data.data.imageUrl) {
          setCheckInImage(response.data.data.imageUrl);
        }
        setOcrSuccess(true);
      } else {
        alert(response.data.message || 'Không nhận dạng được biển số. Vui lòng nhập tay.');
      }
    } catch (error: any) {
      console.error('ALPR Error:', error);
      alert(error.response?.data?.message || 'Lỗi xử lý ảnh. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    setOcrSuccess(false);
    setCheckInImage(null);
  };

  return (
    <div className="relative flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[500px] justify-between">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-[#060606]">Check-in (Entry)</h2>
          <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-lg">
            Scan / Manual
          </span>
        </div>

        {/* Facility Badge */}
        {selectedFacility && step !== 'facility' && (
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

        {/* Loading spinner */}
        {loading && step === 'input' && !selectedFacility && !error && (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mb-2" />
            <p className="text-xs">Đang tải dữ liệu...</p>
          </div>
        )}

        {/* Step: Chọn bãi xe */}
        {step === 'facility' && (
          <FacilitySelectorStep facilities={assignedFacilities} onSelect={handleSelectFacility} />
        )}

        {/* Step: Success */}
        {step === 'success' && result ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-green-800 font-bold text-sm">
                <CheckCircle className="w-5 h-5" /> Barrier Opened!
              </div>
              <div className="text-xs space-y-1.5 text-green-700 font-medium">
                <div>
                  Session: <strong>{result.code}</strong>
                </div>
                <div>
                  Card: <strong className="font-mono">{result.cardCode}</strong>
                </div>
                <div>
                  License Plate: <strong className="font-mono">{result.licensePlate}</strong>
                </div>
                {result.slotId && (
                  <div>
                    Assigned Slot: <strong>{result.slotId.code}</strong>
                  </div>
                )}
                {result.floorId && (
                  <div>
                    Floor: <strong>{result.floorId.name}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Check-in image preview on success */}
            {previewUrl && (
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-200">
                  <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" /> Check-in Photo Captured
                  </span>
                </div>
                <img src={previewUrl} alt="Check-in" className="w-full max-h-48 object-cover" />
              </div>
            )}

            <button
              onClick={() => {
                resetFlow();
                clearPreview();
              }}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition"
            >
              Ready for Next
            </button>
          </div>
        ) : step === 'input' || step === 'suggest' ? (
          <form onSubmit={handleCheckAvailability} className="space-y-5">
            {/* Vehicle Type */}
            <div>
              <label className="block text-xs font-bold text-[#060606] mb-2">Vehicle Type</label>
              <select
                value={vehicleTypeId}
                onChange={(e) => setVehicleTypeId(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-gray-400 cursor-pointer appearance-none"
                disabled={step === 'suggest'}
              >
                {vehicleTypes.map((vt) => (
                  <option key={vt._id} value={vt._id}>
                    {vt.name}
                  </option>
                ))}
                {vehicleTypes.length === 0 && (
                  <option value="" disabled>
                    Loading...
                  </option>
                )}
              </select>
            </div>

            {/* License Plate + OCR */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#060606] text-center">
                License Plate
                {vehicleTypes.find((v) => v._id === vehicleTypeId)?.requiresPlate === false && (
                  <span className="text-[#8bc34a] ml-2 font-normal">(Không yêu cầu biển số)</span>
                )}
              </label>

              {/* Image Upload Zone */}
              {!previewUrl ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={step === 'suggest' || isUploading}
                  className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 flex flex-col items-center gap-2 text-gray-400 hover:border-[#d7ee46] hover:text-[#060606] hover:bg-[#f9ffe0] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-6 h-6 animate-spin text-[#8bc34a]" />
                      <span className="text-xs font-semibold text-[#8bc34a]">
                        Đang nhận dạng biển số...
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <ScanLine className="w-5 h-5" />
                        <ImagePlus className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold">Chụp / Upload ảnh biển số</span>
                      <span className="text-[10px]">Camera hoặc chọn file để OCR tự động</span>
                    </>
                  )}
                </button>
              ) : (
                /* Image Preview */
                <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  <img src={previewUrl} alt="preview" className="w-full max-h-40 object-cover" />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {/* OCR Badge */}
                  {ocrSuccess && (
                    <div className="absolute bottom-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> OCR Success
                    </div>
                  )}
                  {/* Clear button */}
                  <button
                    type="button"
                    onClick={clearPreview}
                    disabled={step === 'suggest'}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition disabled:opacity-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageUpload}
              />

              {/* Manual plate input */}
              {vehicleTypes.find((v) => v._id === vehicleTypeId)?.requiresPlate === false ? (
                <div className="w-full text-center font-mono text-lg font-bold uppercase tracking-widest text-[#8bc34a] bg-[#f0f9dc] border border-[#d7ee46] rounded-2xl py-4">
                  NOPLATE-AUTO — Xe không cần biển số
                </div>
              ) : (
                <input
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(formatPlate(e.target.value))}
                  placeholder="VD: 29A-123.45"
                  disabled={step === 'suggest'}
                  className="w-full text-center font-mono text-2xl font-bold uppercase tracking-widest text-[#060606] bg-gray-50 border border-gray-200 rounded-2xl py-4 focus:outline-none focus:border-[#d7ee46] focus:bg-white transition-all shadow-sm placeholder:text-gray-300 disabled:opacity-60"
                />
              )}
              {ocrSuccess && (
                <p className="text-center text-[10px] text-green-600 font-semibold">
                  ✓ Biển số đã được điền tự động từ ảnh — vui lòng kiểm tra lại
                </p>
              )}
            </div>

            {/* Check button */}
            {step === 'input' && (
              <button
                type="submit"
                disabled={
                  loading ||
                  (!plate.trim() &&
                    vehicleTypes.find((v) => v._id === vehicleTypeId)?.requiresPlate !== false) ||
                  !selectedFacility ||
                  !vehicleTypeId
                }
                className="w-full py-4 bg-[#e6f4a8] hover:bg-[#d7ee46] text-[#060606] font-bold rounded-2xl transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Check Availability <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </form>
        ) : null}

        {/* Suggestion Panel */}
        {step === 'suggest' && (
          <SuggestionPanel
            suggestedFloors={suggestedFloors}
            loading={loading}
            onSelectFloor={handleFinalCheckIn}
            onCancel={resetFlow}
          />
        )}
      </div>

      {/* Flag Exception button */}
      {step !== 'success' && step !== 'facility' && (
        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={onFlagException || (() => alert('Exception flagged'))}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1.5 transition-colors"
          >
            <AlertTriangle className="w-4 h-4" /> Flag Exception
          </button>
        </div>
      )}
    </div>
  );
}
