import React, { useState, useEffect } from 'react';

// format: YYYY-MM-DD
const formatDate = (date: Date) => {
  const d = new Date(date);
  const month = '' + (d.getMonth() + 1);
  const day = '' + d.getDate();
  const year = d.getFullYear();
  return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
};

const generateNext7Days = () => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    days.push({
      dateStr: formatDate(date),
      dayOfWeek: i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()],
      dayOfMonth: date.getDate()
    });
  }
  return days;
};

// generate time slots like '00:00', '00:30', '01:00' ... '23:30'
const generateTimeSlots = () => {
  const slots = [];
  for (let i = 0; i < 24; i++) {
    const hr = i.toString().padStart(2, '0');
    slots.push(`${hr}:00`);
    slots.push(`${hr}:30`);
  }
  return slots;
};

interface CustomDateTimePickerProps {
  customTime: string;
  setCustomTime: (time: string) => void;
  disabled: boolean;
}

export const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({
  customTime,
  setCustomTime,
  disabled
}) => {
  const days = generateNext7Days();
  const allTimeSlots = generateTimeSlots();

  // Parse existing customTime if any, else default to today
  const initialDate = customTime && customTime.length >= 10 ? customTime.slice(0, 10) : days[0].dateStr;
  const initialTime = customTime && customTime.length >= 16 ? customTime.slice(11, 16) : '';

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedTime, setSelectedTime] = useState(initialTime);

  // Sync internal state to parent's customTime (ISO string)
  useEffect(() => {
    if (selectedDate && selectedTime) {
      // e.g. "2026-06-27T08:30"
      const iso = `${selectedDate}T${selectedTime}`;
      if (customTime !== iso) {
        setCustomTime(iso);
      }
    }
  }, [selectedDate, selectedTime, setCustomTime, customTime]);

  const now = new Date();
  
  return (
    <div className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-4 overflow-hidden mb-2 shadow-inner">
      {/* Date Strip */}
      <div className="flex gap-2 overflow-x-auto pb-2 snap-x [&::-webkit-scrollbar]:hidden">
        {days.map((day) => {
          const isSelected = selectedDate === day.dateStr;
          return (
            <button
              key={day.dateStr}
              type="button"
              disabled={disabled}
              onClick={() => { setSelectedDate(day.dateStr); setSelectedTime(''); }}
              className={`snap-start shrink-0 w-[72px] h-[84px] rounded-2xl flex flex-col items-center justify-center transition-all ${
                isSelected 
                  ? 'bg-brand text-white shadow-md ring-2 ring-brand/20 ring-offset-1' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-brand hover:bg-brand/5 shadow-sm'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${isSelected ? 'text-white/90' : 'text-slate-400'}`}>
                {day.dayOfWeek}
              </span>
              <span className="text-2xl font-black font-outfit">{day.dayOfMonth}</span>
            </button>
          );
        })}
      </div>

      <div className="h-px bg-slate-200 w-full my-4" />

      {/* Time Grid */}
      <div className="max-h-[240px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pb-1">
          {allTimeSlots.map((time) => {
            // Disable logic: if selectedDate is today, must be at least 30 mins in future
            let isDisabled = disabled;
            if (selectedDate === days[0].dateStr) {
              const [h, m] = time.split(':').map(Number);
              const slotTime = new Date();
              slotTime.setHours(h, m, 0, 0);
              
              // 30 min buffer for today's slots
              const bufferTime = new Date(now.getTime() + 30 * 60000);
              if (slotTime < bufferTime) {
                isDisabled = true;
              }
            }

            const isSelected = selectedTime === time;

            return (
              <button
                key={time}
                type="button"
                disabled={isDisabled}
                onClick={() => setSelectedTime(time)}
                className={`py-3 rounded-xl text-sm font-bold transition-all ${
                  isDisabled 
                    ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border border-transparent' 
                    : isSelected
                      ? 'bg-brand text-white shadow-md ring-2 ring-brand/20 ring-offset-1 border border-transparent'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-brand hover:text-brand shadow-sm'
                }`}
              >
                {time}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
