import type { ReactNode } from 'react';

/** Big numbers: o único lugar (junto de grades de consulta) com várias colunas. */
export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{children}</div>;
}

export function StatCard({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="rounded-card border border-line-strong bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="caps">{label}</span>
        {icon && <span className="text-brand">{icon}</span>}
      </div>
      <div className="mt-2 font-display text-[1.75rem] font-bold leading-none tabular-nums text-brand">{value}</div>
      {hint && <div className="mt-1.5 text-xs text-ink-500">{hint}</div>}
    </div>
  );
}
