import Dial from './Dial';
import EventScores from './EventScores';
import type { ScoreResult } from '../lib/types';

type Props = {
  result: ScoreResult;
};

export default function ResultsPanel({ result }: Props) {
  return (
    <aside
      className="md:border-l md:border-divider md:pl-6 flex flex-col gap-5"
      aria-live="polite"
    >
      <Dial score={result.total} />
      <EventScores events={result.events} />
    </aside>
  );
}
