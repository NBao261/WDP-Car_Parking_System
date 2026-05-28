import { cn } from '../../lib/utils';

interface LoadingStateProps {
  rows?: number;
  cols?: number;
  className?: string;
}

/**
 * LoadingState — Skeleton loader cho table/card.
 */
export function LoadingState({ rows = 5, cols = 4, className }: LoadingStateProps) {
  return (
    <div className={cn('animate-pulse space-y-3', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className="h-4 bg-[#f0f1f0] rounded flex-1"
              style={{ opacity: 1 - i * 0.12 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface CardSkeletonProps {
  count?: number;
  className?: string;
}

/**
 * CardSkeleton — Skeleton loader cho grid of stat cards.
 */
export function CardSkeleton({ count = 4, className }: CardSkeletonProps) {
  return (
    <div className={cn(`grid gap-4`, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-[#e8e9e8] p-5 animate-pulse">
          <div className="h-3 bg-[#f0f1f0] rounded w-2/3 mb-4" />
          <div className="h-7 bg-[#f0f1f0] rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
