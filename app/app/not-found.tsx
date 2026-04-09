import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-brand-mint p-6">
      <div className="w-full max-w-md rounded-card bg-white p-8 text-center shadow-card">
        <h1 className="font-display text-2xl font-bold text-brand">Página não encontrada</h1>
        <p className="mt-2 text-sm text-ink-500">A página solicitada não existe ou foi movida.</p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-pill bg-brand-lime px-5 py-2.5 text-sm font-semibold text-brand-dark hover:brightness-95"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
