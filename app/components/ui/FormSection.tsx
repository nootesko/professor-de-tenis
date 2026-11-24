import type { ReactNode } from 'react';

/** Seção de formulário: campos sempre em uma coluna. */
export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-card border border-line-strong bg-white p-5 sm:p-6">
      <h2 className="font-display text-base font-bold text-brand">{title}</h2>
      {description && <p className="mt-0.5 text-xs text-ink-500">{description}</p>}
      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </section>
  );
}
