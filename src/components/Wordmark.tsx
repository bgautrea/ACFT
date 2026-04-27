import type { ReactNode } from 'react';

type Props = {
  right?: ReactNode;
};

export default function Wordmark({ right }: Props) {
  return (
    <header className="pt-10 pb-6 flex items-end justify-between gap-4">
      <div>
        <h1 className="wordmark text-7xl leading-none text-ink">ACFT</h1>
        <p className="mt-2 text-[10px] tracking-[0.18em] uppercase text-ink-md">
          Score Calculator
        </p>
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </header>
  );
}
