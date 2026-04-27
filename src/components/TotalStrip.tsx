type Props = {
  total: number;
  hasInput: boolean;
  isComplete: boolean;
  overallPass: boolean;
};

export default function TotalStrip({
  total,
  hasInput,
  isComplete,
  overallPass,
}: Props) {
  const totalDisplay = hasInput ? String(total) : '—';
  const totalClass =
    isComplete && overallPass ? 'text-accent' : 'text-ink';

  const status = !isComplete ? '—' : overallPass ? 'PASS' : 'FAIL';
  const statusClass = !isComplete
    ? 'text-ink-lo'
    : overallPass
      ? 'text-pass'
      : 'text-fail';

  return (
    <div className="sticky top-0 z-10 bg-paper border-b border-paper-2">
      <div className="mx-auto w-full max-w-[720px] px-4 py-3 flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span
            data-testid="acft-total"
            aria-live="polite"
            className={`num text-5xl font-medium ${totalClass}`}
          >
            {totalDisplay}
          </span>
          <span className="num text-base text-ink-md">/600</span>
        </div>
        <span
          data-testid="acft-status"
          className={`text-xs tracking-[0.18em] uppercase ${statusClass}`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}
