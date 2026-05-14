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
        success: 'bg-green-50 text-green-700',
        warning: 'bg-orange-100 text-orange-700',
        destructive: 'bg-red-50 text-red-700',
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
