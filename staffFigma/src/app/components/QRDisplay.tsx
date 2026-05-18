import { QrCode, Printer } from 'lucide-react';

interface QRDisplayProps {
  value: string;
  subtitle?: string;
  onPrint?: () => void;
}

export function QRDisplay({ value, subtitle, onPrint }: QRDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-xl shadow-sm w-full relative overflow-hidden">
      {/* Ticket styling accents */}
      <div className="absolute -left-3 top-1/2 w-6 h-6 bg-[#f4f5f4] rounded-full transform -translate-y-1/2 border-r border-gray-200" />
      <div className="absolute -right-3 top-1/2 w-6 h-6 bg-[#f4f5f4] rounded-full transform -translate-y-1/2 border-l border-gray-200" />
      <div className="w-full border-t-2 border-dashed border-gray-200 absolute top-1/2 left-0 -z-10" />

      <div className="bg-white px-6 py-4 flex flex-col items-center">
        <div className="w-32 h-32 bg-white flex items-center justify-center rounded-xl border border-gray-200 mb-3 shadow-sm">
          <QrCode className="w-24 h-24 text-[#060606]" strokeWidth={1.5} />
        </div>
        <span className="font-mono text-base font-bold tracking-widest bg-gray-100 px-3 py-1 rounded-md">{value}</span>
        {subtitle && <span className="text-sm text-[#060606]/60 mt-2 font-medium">{subtitle}</span>}
      </div>

      {onPrint && (
        <button 
          onClick={onPrint}
          className="mt-4 flex items-center gap-2 text-sm font-medium text-[#060606] hover:text-gray-600 transition-colors"
        >
          <Printer className="w-4 h-4" /> Print Physical Ticket
        </button>
      )}
    </div>
  );
}