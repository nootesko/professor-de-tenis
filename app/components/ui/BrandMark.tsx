import { Trophy } from 'lucide-react';
import { cn } from '@/lib/cn';

export function BrandMark({
  className,
  variant = 'default',
  compact = false,
}: {
  className?: string;
  variant?: 'default' | 'onDark';
  compact?: boolean;
}) {
  const onDark = variant === 'onDark';
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl', onDark ? 'bg-white/15' : 'bg-brand')}>
        <Trophy size={18} className="text-brand-lime" />
      </div>
      {!compact && (
        <div className={cn('font-display text-sm font-bold leading-tight', onDark ? 'text-white' : 'text-brand')}>
          Professor
          <br />
          DeTênis<span className={onDark ? 'text-brand-lime' : 'text-brand-green'}>.com</span>
        </div>
      )}
    </div>
  );
}
