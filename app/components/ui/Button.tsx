'use client';
import { cn } from '@/lib/cn';
import { forwardRef, type ReactNode } from 'react';

export const buttonVariants = {
  primary: 'bg-brand-lime text-brand-dark hover:brightness-95',
  outline: 'border border-line-strong bg-white text-ink-900 hover:bg-soft hover:border-brand',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-ink-700 hover:bg-soft',
} as const;

export const buttonBase =
  'inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-pill px-5 text-sm font-semibold transition-colors duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2';

type ButtonProps = {
  children: ReactNode;
  variant?: keyof typeof buttonVariants;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, variant = 'primary', type = 'button', className, ...props },
  ref,
) {
  return (
    <button ref={ref} {...props} type={type} className={cn(buttonBase, buttonVariants[variant], className)}>
      {children}
    </button>
  );
});
