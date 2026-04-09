export type MaskType = 'cpf' | 'phone' | 'cep' | 'date' | 'time' | 'none';

export function applyMask(value: string, mask: MaskType): string {
  const v = (value ?? '').replace(/\D/g, '');
  switch (mask) {
    case 'cpf':
      return v
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    case 'phone': {
      const s = v.slice(0, 11);
      if (s.length <= 10) {
        return s.replace(/(\d{0,2})(\d{0,4})(\d{0,4}).*/, (_, a, b, c) =>
          [a && `(${a}`, a && a.length === 2 ? ') ' : '', b, c && `-${c}`].filter(Boolean).join(''),
        );
      }
      return s.replace(/(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3').replace(/-$/, '');
    }
    case 'cep':
      return v.slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
    case 'date':
      return v
        .slice(0, 8)
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\d{2})(\d)/, '$1/$2');
    case 'time':
      return v.slice(0, 4).replace(/(\d{2})(\d)/, '$1:$2');
    default:
      return value;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type Validator = (value: string) => string | null;

export const validators = {
  required:
    (msg = 'Campo obrigatório'): Validator =>
    (v) =>
      v && String(v).trim().length > 0 ? null : msg,
  minLen:
    (n: number, msg?: string): Validator =>
    (v) =>
      String(v ?? '').trim().length >= n ? null : msg ?? `Mínimo ${n} caracteres`,
  email: (): Validator => (v) => (!v || EMAIL_RE.test(v) ? null : 'E-mail inválido'),
  cpf: (): Validator => (v) => {
    if (!v) return null;
    const digits = v.replace(/\D/g, '');
    return digits.length === 11 ? null : 'CPF incompleto';
  },
  phone: (): Validator => (v) => {
    if (!v) return null;
    const d = v.replace(/\D/g, '');
    return d.length >= 10 && d.length <= 11 ? null : 'Telefone incompleto';
  },
  cep: (): Validator => (v) => {
    if (!v) return null;
    return v.replace(/\D/g, '').length === 8 ? null : 'CEP incompleto';
  },
  dateBR: (): Validator => (v) => {
    if (!v) return null;
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
    if (!m) return 'Data inválida';
    const [, dd, mm, yyyy] = m;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return d.getFullYear() === Number(yyyy) && d.getMonth() === Number(mm) - 1 && d.getDate() === Number(dd)
      ? null
      : 'Data inválida';
  },
  time: (): Validator => (v) => {
    if (!v) return null;
    const m = /^(\d{2}):(\d{2})$/.exec(v);
    if (!m) return 'Hora inválida';
    const h = Number(m[1]);
    const min = Number(m[2]);
    return h < 24 && min < 60 ? null : 'Hora inválida';
  },
  numRange:
    (min: number, max: number): Validator =>
    (v) => {
      if (v === '' || v == null) return null;
      const n = Number(v);
      if (Number.isNaN(n)) return 'Número inválido';
      if (n < min) return `Mínimo ${min}`;
      if (n > max) return `Máximo ${max}`;
      return null;
    },
};
