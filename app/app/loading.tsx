export default function Loading() {
  return (
    <div className="grid min-h-screen place-items-center bg-brand-mint p-6">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-lime border-t-brand" />
        <p className="text-sm font-medium text-brand">Carregando…</p>
      </div>
    </div>
  );
}
