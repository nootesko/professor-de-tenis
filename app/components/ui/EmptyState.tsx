import { Inbox, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
  compact = false,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: LucideIcon;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? 'flex flex-col items-center px-6 py-10 text-center'
          : 'flex min-h-[280px] flex-col items-center justify-center rounded-dialog border-2 border-dashed border-line-strong bg-soft px-6 py-10 text-center'
      }
    >
      <div className="grid h-14 w-14 place-items-center rounded-full border border-line-strong bg-white text-brand">
        <Icon size={22} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-ink-900">{title}</h3>
      {description && <p className="mt-1 max-w-[340px] text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
