import { useEffect, useMemo, useReducer, useState } from 'react';
import Wordmark from './components/Wordmark';
import TotalStrip from './components/TotalStrip';
import IdentityRow from './components/IdentityRow';
import EventForm from './components/EventForm';
import Footer from './components/Footer';
import ShareButton from './components/ShareButton';
import RestoreBanner from './components/RestoreBanner';
import { reducer } from './lib/reducer';
import { save } from './lib/persist';
import { scoreAll } from './lib/scoring';
import { deltaAll } from './lib/delta';
import { EVENT_CODES, type State } from './lib/types';
import { composeInitialState } from './lib/initialState';
import { useUrlSync } from './lib/useUrlSync';

export default function App() {
  const [initial] = useState(composeInitialState);
  const [reducerState, dispatch] = useReducer(reducer, initial.state);
  const [snapshot, setSnapshot] = useState<State | null>(initial.undoSnapshot);

  useEffect(() => {
    const handle = setTimeout(() => save(reducerState), 200);
    return () => clearTimeout(handle);
  }, [reducerState]);

  useUrlSync(reducerState);

  const result = useMemo(() => scoreAll(reducerState), [reducerState]);

  const deltas = useMemo(() => deltaAll(reducerState, result), [reducerState, result]);

  const hasInput = useMemo(
    () => EVENT_CODES.some((c) => reducerState.raw[c].trim() !== ''),
    [reducerState.raw],
  );

  const isComplete = useMemo(
    () => EVENT_CODES.every((c) => reducerState.raw[c].trim() !== ''),
    [reducerState.raw],
  );

  function handleRestore(snap: State) {
    dispatch({
      type: 'load-from-url',
      partial: { age: snap.age, sex: snap.sex, raw: snap.raw },
    });
    setSnapshot(null);
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <div className="mx-auto w-full max-w-[720px] px-4">
        <Wordmark right={<ShareButton />} />
      </div>
      {snapshot ? (
        <RestoreBanner
          snapshot={snapshot}
          onRestore={handleRestore}
          onDismiss={() => setSnapshot(null)}
        />
      ) : null}
      <TotalStrip
        total={result.total}
        hasInput={hasInput}
        isComplete={isComplete}
        overallPass={result.overallPass}
      />
      <main className="mx-auto w-full max-w-[720px] px-4 flex-1">
        <IdentityRow age={reducerState.age} sex={reducerState.sex} dispatch={dispatch} />
        <EventForm
          raw={reducerState.raw}
          result={result}
          deltas={deltas}
          dispatch={dispatch}
        />
        <Footer />
      </main>
    </div>
  );
}
