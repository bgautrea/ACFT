import { useEffect, useMemo, useReducer } from 'react';
import Header from './components/Header';
import EventForm from './components/EventForm';
import ResultsPanel from './components/ResultsPanel';
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

  return (
    <div className="min-h-screen flex flex-col">
      <main className="mx-auto w-full max-w-5xl px-4 py-8 flex-1">
        <Header
          age={state.age}
          sex={state.sex}
          overallPass={result.overallPass}
          hasInput={hasInput}
          dispatch={dispatch}
        />
        <div className="grid md:grid-cols-[1.4fr_1fr] gap-8">
          <EventForm raw={state.raw} dispatch={dispatch} />
          <ResultsPanel result={result} />
        </div>
        <Footer />
      </main>
    </div>
  );
}
