'use client';
import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

export function Select({
  label,
  children,
  error,
  required,
  ...props
}: { label?: string; error?: string; children: ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="w-full">
      {label && (
        <label className="label">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <select
        {...props}
        aria-invalid={!!error}
        className={cn('input', error && 'border-red-500 focus:border-red-500 focus:ring-red-200')}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
