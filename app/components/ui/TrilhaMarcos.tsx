import type { TabelaNiveis } from '@/lib/types';
import { blocoAtual, ehEspecial, premioDoNivel } from '@/lib/gamificacao';
import { cn } from '@/lib/cn';

/**
 * Trilha do bloco em andamento (ex.: níveis 49–64). A tabela não tem fim, então mostra só o bloco atual.
 * Nível com prêmio: bolinha; especial: maior, com o número; sem prêmio: tracinho (conta, sem aviso).
 */
export function TrilhaMarcos({ tabela, atual }: { tabela: TabelaNiveis; atual: number }) {
  const { inicio, fim } = blocoAtual(tabela, atual);
  const niveis = Array.from({ length: fim - inicio + 1 }, (_, i) => inicio + i);

  return (
    <div>
      <div className="mb-2 text-xs tabular-nums text-ink-500">
        Bloco {inicio}–{fim}
      </div>
      <ol className="flex flex-wrap items-center gap-1.5" aria-label={`Bloco de níveis ${inicio} a ${fim}: ${Math.max(0, Math.min(atual, fim) - inicio + 1)} alcançados`}>
        {niveis.map((n) => {
          const p = premioDoNivel(tabela, n);
          const feito = n <= atual;
          const grande = !!p && ehEspecial(tabela, p);
          const proximo = n === atual + 1;
          return (
            <li
              key={n}
              title={`Nível ${n}${p ? ` · ${p.nome}` : ' · sem prêmio'}${feito ? ' (alcançado)' : ''}`}
              className={cn(
                'grid shrink-0 place-items-center rounded-full text-[9px] font-bold tabular-nums',
                !p ? 'h-1.5 w-4' : grande ? 'h-6 w-6' : 'h-4 w-4',
                feito ? (grande ? 'bg-brand-yellow text-white' : 'bg-brand-green text-white') : 'bg-line text-ink-500',
                proximo && 'ring-2 ring-brand-lime2 ring-offset-1',
              )}
            >
              {grande ? n : ''}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
