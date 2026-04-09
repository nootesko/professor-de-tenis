'use client';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { Button } from './Button';

export function FormPage({
  title,
  backHref,
  children,
  onCancel,
  onSubmit,
  submitLabel = 'Salvar',
  canSubmit = true,
  step,
  submitting = false,
}: {
  title: string;
  backHref?: string;
  children: ReactNode;
  onCancel?: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  canSubmit?: boolean;
  submitting?: boolean;
  step?: { current: number; total: number };
}) {
  const router = useRouter();
  const cancel = onCancel ?? (() => router.back());
  return (
    <>
      <div className="relative flex h-16 w-full items-center border-b border-line bg-white px-4 md:px-6">
        <button
          type="button"
          onClick={() => (backHref ? router.push(backHref) : router.back())}
          className="grid h-9 w-9 place-items-center rounded-full text-brand hover:bg-brand-mint2"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="pointer-events-none absolute left-1/2 -translate-x-1/2 font-display text-[18px] font-bold text-brand">
          {title}
        </h1>
        {step && (
          <span className="ml-auto text-sm font-medium text-ink-500">
            {step.current}/{step.total}
          </span>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit && !submitting) onSubmit();
        }}
        className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 md:px-6 md:py-10 animate-fade-in"
      >
        {children}
      </form>
      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-end gap-4 border-t border-line bg-white px-6 py-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
        <button
          type="button"
          onClick={cancel}
          className="text-sm font-semibold text-brand-lime2 hover:underline"
        >
          Cancelar
        </button>
        <Button
          type="button"
          onClick={() => {
            if (canSubmit && !submitting) onSubmit();
          }}
          disabled={!canSubmit || submitting}
        >
          {submitting ? 'Salvando...' : submitLabel}
        </Button>
      </div>
    </>
  );
}
