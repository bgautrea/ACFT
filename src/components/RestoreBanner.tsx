import { useEffect, useRef } from 'react';
import type { State } from '../lib/types';

type Props = {
  snapshot: State;
  onRestore: (snapshot: State) => void;
  onDismiss: () => void;
};

const DISMISS_MS = 8000;

export default function RestoreBanner({ snapshot, onRestore, onDismiss }: Props) {
  const consumed = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!consumed.current) onDismiss();
    }, DISMISS_MS);
    return () => clearTimeout(t);
  }, [onDismiss]);

  function handleRestore() {
    consumed.current = true;
    onRestore(snapshot);
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto w-full max-w-[720px] px-4 py-2 text-xs text-ink-md flex items-center justify-between gap-3 motion-safe:transition-opacity"
    >
      <span>Loaded shared scorecard.</span>
      <button
        type="button"
        onClick={handleRestore}
        className="underline underline-offset-2 hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
      >
        Restore mine
      </button>
    </div>
  );
}
