import { useEffect, useRef } from 'react';
import { encode } from './url';
import type { State } from './types';

const DEBOUNCE_MS = 200;

export function useUrlSync(state: State): void {
  const isFirst = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        const query = encode(state);
        window.history.replaceState(null, '', query);
      } catch {
        // sandboxed iframe or otherwise — ignore.
      }
      timerRef.current = null;
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state]);
}
