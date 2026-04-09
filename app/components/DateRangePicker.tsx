"use client";
export function DateRangePicker({
  from, to, onChange,
}: {
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-1 text-xs text-ink-500">
        De
        <input
          type="date"
          value={from}
          onChange={(e) => onChange({ from: e.target.value, to })}
          className="rounded-pill border border-line bg-white px-3 py-1.5 text-xs focus:border-brand focus:outline-none"
        />
      </label>
      <label className="flex items-center gap-1 text-xs text-ink-500">
        Até
        <input
          type="date"
          value={to}
          onChange={(e) => onChange({ from, to: e.target.value })}
          className="rounded-pill border border-line bg-white px-3 py-1.5 text-xs focus:border-brand focus:outline-none"
        />
      </label>
    </div>
  );
}
