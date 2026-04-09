import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

export function Badge({
  children,
  color = 'mint',
}: {
  children: ReactNode;
  color?: 'mint' | 'lime' | 'yellow' | 'red';
}) {
  const c =
    color === 'lime'
      ? 'bg-brand-tint text-brand-dark'
      : color === 'yellow'
        ? 'bg-yellow-100 text-yellow-800'
        : color === 'red'
          ? 'bg-red-100 text-red-700'
          : 'bg-brand-mint2 text-brand';
  return (
    <span className={cn('inline-flex items-center rounded-pill px-3 py-1 text-xs font-medium', c)}>{children}</span>
  );
}
