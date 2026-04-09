import type { ReactNode } from 'react';

export function PageHeader({
  title,
  crumbs,
  actions,
}: {
  title: string;
  crumbs?: string[];
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="h-page">{title}</h1>
        {crumbs && <div className="crumbs">{crumbs.join(' › ')}</div>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
