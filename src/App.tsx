import { useEffect, useMemo, useReducer } from 'react';
import Wordmark from './components/Wordmark';
import TotalStrip from './components/TotalStrip';
import IdentityRow from './components/IdentityRow';
import EventForm from './components/EventForm';
import Footer from './components/Footer';
import { reducer } from './lib/reducer';
import { hydrate, save } from './lib/persist';
import { scoreAll } from './lib/scoring';
import { EVENT_CODES } from './lib/types';

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, hydrate);

  useEffect(() => {
    const handle = setTimeout(() => save(state), 200);
    return () => clearTimeout(handle);
  }, [state]);

  const result = useMemo(() => scoreAll(state), [state]);

  const hasInput = useMemo(
    () => EVENT_CODES.some((c) => state.raw[c].trim() !== ''),
    [state.raw],
  );

  const isComplete = useMemo(
    () => EVENT_CODES.every((c) => state.raw[c].trim() !== ''),
    [state.raw],
  );

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <div className="mx-auto w-full max-w-[720px] px-4">
        <Wordmark />
      </div>
      <TotalStrip
        total={result.total}
        hasInput={hasInput}
        isComplete={isComplete}
        overallPass={result.overallPass}
      />
      <main className="mx-auto w-full max-w-[720px] px-4 flex-1">
        <IdentityRow age={state.age} sex={state.sex} dispatch={dispatch} />
        <EventForm raw={state.raw} result={result} dispatch={dispatch} />
        <Footer />
      </main>
    </div>
  );
}
