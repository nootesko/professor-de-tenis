'use client';
import { Search, X } from 'lucide-react';

export function SearchField({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="relative w-full sm:w-72">
      <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        placeholder={label}
        className="h-10 w-full rounded-pill border border-line-strong bg-white pl-10 pr-9 text-sm placeholder:text-ink-300 focus:border-brand focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button type="button" onClick={() => onChange('')} aria-label="Limpar busca" className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-ink-500 hover:bg-soft">
          <X size={14} />
        </button>
      )}
    </div>
  );
}

/** Normaliza para busca sem acento/caixa. */
export const norm = (s = '') => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
