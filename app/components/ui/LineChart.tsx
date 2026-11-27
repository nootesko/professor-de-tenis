'use client';
import { useEffect, useRef, useState } from 'react';
import { formatDate } from '@/lib/date';

export type Ponto = { data: string; valor: number | null };

/**
 * Linha única de 0 a `max` ao longo do tempo (uma série por gráfico, sem legenda: o título nomeia).
 * Crosshair + tooltip no hover/toque; tabela acessível para leitores de tela.
 * Valores `null` (aula sem nota) quebram a linha em vez de virar zero.
 */
export function LineChart({
  titulo,
  pontos,
  max = 5,
  altura = 160,
  formatar = (v: number) => v.toFixed(1).replace('.', ','),
}: {
  titulo: string;
  pontos: Ponto[];
  max?: number;
  altura?: number;
  formatar?: (v: number) => string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(600);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(240, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pad = { t: 12, r: 12, b: 24, l: 28 };
  const iw = w - pad.l - pad.r;
  const ih = altura - pad.t - pad.b;
  const n = pontos.length;
  const x = (i: number) => pad.l + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw);
  const y = (v: number) => pad.t + ih - (v / max) * ih;

  // Segmentos contínuos (quebra onde não houve nota).
  const segs: string[] = [];
  let cur = '';
  pontos.forEach((p, i) => {
    if (p.valor == null) {
      if (cur) segs.push(cur);
      cur = '';
      return;
    }
    cur += `${cur ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.valor).toFixed(1)}`;
  });
  if (cur) segs.push(cur);

  const ticksX = n <= 1 ? [0] : Array.from(new Set([0, Math.round((n - 1) / 2), n - 1]));
  const validos = pontos.filter((p) => p.valor != null);
  const ultimo = validos[validos.length - 1];

  const onMove = (clientX: number) => {
    const el = ref.current;
    if (!el || n === 0) return;
    const rx = clientX - el.getBoundingClientRect().left - pad.l;
    const i = n <= 1 ? 0 : Math.round((rx / iw) * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, i)));
  };

  const hp = hover != null ? pontos[hover] : null;

  return (
    <figure className="m-0">
      <figcaption className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-ink-900">{titulo}</span>
        <span className="text-xs tabular-nums text-ink-500">
          {ultimo?.valor != null ? <>última: <b className="font-semibold text-ink-900">{formatar(ultimo.valor)}</b></> : 'sem notas no período'}
        </span>
      </figcaption>
      <div
        ref={ref}
        className="relative touch-pan-y select-none"
        onMouseMove={(e) => onMove(e.clientX)}
        onMouseLeave={() => setHover(null)}
        onTouchStart={(e) => onMove(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={() => setHover(null)}
      >
        <svg width={w} height={altura} role="img" aria-label={`${titulo}: ${validos.length} aulas com nota`} className="block overflow-visible">
          {Array.from({ length: max + 1 }, (_, v) => (
            <g key={v}>
              <line x1={pad.l} x2={w - pad.r} y1={y(v)} y2={y(v)} stroke="rgba(16,40,35,0.08)" strokeWidth={1} />
              {v % (max > 5 ? 2 : 1) === 0 && (
                <text x={pad.l - 8} y={y(v)} dy="0.35em" textAnchor="end" className="fill-ink-500 text-[10px] tabular-nums">
                  {v}
                </text>
              )}
            </g>
          ))}
          {n > 0 &&
            ticksX.map((i) => (
              <text
                key={i}
                x={x(i)}
                y={altura - 6}
                textAnchor={i === 0 && n > 1 ? 'start' : i === n - 1 && n > 1 ? 'end' : 'middle'}
                className="fill-ink-500 text-[10px]"
              >
                {formatDate(pontos[i].data, { day: '2-digit', month: 'short' })}
              </text>
            ))}
          {segs.map((d, k) => (
            <path key={k} d={d} fill="none" stroke="#0f8445" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          ))}
          {/* Pontos isolados (sem vizinho) ficam visíveis como marcador. */}
          {pontos.map((p, i) =>
            p.valor != null && pontos[i - 1]?.valor == null && pontos[i + 1]?.valor == null ? (
              <circle key={i} cx={x(i)} cy={y(p.valor)} r={3} fill="#0f8445" />
            ) : null,
          )}
          {hp && hover != null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + ih} stroke="rgba(16,40,35,0.25)" strokeWidth={1} />
              {hp.valor != null && <circle cx={x(hover)} cy={y(hp.valor)} r={5} fill="#0f8445" stroke="#fff" strokeWidth={2} />}
            </g>
          )}
        </svg>
        {hp && hover != null && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#0b2a20] px-2.5 py-1.5 text-xs text-white shadow-card"
            style={{
              left: Math.min(Math.max(x(hover), 60), w - 60),
              // Fica do lado oposto ao ponto para não cobri-lo.
              ...(hp.valor != null && hp.valor > max / 2 ? { bottom: pad.b + 4 } : { top: 0 }),
            }}
          >
            <div className="text-white/70">{formatDate(hp.data, { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div className="font-semibold tabular-nums">{hp.valor != null ? formatar(hp.valor) : 'sem nota'}</div>
          </div>
        )}
      </div>
      <table className="sr-only">
        <caption>{titulo}</caption>
        <thead>
          <tr>
            <th>Data</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          {pontos.map((p) => (
            <tr key={p.data}>
              <td>{formatDate(p.data)}</td>
              <td>{p.valor != null ? formatar(p.valor) : 'sem nota'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
