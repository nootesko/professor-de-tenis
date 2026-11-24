'use client';
import { useId } from 'react';
import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

export function Select({
  label,
  children,
  error,
  required,
  ...props
}: { label?: string; error?: string; children: ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const autoId = useId();
  const id = props.id ?? autoId;
  const errId = `${id}-erro`;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="label">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <select
        {...props}
        id={id}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errId : undefined}
        className={cn('input', error && 'border-red-500 focus:border-red-500 focus:ring-red-200')}
      >
        {children}
      </select>
      {error && <p id={errId} className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
