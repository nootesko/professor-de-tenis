'use client';
import Image from 'next/image';
import { UserRound } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useRef, useState } from 'react';
import { Button } from './Button';

export function Avatar({ src, alt, size = 40 }: { src?: string; alt: string; size?: number }) {
  if (!src) {
    return (
      <span
        aria-label={alt}
        className="grid place-items-center rounded-full bg-brand-mint2 text-brand ring-2 ring-white"
        style={{ width: size, height: size }}
      >
        <UserRound size={Math.round(size * 0.55)} strokeWidth={1.75} />
      </span>
    );
  }
  // next/image requires absolute or remotePatterns-allowed URLs.
  // Data URLs and external avatars (i.pravatar.cc) are supported.
  const isData = src.startsWith('data:');
  if (isData) {
    // next/image does not allow data URLs, fall back to native img.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="rounded-full object-cover ring-2 ring-white"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-full object-cover ring-2 ring-white')}
      style={{ width: size, height: size }}
      unoptimized
    />
  );
}

export function AvatarUpload({
  value,
  onChange,
  alt = 'Foto',
  size = 96,
  fallback,
}: {
  value?: string;
  onChange: (src: string | undefined) => void;
  alt?: string;
  size?: number;
  fallback?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const displaySrc = value || fallback || undefined;

  const handleFile = (file: File | undefined) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Imagem muito grande (máx 5MB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(typeof reader.result === 'string' ? reader.result : undefined);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Avatar src={displaySrc} alt={alt} size={size} />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      <div className="flex gap-2">
        <Button variant="outline" type="button" onClick={() => inputRef.current?.click()}>
          {value ? 'Trocar foto' : 'Carregar foto'}
        </Button>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange(undefined);
              setError(null);
            }}
            className="rounded-pill bg-red-50 px-5 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
          >
            Remover
          </button>
        )}
      </div>
      {error && <div className="text-xs text-red-600">{error}</div>}
    </div>
  );
}

export function AvatarGroup({ srcs, max = 3 }: { srcs: string[]; max?: number }) {
  const shown = srcs.slice(0, max);
  const extra = srcs.length - shown.length;
  return (
    <div className="flex -space-x-2">
      {shown.map((s, i) => (
        <Avatar key={i} src={s} alt="" size={32} />
      ))}
      {extra > 0 && (
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-mint2 text-[10px] font-semibold text-brand">
          +{extra}
        </span>
      )}
    </div>
  );
}
