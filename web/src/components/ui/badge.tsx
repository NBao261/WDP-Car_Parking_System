import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * Badge variants — matches status patterns used across Dashboard, Users, and Vehicles pages.
 *
 * Examples from Figma:
 *   Active   → bg-green-50 text-green-700
 *   Offline  → bg-gray-100 text-gray-700
 *   Locked   → bg-red-50 text-red-700
 *   In       → bg-blue-50 text-blue-700
 *   Charging → bg-accent/20 text-accent-darker
 */
const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-brand text-white',
        secondary: 'bg-gray-100 text-gray-700',
        success: 'bg-[#dbeafe] text-[#1e40af] border border-[#93c5fd]/60',
        warning: 'bg-[#fef3c7] text-[#92400e] border border-[#fcd34d]/60',
        destructive: 'bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5]/60',
        info: 'bg-blue-50 text-blue-700',
        accent: 'bg-accent/20 text-accent-darker',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

/**
 * Badge component — used for status indicators, tags, and labels.
 * Provides semantic color coding for different states.
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
