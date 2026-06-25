import React, { useRef } from 'react';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
}

export function OTPInput({ value, onChange, hasError }: OTPInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (/[^0-9]/.test(val)) return; // Allow only numeric characters

    const char = val.slice(-1); // In case multiple characters are pasted/typed

    let newValueArray = value.padEnd(6, ' ').split('');
    newValueArray[index] = char || ' ';

    const finalValue = newValueArray.join('').substring(0, 6);
    onChange(finalValue.trimEnd());

    // Move focus to next input
    if (char && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      let newValueArray = value.padEnd(6, ' ').split('');

      if (newValueArray[index] !== ' ') {
        newValueArray[index] = ' ';
        onChange(newValueArray.join('').trimEnd());
      } else if (index > 0) {
        inputs.current[index - 1]?.focus();
        newValueArray[index - 1] = ' ';
        onChange(newValueArray.join('').trimEnd());
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData('text/plain')
      .replace(/[^0-9]/g, '')
      .slice(0, 6);
    if (pastedData) {
      onChange(pastedData);
      const nextIndex = Math.min(pastedData.length, 5);
      inputs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="flex justify-between gap-2 w-full">
      {[0, 1, 2, 3, 4, 5].map((index) => {
        let inputClasses =
          'w-[40px] h-[46px] sm:w-[46px] sm:h-[46px] text-center font-bold text-[18px] text-[#062F28] rounded-lg border-[1.5px] outline-none transition-all duration-200 bg-white ';
        if (hasError) {
          inputClasses +=
            'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.18)] focus:border-red-500';
        } else {
          inputClasses +=
            'border-[#E7E7F1] focus:border-[#9FE870] focus:shadow-[0_0_0_3px_rgba(159,232,112,0.18)]';
        }

        return (
          <input
            key={index}
            ref={(el) => (inputs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] && value[index] !== ' ' ? value[index] : ''}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className={inputClasses}
          />
        );
      })}
    </div>
  );
}
