'use client';
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-card bg-white p-8 shadow-card">
      <h2 className="font-display text-xl font-bold text-brand">Ocorreu um erro</h2>
      <p className="mt-2 text-sm text-ink-500">{error.message}</p>
      <button
        onClick={() => reset()}
        className="mt-4 inline-flex rounded-pill bg-brand-lime px-5 py-2 text-sm font-semibold text-brand-dark"
      >
        Tentar novamente
      </button>
    </div>
  );
}
