import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('rounded-card bg-white shadow-card', className)}>{children}</div>;
}
