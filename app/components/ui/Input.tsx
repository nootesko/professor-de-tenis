'use client';
import { useId } from 'react';
import { cn } from '@/lib/cn';
import { applyMask, type MaskType } from './validators';

export function Input({
  label,
  className,
  error,
  required,
  ...props
}: { label?: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const autoId = useId();
  const id = props.id ?? autoId;
  const errId = `${id}-erro`;
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={id} className="label">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <input
        {...props}
        id={id}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errId : undefined}
        className={cn('input', error && 'border-red-500 focus:border-red-500 focus:ring-red-200')}
      />
      {error && <p id={errId} className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

export function MaskedInput({
  mask,
  value,
  onChange,
  ...props
}: {
  mask: MaskType;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
} & Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange'>) {
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyMask(e.target.value, mask);
    const synthetic = { ...e, target: { ...e.target, value: masked } } as React.ChangeEvent<HTMLInputElement>;
    onChange(synthetic);
  };
  return <Input {...props} value={value} onChange={handle} />;
}
