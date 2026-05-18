import { Car, MapPin, Clock, ArrowRightCircle } from 'lucide-react';

interface SessionCardProps {
  plate: string;
  type: string;
  zone: string;
  gate: string;
  time: string;
  sessionId?: string;
}

export function SessionCard({ plate, type, zone, gate, time, sessionId }: SessionCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm w-full">
      <div className="flex justify-between items-start border-b border-gray-100 pb-4">
        <div>
          <span className="block text-xs text-[#060606]/50 mb-0.5 uppercase tracking-wider font-semibold">License Plate</span>
          <span className="font-mono text-2xl font-bold text-[#060606]">{plate || "N/A"}</span>
        </div>
        {sessionId && (
          <div className="text-right">
            <span className="block text-xs text-[#060606]/50 mb-0.5">Session ID</span>
            <span className="font-mono text-sm font-medium">{sessionId}</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
        <div>
          <span className="block text-[#060606]/50 mb-1 text-xs">Vehicle Type</span>
          <span className="font-medium flex items-center gap-1.5 text-[#060606]">
            <Car className="w-4 h-4 text-[#060606]/60"/> {type}
          </span>
        </div>
        <div>
          <span className="block text-[#060606]/50 mb-1 text-xs">Assigned Zone</span>
          <span className="font-medium flex items-center gap-1.5 text-[#060606]">
            <MapPin className="w-4 h-4 text-[#060606]/60"/> {zone}
          </span>
        </div>
        <div>
          <span className="block text-[#060606]/50 mb-1 text-xs">Gate</span>
          <span className="font-medium flex items-center gap-1.5 text-[#060606]">
            <ArrowRightCircle className="w-4 h-4 text-[#060606]/60"/> {gate}
          </span>
        </div>
        <div>
          <span className="block text-[#060606]/50 mb-1 text-xs">Time</span>
          <span className="font-medium flex items-center gap-1.5 text-[#060606]">
            <Clock className="w-4 h-4 text-[#060606]/60"/> {time}
          </span>
        </div>
      </div>
    </div>
  );
}