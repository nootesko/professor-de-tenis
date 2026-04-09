import type { ReactNode } from 'react';
import { Card } from './Card';

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="p-6 md:p-8 animate-scale-in transition-shadow duration-200 hover:shadow-soft">
      <h3 className="mb-5 font-display text-base font-bold text-brand">{title}</h3>
      <div className="space-y-4">{children}</div>
    </Card>
  );
}
