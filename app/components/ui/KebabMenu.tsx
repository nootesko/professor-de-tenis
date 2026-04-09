'use client';
import Link from 'next/link';
import { MoreVertical } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function KebabMenu({
  items,
}: {
  items: { label: string; icon?: ReactNode; onClick?: () => void; href?: string; danger?: boolean }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="grid h-8 w-8 place-items-center rounded-full transition-all duration-200 hover:bg-brand-mint2 hover:scale-110 active:scale-95"
      >
        <MoreVertical size={16} className="text-ink-500" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-40 origin-top-right overflow-hidden rounded-card border border-line bg-white shadow-soft animate-scale-in">
            {items.map((it, i) => {
              const inner = (
                <div
                  className={cn(
                    'flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors duration-150 hover:bg-brand-mint2 hover:pl-5',
                    it.danger && 'text-red-600 hover:bg-red-50',
                  )}
                >
                  {it.icon}
                  {it.label}
                </div>
              );
              return it.href ? (
                <Link key={i} href={it.href} onClick={() => setOpen(false)}>
                  {inner}
                </Link>
              ) : (
                <button
                  key={i}
                  onClick={() => {
                    it.onClick?.();
                    setOpen(false);
                  }}
                  className="block w-full"
                >
                  {inner}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
