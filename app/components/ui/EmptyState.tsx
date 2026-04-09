import { Pencil } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card } from './Card';

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Card className="grid place-items-center p-12 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-brand-mint2 text-brand">
        <Pencil size={24} />
      </div>
      <h3 className="mt-4 font-display text-xl font-bold text-brand">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </Card>
  );
}
