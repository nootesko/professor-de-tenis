import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

/** Superfície base: branco, borda fina, sem sombra. */
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('rounded-card border border-line-strong bg-white', className)}>{children}</div>;
}
