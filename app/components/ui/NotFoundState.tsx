import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { PanelPage } from './PanelPage';

export function NotFoundState({ title, backHref, backLabel }: { title: string; backHref: string; backLabel: string }) {
  return (
    <PanelPage width="readable">
      <EmptyState
        icon={SearchX}
        title={title}
        description="O registro pode ter sido removido ou o link está incorreto."
        action={<Link href={backHref} className="btn-outline">{backLabel}</Link>}
      />
    </PanelPage>
  );
}
