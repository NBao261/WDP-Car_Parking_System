import { X } from 'lucide-react';
import { ExceptionData } from './ExceptionsList';
import { ExceptionDetailCheckOutBlock } from './ExceptionDetailCheckOutBlock';

interface ExceptionCheckOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedException: ExceptionData | null;
  onCheckOutSuccess: () => void;
}

export function ExceptionCheckOutModal({
  isOpen,
  onClose,
  selectedException,
  onCheckOutSuccess,
}: ExceptionCheckOutModalProps) {
  if (!isOpen || !selectedException) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[450px] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-[#e8e9e8] flex justify-between items-center bg-gray-50/50">
          <h3 className="text-[18px] font-bold text-gray-900">Thu phí Check-out</h3>
          <button
            onClick={onClose}
            className="text-[#6b6b6b] hover:text-black p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 font-medium">Biển số</p>
              <p className="font-bold text-gray-900">
                {selectedException.actualPlate ||
                  selectedException.expectedPlate ||
                  selectedException.plate ||
                  '—'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 font-medium">Sự cố</p>
              <p className="font-bold text-gray-900">{selectedException.type}</p>
            </div>
          </div>

          <ExceptionDetailCheckOutBlock
            selectedException={selectedException}
            onCheckOutSuccess={() => {
              onCheckOutSuccess();
              setTimeout(onClose, 2000); // Close automatically after success
            }}
          />
        </div>
      </div>
    </div>
  );
}
