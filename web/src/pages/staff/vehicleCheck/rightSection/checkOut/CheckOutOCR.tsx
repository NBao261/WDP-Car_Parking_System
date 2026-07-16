import { ImagePlus, RefreshCw, X } from 'lucide-react';

export function CheckOutOCR({
  step,
  isMismatch,
  isNoPlateVehicle,
  currentSession,
  ocrPreviewUrl,
  isUploading,
  fileInputRef,
  clearOcrPreview,
  handleImageUpload,
}: any) {
  return (
    <div className="flex gap-3 relative shrink-0">
      {step === 'CONFIRM' && !isMismatch && !isNoPlateVehicle && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#A3E635] text-[#1A202C] px-4 py-1 rounded-[4px] font-bold text-[12px] z-10 shadow-sm border border-[#84CC16]">
          Khớp
        </div>
      )}
      {step === 'CONFIRM' && isMismatch && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#EF4444] text-white px-4 py-1 rounded-[4px] font-bold text-[12px] z-10 shadow-sm border border-[#DC2626]">
          Không khớp
        </div>
      )}

      <div className="flex-1 flex flex-col gap-1.5 min-h-0">
        <label className="block text-[10px] font-semibold text-[#6b6b6b]">Ảnh biển số vào</label>
        <div className="h-[210px] w-full border border-dashed border-[#999] rounded-[6px] flex flex-col items-center justify-center gap-2 bg-[#fdfdfd] overflow-hidden relative">
          {currentSession?.checkInImage ? (
            (() => {
              const SERVER_URL = (
                import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'
              ).replace(/\/api\/v1\/?$/, '');
              let imgSrc = currentSession.checkInImage;
              if (!imgSrc.startsWith('http')) {
                imgSrc = `${SERVER_URL}${imgSrc.startsWith('/') ? imgSrc : `/${imgSrc}`}`;
              }
              return <img src={imgSrc} alt="check-in" className="w-full h-full object-contain" />;
            })()
          ) : (
            <div className="flex flex-col items-center">
              <img src="/Logo_chu.png" alt="LYNC PARK" className="h-24 mb-2 object-contain" />
              <ImagePlus className="w-4 h-4 text-[#6b6b6b] mb-2" />
              <span className="text-[10px] font-semibold text-[#6b6b6b]">Ảnh biển số (OCR)</span>
              <span className="text-[9px] text-[#aaa]">Chưa có dữ liệu</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-1.5 relative min-h-0">
        <label className="block text-[10px] font-semibold text-[#6b6b6b]">Ảnh biển số ra</label>
        {!ocrPreviewUrl ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="h-[210px] w-full border border-dashed border-[#999] rounded-[6px] flex flex-col items-center justify-center gap-2 hover:border-[#A3E635] hover:bg-[#ECFCCB] transition-all duration-200 disabled:opacity-60 bg-[#fcfcfc]"
          >
            {isUploading ? (
              <RefreshCw className="w-6 h-6 animate-spin text-[#8bc34a]" />
            ) : (
              <div className="flex flex-col items-center">
                <img src="/Logo_chu.png" alt="LYNC PARK" className="h-24 mb-2 object-contain" />
                <ImagePlus className="w-4 h-4 text-[#aaa] mb-2" />
                <span className="text-[10px] font-semibold text-[#6b6b6b]">
                  Chụp / Upload ảnh biển số (OCR)
                </span>
                <span className="text-[9px] text-[#aaa]">
                  Hỗ trợ JPG, PNG — chụp thẳng góc, đủ sáng
                </span>
              </div>
            )}
          </button>
        ) : (
          <div className="relative border border-[#e8e9e8] rounded-[6px] overflow-hidden h-[200px] bg-[#f5f5f4]">
            <img src={ocrPreviewUrl} alt="preview" className="w-full h-full object-contain" />
            <button
              type="button"
              onClick={clearOcrPreview}
              className="absolute top-2 right-2 w-6 h-6 bg-black/70 text-white rounded-full flex items-center justify-center"
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
      </div>
    </div>
  );
}
