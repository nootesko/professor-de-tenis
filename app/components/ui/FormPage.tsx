'use client';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { Button } from './Button';
import { PanelPage } from './PanelPage';

/**
 * Formulário dentro do shell do painel: coluna única de leitura (max-w-3xl),
 * seções empilhadas e barra de ações fixa no rodapé da área de conteúdo.
 */
export function FormPage({
  title,
  description,
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
  description?: ReactNode;
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
  const back = () => (backHref ? router.push(backHref) : router.back());
  const cancel = onCancel ?? back;
  const submit = () => {
    if (canSubmit && !submitting) onSubmit();
  };
  return (
    <>
      <form
        id="form-page"
        className="flex-1"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <PanelPage width="readable">
          <header>
            <button
              type="button"
              onClick={back}
              className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition hover:text-brand"
            >
              <ArrowLeft size={14} /> Voltar
            </button>
            <div className="flex items-end justify-between gap-4">
              <h1 className="h-page">{title}</h1>
              {step && (
                <span className="caps shrink-0" aria-label={`Etapa ${step.current} de ${step.total}`}>
                  Etapa {step.current} de {step.total}
                </span>
              )}
            </div>
            {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
            {step && (
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-line" aria-hidden>
                <div className="h-full bg-brand transition-all" style={{ width: `${(step.current / step.total) * 100}%` }} />
              </div>
            )}
          </header>
          {children}
        </PanelPage>
      </form>
      <div className="sticky bottom-0 z-10 border-t border-line-strong bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-end gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Button type="button" variant="ghost" onClick={cancel}>
            Cancelar
          </Button>
          <Button type="submit" form="form-page" disabled={!canSubmit || submitting}>
            {submitting ? 'Salvando...' : submitLabel}
          </Button>
        </div>
      </div>
    </>
  );
}
