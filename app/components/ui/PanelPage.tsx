import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

/**
 * Modelo único de página do painel.
 * - Grid de 12 colunas com gutter fixo; por padrão todo bloco ocupa a largura inteira
 *   (informação e ação em uma coluna só).
 * - `width`: "wide" para listagens/dashboard, "readable" para formulários e detalhes.
 */
export function PanelPage({
  children,
  width = 'wide',
  className,
}: {
  children: ReactNode;
  width?: 'wide' | 'readable';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mx-auto grid w-full grid-cols-12 content-start gap-6 px-4 py-6 animate-fade-in sm:px-6 md:py-8 lg:px-8 [&>*]:col-span-12',
        width === 'wide' ? 'max-w-6xl' : 'max-w-3xl',
        className,
      )}
    >
      {children}
    </div>
  );
}
