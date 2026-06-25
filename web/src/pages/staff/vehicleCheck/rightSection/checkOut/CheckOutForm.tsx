export function CheckOutForm({
  plateIn, plate, isNoPlateVehicle, onChangePlate, handleKeyDown, step, isSubmitting, isException, isMismatch,
  searchMode, setSearchMode, setSearchInput, searchInputRef, searchInput, vehicleTypeName
}: any) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2 mt-1">
        <div className="flex flex-col gap-1">
          <label className="block text-[10px] font-semibold text-[#060606]">Biển số xe vào</label>
          <input type="text" value={plateIn} readOnly tabIndex={-1} className={`w-full h-9 text-[18px] text-center font-mono px-3 border border-[#e8e9e8] rounded-[6px] uppercase font-bold outline-none cursor-not-allowed pointer-events-none select-none ${plateIn ? 'bg-[#ECFCCB] text-[#1A202C]' : 'bg-[#fdfdfd] text-[#9b9b9b]'}`} placeholder="XXX-XX-XXXXX" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="block text-[10px] font-semibold text-[#060606]">Biển số xe ra</label>
          <input type="text" value={isNoPlateVehicle ? "KBS-AUTO" : plate} readOnly tabIndex={-1} onKeyDown={handleKeyDown} disabled={step === 'SEARCH' || isSubmitting || isNoPlateVehicle}
            className={`w-full h-9 text-[18px] text-center font-mono px-3 border rounded-[6px] uppercase font-bold outline-none transition-all duration-200 cursor-not-allowed pointer-events-none select-none
              ${(!plate && !isNoPlateVehicle) ? 'bg-[#fdfdfd] border-[#e8e9e8] text-[#9b9b9b] focus:border-[#A3E635]' : step === 'CONFIRM' ? (isNoPlateVehicle || isException ? 'bg-[#fff7ed] border-[#ea580c] text-[#ea580c] focus:border-[#c2410c]' : isMismatch ? 'bg-[#FEE2E2] border-[#EF4444] text-[#EF4444] focus:border-[#DC2626]' : 'bg-[#ECFCCB] border-[#A3E635] text-[#1A202C] focus:border-[#84CC16]') : 'bg-[#fdfdfd] border-[#e8e9e8] text-[#9b9b9b]'}`}
            placeholder="XXX-XX-XXXXX" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-1 items-end">
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-1.5 w-full overflow-hidden">
            <label className="text-[10px] font-semibold text-[#060606] whitespace-nowrap shrink-0">Mã thẻ từ/vé</label>
            <button onClick={() => { setSearchMode((m: any) => (m === 'code' ? 'plate' : 'code')); setSearchInput(''); }} className="text-[9px] text-[#2c4015] underline whitespace-nowrap hover:no-underline font-medium truncate">
              {searchMode === 'code' ? 'Khách mất thẻ? Tìm theo biển số' : 'Quay lại tìm mã thẻ'}
            </button>
          </div>
          <input ref={searchInputRef} type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value.toUpperCase())} onKeyDown={handleKeyDown} placeholder={searchMode === 'code' ? 'VD: CARD-1A2B-3C4D' : 'VD: 29A-12345'} disabled={isSubmitting || step !== 'SEARCH'}
            className="w-full h-7 px-3 border border-[#e8e9e8] bg-[#fdfdfd] rounded-[6px] text-[10px] font-medium outline-none focus:border-[#A3E635] disabled:opacity-50" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="block text-[10px] font-semibold text-[#060606]">Loại xe</label>
          <input type="text" value={vehicleTypeName} readOnly className="w-full h-7 px-3 bg-[#fdfdfd] border border-[#e8e9e8] rounded-[6px] text-[#333] text-[10px] font-medium cursor-not-allowed outline-none" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="block text-[10px] font-semibold text-[#060606]">Nhập lại biển ra</label>
          <input type="text" placeholder="F5 để nhập lại" value={plate} onChange={e => onChangePlate(e.target.value.toUpperCase())} onKeyDown={handleKeyDown} className="w-full h-7 px-3 bg-white border border-[#e8e9e8] rounded-[6px] text-[#333] text-[10px] font-medium outline-none focus:border-[#A3E635]" />
        </div>
      </div>
    </>
  );
}
