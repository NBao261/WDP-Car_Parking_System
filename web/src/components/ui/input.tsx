import * as React from 'react';
import { cn } from '../../lib/utils';

/**
 * Input — matches the Figma pattern:
 *   bg-input-bg border border-gray-200 rounded-xl
 *   focus:ring-2 focus:ring-accent focus:border-transparent
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-xl border border-gray-200 bg-input-bg px-4 py-2.5 text-sm font-normal text-brand transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
