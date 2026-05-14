import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with conflict resolution.
 * This is the standard shadcn/ui pattern: clsx for conditional classes + tailwind-merge for deduplication.
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-brand text-white', className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
