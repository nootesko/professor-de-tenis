/** YYYY-MM-DD no fuso local (toISOString usa UTC e muda o dia à noite no Brasil). */
export function toLocalISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromLocalISODate(s: string): Date {
  return new Date(s + 'T00:00:00');
}

export function formatDate(s: string, opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }) {
  return fromLocalISODate(s).toLocaleDateString('pt-BR', opts);
}

export function greeting(d = new Date()): string {
  const h = d.getHours();
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}

export const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'] as const;
