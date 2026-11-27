'use client';
import { Star, X } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Nota de 0 a 5 em estrelas para um critério.
 * `undefined` = em branco (não entra na média). 0 é uma nota válida, diferente de branco.
 * Clicar de novo na nota escolhida volta para em branco.
 */
export function NotaCriterio({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
}) {
  const set = (v: number) => onChange(value === v ? undefined : v);
  return (
    <div className="flex items-center gap-3">
      <span className="min-w-0 flex-1 truncate text-sm text-ink-900">{label}</span>
      <div role="radiogroup" aria-label={`Nota de ${label}`} className="flex items-center gap-0.5">
        <button
          type="button"
          role="radio"
          aria-checked={value === 0}
          aria-label="Nota 0"
          onClick={() => set(0)}
          className={cn(
            'mr-1 grid h-7 min-w-7 place-items-center rounded-full px-1.5 text-xs font-semibold tabular-nums transition-colors',
            value === 0 ? 'bg-ink-900 text-white' : 'bg-soft text-ink-500 hover:bg-line',
          )}
        >
          0
        </button>
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`Nota ${i}`}
            onClick={() => set(i)}
            className="grid h-8 w-7 place-items-center transition-transform duration-150 hover:scale-110 active:scale-95"
          >
            <Star
              size={20}
              className={cn(
                'transition-colors duration-150',
                value != null && i <= value ? 'fill-brand-yellow text-brand-yellow' : 'text-ink-300',
              )}
            />
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange(undefined)}
          aria-label={`Deixar ${label} em branco`}
          disabled={value === undefined}
          className="ml-1 grid h-7 w-7 place-items-center rounded-full text-ink-300 transition-colors hover:bg-soft hover:text-ink-700 disabled:invisible"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
