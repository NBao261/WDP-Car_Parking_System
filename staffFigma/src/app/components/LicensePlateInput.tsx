import { InputHTMLAttributes } from 'react';

export function LicensePlateInput({ value, onChange, className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      value={value}
      onChange={(e) => {
        // Force uppercase for license plates
        const val = e.target.value.toUpperCase();
        if (onChange) {
          onChange({ ...e, target: { ...e.target, value: val } } as any);
        }
      }}
      className={`w-full font-mono text-2xl tracking-widest text-center uppercase bg-white border-2 border-gray-300 rounded-xl px-4 py-4 focus:outline-none focus:border-[#060606] focus:ring-4 focus:ring-gray-100 transition-all ${className}`}
      placeholder="e.g. 29A-123.45"
    />
  );
}