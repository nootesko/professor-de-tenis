'use client';
import { Star } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';

export function StarRating({
  value = 0,
  onChange,
  size = 16,
}: {
  value?: number;
  onChange?: (v: number) => void;
  size?: number;
}) {
  const [hover, setHover] = useState(0);
  const [bumped, setBumped] = useState(0);
  const active = hover || value;
  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`${value} de 5 estrelas`}
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => {
            onChange?.(i);
            setBumped(i);
            setTimeout(() => setBumped(0), 320);
          }}
          onMouseEnter={() => onChange && setHover(i)}
          className={cn(
            'transition-transform duration-150 ease-out focus-visible:outline-none',
            onChange ? 'cursor-pointer hover:scale-125 active:scale-110' : 'cursor-default',
            bumped === i && 'animate-pop',
          )}
        >
          <Star
            size={size}
            className={cn(
              'transition-colors duration-150',
              i <= active
                ? 'fill-brand-yellow text-brand-yellow drop-shadow-[0_0_4px_rgba(234,179,8,0.35)]'
                : 'text-ink-300',
            )}
          />
        </button>
      ))}
    </div>
  );
}
