import { Trophy } from 'lucide-react';
import { cn } from '@/lib/cn';

export function BrandMark({
  className,
  variant = 'default',
}: {
  className?: string;
  variant?: 'default' | 'onDark';
}) {
  const onDark = variant === 'onDark';
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('grid h-9 w-9 place-items-center rounded-xl', onDark ? 'bg-white/15' : 'bg-brand')}>
        <Trophy size={18} className="text-brand-lime" />
      </div>
      <div
        className={cn(
          'font-display text-sm font-bold leading-tight',
          onDark ? 'text-white' : 'text-brand',
        )}
      >
        Professor
        <br />
        DeTênis<span className={onDark ? 'text-brand-lime' : 'text-brand-lime2'}>.com</span>
      </div>
    </div>
  );
}
