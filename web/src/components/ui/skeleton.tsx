import { cn } from '../../lib/utils';

/**
 * Skeleton — loading placeholder that mimics content shape.
 * Used for loading states across Dashboard KPI cards, Tables, and Charts.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-lg bg-gray-200', className)} {...props} />;
}

export { Skeleton };
