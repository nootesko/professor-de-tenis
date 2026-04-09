'use client';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-screen place-items-center bg-brand-mint p-6">
      <div className="w-full max-w-md rounded-card bg-white p-8 text-center shadow-card">
        <h1 className="font-display text-2xl font-bold text-brand">Algo deu errado</h1>
        <p className="mt-2 text-sm text-ink-500">{error.message || 'Erro inesperado.'}</p>
        <button
          onClick={() => reset()}
          className="mt-6 inline-flex rounded-pill bg-brand-lime px-5 py-2.5 text-sm font-semibold text-brand-dark hover:brightness-95"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
