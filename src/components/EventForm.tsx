import EventRow from './EventRow';
import {
  EVENT_CODES,
  type Action,
  type EventCode,
  type RawScores,
  type ScoreResult,
} from '../lib/types';

const LABELS: Record<EventCode, string> = {
  MDL: 'MDL',
  SPT: 'SPT',
  HRP: 'HRP',
  SDC: 'SDC',
  PLK: 'PLK',
  TMR: '2MR',
};

const PLACEHOLDERS: Record<EventCode, string> = {
  MDL: '240 lb',
  SPT: '9.2 m',
  HRP: '38 reps',
  SDC: '2:14',
  PLK: '2:38',
  TMR: '14:42',
};

type Props = {
  raw: RawScores;
  result: ScoreResult;
  dispatch: (action: Action) => void;
};

export default function EventForm({ raw, result, dispatch }: Props) {
  return (
    <div>
      {EVENT_CODES.map((code) => (
        <EventRow
          key={code}
          code={code}
          label={LABELS[code]}
          placeholder={PLACEHOLDERS[code]}
          value={raw[code]}
          points={result.events[code].points}
          pass={result.events[code].pass}
          dispatch={dispatch}
        />
      ))}
    </div>
  );
}
