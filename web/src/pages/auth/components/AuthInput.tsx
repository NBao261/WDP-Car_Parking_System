import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ReactNode;
  hasError?: boolean;
  errorMessage?: string;
  className?: string;
}

export function AuthInput({
  label,
  icon,
  hasError,
  errorMessage,
  type,
  className,
  ...props
}: AuthInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && isPasswordVisible ? 'text' : type;

  // Determine border and shadow based on state
  let containerClasses =
    'flex items-center h-[46px] rounded-lg border-[1.5px] bg-white px-3 transition-all duration-200';

  if (hasError) {
    containerClasses += ' border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.18)]';
  } else if (isFocused) {
    containerClasses += ' border-[#9FE870] shadow-[0_0_0_3px_rgba(159,232,112,0.18)]';
  } else {
    containerClasses += ' border-[#E7E7F1]';
  }

  return (
    <div className={`flex flex-col w-full ${className || ''}`}>
      <label className="text-[12px] font-semibold text-[#062F28] mb-[6px]">{label}</label>
      <div className={containerClasses}>
        <div className="text-[#7B7B7B] mr-2 flex-shrink-0 flex items-center justify-center">
          {icon}
        </div>
        <input
          {...props}
          type={inputType}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className="flex-1 bg-transparent border-none outline-none text-[14px] text-[#060606] placeholder-[#7B7B7B] w-full"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            className="text-[#7B7B7B] hover:text-[#062F28] focus:outline-none ml-2 flex-shrink-0 transition-colors"
          >
            {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {hasError && errorMessage && (
        <span className="text-red-500 text-[11px] mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
          {errorMessage}
        </span>
      )}
    </div>
  );
}
