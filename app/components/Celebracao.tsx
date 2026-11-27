'use client';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Award, Star, Trophy } from 'lucide-react';
import type { AnimacaoConquista } from '@/lib/types';
import { Avatar } from '@/components/ui';

export type Comemoracao = {
  key: string;
  nomeAluno: string;
  avatar?: string;
  /** Nível de gamificação alcançado. */
  nivel: number;
  /** Nome do prêmio do nível, ex.: "Troféu de forehand". */
  premio: string;
  tipo?: string;
  animacao: AnimacaoConquista;
  gifUrl?: string;
};

const CORES = ['#b6cd21', '#a3e242', '#0f8445', '#edbe16', '#3aa8f5', '#ffffff'];

function rnd(i: number, k: number) {
  const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return v - Math.floor(v);
}

function Confete() {
  return (
    <div className="pdt-fx" aria-hidden="true">
      {Array.from({ length: 70 }, (_, i) => (
        <span
          key={i}
          className="pdt-confete"
          style={
            {
              left: `${rnd(i, 1) * 100}%`,
              background: CORES[i % CORES.length],
              width: 6 + rnd(i, 2) * 6,
              height: 10 + rnd(i, 3) * 8,
              animationDelay: `${rnd(i, 4) * 0.9}s`,
              animationDuration: `${2.2 + rnd(i, 5) * 1.6}s`,
              '--pdt-drift': `${(rnd(i, 6) - 0.5) * 160}px`,
              '--pdt-spin': `${(rnd(i, 7) - 0.5) * 1440}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

function Fogos() {
  const bursts = [
    { x: 22, y: 28, d: 0 },
    { x: 76, y: 22, d: 0.45 },
    { x: 50, y: 14, d: 0.9 },
    { x: 34, y: 60, d: 1.3 },
    { x: 70, y: 58, d: 1.7 },
  ];
  return (
    <div className="pdt-fx" aria-hidden="true">
      {bursts.map((b, bi) => (
        <div key={bi} className="absolute" style={{ left: `${b.x}%`, top: `${b.y}%` }}>
          {Array.from({ length: 18 }, (_, i) => (
            <span
              key={i}
              className="pdt-faisca"
              style={
                {
                  background: CORES[(bi + i) % 5],
                  animationDelay: `${b.d}s`,
                  '--pdt-a': `${(i / 18) * 360}deg`,
                  '--pdt-r': `${70 + rnd(bi, i) * 50}px`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function Estrelas() {
  return (
    <div className="pdt-fx" aria-hidden="true">
      {Array.from({ length: 26 }, (_, i) => (
        <Star
          key={i}
          className="pdt-estrela absolute fill-brand-yellow text-brand-yellow"
          size={14 + rnd(i, 1) * 22}
          style={{ left: `${rnd(i, 2) * 96}%`, top: `${rnd(i, 3) * 90}%`, animationDelay: `${rnd(i, 4) * 1.4}s` }}
        />
      ))}
    </div>
  );
}

function Icone({ tipo }: { tipo?: string }) {
  const t = (tipo ?? '').toLowerCase();
  if (t.includes('troféu') || t.includes('trofeu') || t.includes('gigante')) return <Trophy size={44} />;
  if (t.includes('estrela')) return <Star size={44} />;
  return <Award size={44} />;
}

/**
 * Fila de comemorações. Mostra uma por vez:
 * "Parabéns, [nome]! Você alcançou o nível N: [prêmio]!" com a animação do prêmio (ou o GIF cadastrado).
 */
export function Celebracao({ fila, onFim }: { fila: Comemoracao[]; onFim: () => void }) {
  const [i, setI] = useState(0);
  const btn = useRef<HTMLButtonElement>(null);
  const atual = fila[i];
  const ultimo = i >= fila.length - 1;

  useEffect(() => {
    btn.current?.focus();
  }, [i]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFim();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onFim]);

  const fx = useMemo(() => {
    if (!atual || atual.gifUrl) return null;
    if (atual.animacao === 'confete') return <Confete key={atual.key} />;
    if (atual.animacao === 'fogos') return <Fogos key={atual.key} />;
    if (atual.animacao === 'estrelas') return <Estrelas key={atual.key} />;
    return null;
  }, [atual]);

  if (!atual) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[#0b2a20]/80 p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="celebracao-titulo">
      {fx}
      <div key={`card-${atual.key}`} className="relative w-full max-w-md rounded-dialog bg-white p-8 text-center shadow-2xl animate-scale-in">
        {atual.gifUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={atual.gifUrl} alt="" className="mx-auto mb-6 max-h-48 rounded-2xl object-contain" />
        ) : (
          <div className="relative mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full bg-brand-tint text-brand-green">
            <Icone tipo={atual.tipo} />
            {atual.avatar && (
              <span className="absolute -bottom-1 -right-1 rounded-full ring-4 ring-white">
                <Avatar src={atual.avatar} alt="" size={36} />
              </span>
            )}
          </div>
        )}
        <h2 id="celebracao-titulo" className="font-display text-2xl font-bold leading-tight text-[#0b2a20]">
          Parabéns, {atual.nomeAluno.split(' ')[0]}!
        </h2>
        <p className="mt-2 text-lg text-ink-700">
          Você alcançou o <b className="tabular-nums text-ink-900">nível {atual.nivel}</b> e ganhou{' '}
          <b className="text-brand-green">{atual.premio}</b>!
        </p>
        {fila.length > 1 && (
          <p className="mt-4 text-xs tabular-nums text-ink-500">
            {i + 1} de {fila.length} conquistas
          </p>
        )}
        <div className="mt-6 flex justify-center gap-2">
          {!ultimo && (
            <button type="button" onClick={onFim} className="btn-ghost">
              Pular todas
            </button>
          )}
          <button ref={btn} type="button" onClick={() => (ultimo ? onFim() : setI(i + 1))} className="btn-primary min-w-32">
            {ultimo ? 'Concluir' : 'Próxima'}
          </button>
        </div>
      </div>
    </div>
  );
}
