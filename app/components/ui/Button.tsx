'use client';
import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

export function Button({
  children,
  variant = 'primary',
  className,
  ...props
}: {
  children: ReactNode;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const v =
    variant === 'primary'
      ? 'bg-brand-lime text-brand-dark hover:brightness-95 hover:shadow-md hover:-translate-y-0.5'
      : variant === 'outline'
        ? 'border border-line bg-white text-ink-700 hover:bg-brand-mint2 hover:border-brand hover:-translate-y-0.5 hover:shadow-sm'
        : variant === 'danger'
          ? 'bg-red-500 text-white hover:bg-red-600 hover:shadow-md hover:-translate-y-0.5'
          : 'text-ink-700 hover:bg-brand-mint2';
  return (
    <button
      {...props}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-pill px-5 py-2.5 text-sm font-semibold transition-all duration-200 ease-out active:translate-y-0 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        v,
        className,
      )}
    >
      {children}
    </button>
  );
}
