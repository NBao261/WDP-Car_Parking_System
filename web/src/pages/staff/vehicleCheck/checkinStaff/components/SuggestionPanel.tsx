import { MapPin, RefreshCw } from "lucide-react";

interface SuggestionPanelProps {
  suggestedFloors: any[];
  loading: boolean;
  onSelectFloor: (floorId: string) => void;
  onCancel: () => void;
}

export default function SuggestionPanel({
  suggestedFloors,
  loading,
  onSelectFloor,
  onCancel
}: SuggestionPanelProps) {
  return (
    <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#060606] flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-[#d7ee46] fill-[#d7ee46]" /> 
          Suggested Zones
        </h3>
        <button onClick={onCancel} className="text-xs text-blue-600 hover:underline">Cancel</button>
      </div>
      
      {suggestedFloors.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {suggestedFloors.map((floor, idx) => (
            <button 
              key={floor.floorId}
              onClick={() => onSelectFloor(floor.floorId)}
              disabled={loading}
              className={`flex flex-col items-start p-3 border-2 rounded-xl text-left transition-all relative overflow-hidden ${
                idx === 0 
                  ? "border-[#d7ee46] bg-[#fcfee8] hover:bg-[#f4faaf]" 
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {idx === 0 && (
                <div className="absolute top-0 right-0 bg-[#d7ee46] text-[#060606] text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                  BEST MATCH
                </div>
              )}
              <span className="font-bold text-sm text-[#060606] mb-1 truncate w-full pr-8">{floor.floorName}</span>
              <span className="text-xs font-semibold text-gray-500">Available: {floor.availableSlots} / {floor.totalSlots} slots</span>
            </button>
          ))}
        </div>
      ) : (
         <div className="text-sm text-gray-500 italic p-4 text-center border rounded-xl">Không có khu vực nào trống.</div>
      )}
      
      {loading && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-2xl z-10">
           <RefreshCw className="w-6 h-6 animate-spin text-[#060606]" />
        </div>
      )}
    </div>
  );
}
