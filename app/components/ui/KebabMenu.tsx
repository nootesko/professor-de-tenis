'use client';
import Link from 'next/link';
import { MoreVertical } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function KebabMenu({
  items,
  label = 'Mais ações',
}: {
  items: { label: string; icon?: ReactNode; onClick?: () => void; href?: string; danger?: boolean }[];
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);
  const itemCls = (danger?: boolean) =>
    cn('flex h-10 w-full items-center gap-2 rounded-input px-3 text-left text-sm font-medium transition-colors',
      danger ? 'text-red-600 hover:bg-red-50' : 'text-ink-700 hover:bg-soft');
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        className="grid h-9 w-9 place-items-center rounded-full text-ink-500 transition-colors hover:bg-soft hover:text-ink-900"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-20 mt-1 w-48 origin-top-right rounded-panel border border-line-strong bg-white p-1.5 shadow-soft animate-scale-in">
          {items.map((it) =>
            it.href ? (
              <Link key={it.label} role="menuitem" href={it.href} onClick={() => setOpen(false)} className={itemCls(it.danger)}>
                {it.icon}{it.label}
              </Link>
            ) : (
              <button key={it.label} role="menuitem" type="button" onClick={(e) => { e.stopPropagation(); it.onClick?.(); setOpen(false); }} className={itemCls(it.danger)}>
                {it.icon}{it.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
