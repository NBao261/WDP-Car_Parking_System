import React, { useState, useRef } from 'react';
import {
  Search,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  DollarSign,
  Camera,
  ScanLine,
  ImagePlus,
  X,
} from 'lucide-react';
import axios from 'axios';
import { apiClient } from '../../../../services/api';

export default function CheckoutStaffPage({ onFlagException }: { onFlagException?: () => void }) {
  const [plate, setPlate] = useState('');
  const [session, setSession] = useState<any>(null);
  const [fee, setFee] = useState<any>(null);
  const [gateOut, _setGateOut] = useState('GATE-A');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'search' | 'bill' | 'success'>('search');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrSuccess, setOcrSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
        setOcrSuccess(true);
      } else {
        alert(response.data.message || 'Không nhận dạng được biển số. Vui lòng nhập tay.');
      }
    } catch (err: any) {
      console.error('ALPR Error:', err);
      alert(err.response?.data?.message || 'Lỗi xử lý ảnh. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    setOcrSuccess(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate.trim()) return;

    setLoading(true);
    setError('');

    try {
      const searchRes: any = await apiClient.get('/sessions/search', {
        params: { licensePlate: plate },
      });

      const sess = searchRes.data.data;
      setSession(sess);

      const feeRes: any = await apiClient.get(`/sessions/${sess._id}/fee`);
      setFee(feeRes.data.data);

      setStep('bill');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || '';
      if (msg.includes('không tìm thấy') || msg.includes('not found') || err?.status === 404) {
        setError('Không tìm thấy lượt gửi xe đang hoạt động cho biển số này.');
      } else if (msg.includes('đã kết thúc') || msg.includes('completed')) {
        setError('Lượt gửi xe này đã được check-out trước đó.');
      } else if (
        err?.status === 403 ||
        msg.toLowerCase().includes('forbidden') ||
        msg.toLowerCase().includes('không được phân công')
      ) {
        setError('Bạn không có quyền xử lý session này. Kiểm tra lại bãi xe được phân công.');
      } else {
        setError(msg || 'Thao tác thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!session) return;
    setLoading(true);
    setError('');
    try {
      await apiClient.post(`/sessions/${session._id}/check-out`, { gateOut });
      setStep('success');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPlate('');
    setSession(null);
    setFee(null);
    setStep('search');
    setError('');
    setPreviewUrl(null);
    setOcrSuccess(false);
  };

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[500px] justify-between">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-[#060606]">Check-out (Exit)</h2>
          <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-lg">
            Scan / Manual
          </span>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3.5 mb-5 rounded-xl text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {/* Step: Search */}
        {step === 'search' && (
          <form onSubmit={handleSearch} className="space-y-5">
            <div className="flex flex-col items-center justify-center space-y-2 py-2">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-center">
                <h3 className="text-sm font-bold text-[#060606]">Search Active Session</h3>
                <p className="text-xs text-gray-400">Scan ảnh hoặc nhập biển số để tìm kiếm</p>
              </div>
            </div>

            {/* Image Upload Zone */}
            {!previewUrl ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
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
                    <span className="text-[10px]">OCR tự động điền biển số</span>
                  </>
                )}
              </button>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <img src={previewUrl} alt="preview" className="w-full max-h-36 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                {ocrSuccess && (
                  <div className="absolute bottom-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> OCR Success
                  </div>
                )}
                <button
                  type="button"
                  onClick={clearPreview}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition"
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

            <input
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              placeholder="VD: XX-XXX-XXXX"
              className="w-full text-center font-mono text-2xl font-bold uppercase tracking-widest text-[#060606] bg-gray-50 border border-gray-200 rounded-2xl py-4 focus:outline-none focus:border-[#d7ee46] focus:bg-white transition-all shadow-sm placeholder:text-gray-300"
            />
            {ocrSuccess && (
              <p className="text-center text-[10px] text-green-600 font-semibold -mt-2">
                ✓ Biển số đã điền tự động từ ảnh — vui lòng kiểm tra lại
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !plate.trim()}
              className="w-full py-4 bg-[#d7ee46] hover:bg-[#c4dc32] text-[#060606] font-bold rounded-2xl transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4" /> Search Session
                </>
              )}
            </button>
          </form>
        )}

        {/* Step: Bill / Verification */}
        {step === 'bill' &&
          session &&
          fee &&
          (() => {
            const SERVER_URL = (
              import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'
            ).replace(/\/api\/v1\/?$/, '');
            return (
              <div className="space-y-4 py-1">
                <div className="text-center">
                  <h3 className="text-base font-bold">Xác nhận xe ra bãi</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Đối chiếu ảnh check-in trước khi xác nhận
                  </p>
                </div>

                {/* Check-in image comparison */}
                {session.checkInImage ? (
                  <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                    <div className="bg-amber-50 px-3 py-2 border-b border-amber-100 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-bold text-amber-700">
                        Ảnh Chụp Khi Check-in
                      </span>
                      <span className="ml-auto text-[10px] text-amber-500 font-medium">
                        Đối chiếu biển số
                      </span>
                    </div>
                    <img
                      src={
                        session.checkInImage.startsWith('http')
                          ? session.checkInImage
                          : `${SERVER_URL}${session.checkInImage}`
                      }
                      alt="Check-in"
                      className="w-full max-h-52 object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 gap-2">
                    <Camera className="w-8 h-8 text-gray-300" />
                    <span className="text-sm text-gray-400 font-medium">Không có ảnh check-in</span>
                  </div>
                )}

                {/* Session info */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400 font-semibold">BIỂN SỐ</span>
                    <span className="font-mono font-bold text-gray-800">
                      {session.licensePlate}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs border-t pt-2 border-gray-200">
                    <span className="text-gray-400 font-semibold">THỜI GIAN</span>
                    <span className="font-bold text-gray-800">
                      {fee.details?.durationHours ?? 0} Giờ
                    </span>
                  </div>
                  {session.slotId && (
                    <div className="flex justify-between text-xs border-t pt-2 border-gray-200">
                      <span className="text-gray-400 font-semibold">VỊ TRÍ</span>
                      <span className="font-bold text-gray-800">
                        {session.floorId?.name && `${session.floorId.name} - `}
                        {session.slotId?.code}
                      </span>
                    </div>
                  )}
                </div>

                {/* Total fee */}
                <div className="bg-[#060606] rounded-xl p-5 border border-gray-800 shadow-md">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#d7ee46] uppercase">Phí Gửi Xe</span>
                    <div className="text-2xl font-bold text-[#d7ee46] flex items-center gap-0.5 font-mono">
                      <DollarSign className="w-5 h-5 shrink-0" />
                      <span>{fee.totalFee?.toLocaleString('vi-VN')} ₫</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition shadow-sm"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="flex-1 py-4 bg-[#d7ee46] text-[#060606] font-bold rounded-2xl hover:bg-[#c4dc32] transition shadow-sm flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>Xác Nhận Check-out</>
                    )}
                  </button>
                </div>
              </div>
            );
          })()}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="space-y-4 py-1">
            <div className="text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-base font-bold">Cổng Đã Mở!</h3>
              <p className="text-xs text-gray-500 mt-1">Xe đã ra bãi thành công</p>
            </div>

            {session && fee && (
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400 font-semibold">BIỂN SỐ</span>
                    <span className="font-mono font-bold text-gray-800">
                      {session.licensePlate}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400 font-semibold">SESSION</span>
                    <span className="font-mono font-bold text-gray-600">{session.code}</span>
                  </div>
                  {session.floorId && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 font-semibold">TẦNG</span>
                      <span className="font-bold text-gray-800">
                        {session.floorId?.name ?? '—'}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400 font-semibold">GÓI</span>
                    <span className="font-bold text-gray-800">
                      {fee.details?.pricingPlanName || 'Standard Plan'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs border-t pt-2 border-gray-200">
                    <span className="text-gray-400 font-semibold">THỜI GIAN</span>
                    <span className="font-bold text-gray-800">
                      {fee.details?.durationHours ?? 0} Giờ
                    </span>
                  </div>
                </div>

                <div className="bg-[#060606] rounded-xl p-5 border border-gray-800 shadow-md">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#d7ee46] uppercase">Đã Thu</span>
                    <div className="text-2xl font-bold text-[#d7ee46] flex items-center gap-0.5 font-mono">
                      <DollarSign className="w-5 h-5 shrink-0" />
                      <span>{fee.totalFee?.toLocaleString('vi-VN')} ₫</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleReset}
              className="w-full py-4 bg-[#060606] text-white font-bold rounded-2xl hover:bg-gray-800 transition shadow-sm"
            >
              Sẵn sàng cho lượt tiếp theo
            </button>
          </div>
        )}
      </div>

      {/* Flag Exception */}
      {step !== 'success' && (
        <div className="flex justify-center mt-6">
          <button
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
