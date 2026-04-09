export default function FormLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-8 md:px-6 md:py-10">
      <div className="h-10 w-1/2 animate-pulse rounded-pill bg-brand-mint2" />
      <div className="h-40 animate-pulse rounded-card bg-white" />
      <div className="h-40 animate-pulse rounded-card bg-white" />
    </div>
  );
}
