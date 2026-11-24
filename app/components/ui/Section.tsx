import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

/**
 * Bloco de conteúdo de largura total. Título + descrição à esquerda, ação opcional à direita.
 * `flush` remove o padding do corpo para listas com divisórias (use <ListRow />).
 */
export function Section({
  title,
  description,
  action,
  children,
  flush = false,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  flush?: boolean;
  className?: string;
}) {
  return (
    <section className={cn('overflow-hidden rounded-card border border-line-strong bg-white', className)}>
      {(title || action) && (
        <div className={cn('flex flex-wrap items-center justify-between gap-3 px-5 pt-5 sm:px-6', flush ? 'pb-4' : 'pb-1')}>
          <div className="min-w-0">
            {title && <h2 className="font-display text-base font-bold text-brand">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-ink-500">{description}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={flush ? 'divide-y divide-line border-t border-line' : 'px-5 pb-5 pt-4 sm:px-6 sm:pb-6'}>{children}</div>
    </section>
  );
}

/** Linha de lista dentro de uma Section flush. */
export function ListRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex min-h-16 items-center gap-4 px-5 py-3 sm:px-6', className)}>{children}</div>;
}

/** Linha "rótulo → valor" para dados de um registro (uma coluna, sem dividir a tela). */
export function InfoRow({ label, icon, children }: { label: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-14 items-center gap-4 px-5 py-3 sm:px-6">
      <span className="flex w-28 shrink-0 items-center gap-2 text-sm text-ink-500 sm:w-40">
        {icon && <span className="text-brand">{icon}</span>}
        {label}
      </span>
      <span className="min-w-0 flex-1 break-words text-sm font-medium text-ink-900">{children}</span>
    </div>
  );
}
