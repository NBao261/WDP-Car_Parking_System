import React from 'react';
import { Car, CarFront, Bike, Truck, Hash } from 'lucide-react';
import { QuickTimeSelector } from './QuickTimeSelector';
import { formatLicensePlate } from '../hooks/useReservation';

const getVehicleIcon = (name: string, isSelected: boolean) => {
  const lowerName = name.toLowerCase();
  const className = isSelected ? 'text-brand' : 'text-slate-400';

  if (lowerName.includes('máy') || lowerName.includes('moto'))
    return <Bike size={32} className={className} />;
  if (lowerName.includes('đạp')) return <Bike size={32} className={className} />;
  if (lowerName.includes('tải') || lowerName.includes('truck'))
    return <Truck size={32} className={className} />;
  if (lowerName.includes('7')) return <CarFront size={32} className={className} />;
  return <Car size={32} className={className} />;
};

interface BookingFormProps {
  uniqueVehicleTypes: any[];
  vehicleTypeId: string;
  setVehicleTypeId: (id: string) => void;
  licensePlate: string;
  setLicensePlate: (plate: string) => void;
  timeMode: '30m' | '1h' | '2h' | 'custom';
  setTimeMode: (mode: '30m' | '1h' | '2h' | 'custom') => void;
  customTime: string;
  setCustomTime: (time: string) => void;
  isTimeValid: () => boolean;
  handleSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  uniqueVehicleTypes,
  vehicleTypeId,
  setVehicleTypeId,
  licensePlate,
  setLicensePlate,
  timeMode,
  setTimeMode,
  customTime,
  setCustomTime,
  isTimeValid,
  handleSubmit,
  isSubmitting,
}) => {
  return (
    <div className="bg-white border-2 border-slate-100/50 rounded-3xl p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-8 pb-5 border-b border-slate-100">
        <div className="w-1.5 h-6 bg-accent rounded-full"></div>
        <h3 className="text-xl md:text-2xl font-extrabold text-slate-900">Thông tin đăng ký</h3>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(e);
        }}
        className="flex flex-col gap-8"
      >
        {/* LOẠI XE */}
        <div>
          <label className="text-slate-800 text-sm font-bold mb-4 flex items-center gap-2">
            <Car size={18} className="text-accent-dark" /> Chọn loại xe của bạn
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
            {uniqueVehicleTypes.map((vt) => {
              const isSelected = vehicleTypeId === vt._id;
              return (
                <div
                  key={vt._id}
                  onClick={() => !isSubmitting && setVehicleTypeId(vt._id)}
                  className={`border-2 rounded-2xl p-4 transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
                    isSubmitting
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer hover:-translate-y-1'
                  } ${
                    isSelected
                      ? 'border-accent bg-accent/10 shadow-lg shadow-accent/10 text-brand ring-4 ring-accent/20'
                      : 'border-slate-100 bg-slate-50/50 hover:border-accent/40 hover:bg-white hover:shadow-md'
                  }`}
                >
                  {getVehicleIcon(vt.name, isSelected)}
                  <span
                    className={`text-sm md:text-base font-bold tracking-tight ${isSelected ? 'text-brand' : 'text-slate-500'}`}
                  >
                    {vt.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* BIỂN SỐ XE */}
        <div>
          <label className="text-slate-800 text-sm font-bold mb-4 flex items-center gap-2">
            <Hash size={18} className="text-accent-dark" /> Biển số xe
          </label>
          <input
            data-testid="license-plate-input"
            type="text"
            value={licensePlate}
            onChange={(e) => setLicensePlate(formatLicensePlate(e.target.value))}
            placeholder="VD: 51H-12345"
            disabled={isSubmitting}
            className={`w-full bg-slate-50 border-2 border-slate-200 hover:border-accent/60 rounded-2xl px-5 py-4 text-brand focus:outline-none focus:bg-white focus:ring-4 focus:ring-accent/20 focus:border-accent transition-all duration-300 font-mono text-xl md:text-2xl tracking-[0.2em] uppercase font-bold placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-medium ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            required
          />
        </div>

        {/* THỜI GIAN */}
        <QuickTimeSelector
          timeMode={timeMode}
          setTimeMode={setTimeMode}
          customTime={customTime}
          setCustomTime={setCustomTime}
          isTimeValid={isTimeValid}
          isSubmitting={isSubmitting}
        />
      </form>
    </div>
  );
};
