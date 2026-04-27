import { EVENT_CODES, type EventCode, type EventResult } from '../lib/types';

const LABEL: Record<EventCode, string> = {
  MDL: 'MDL',
  SPT: 'SPT',
  HRP: 'HRP',
  SDC: 'SDC',
  PLK: 'PLK',
  TMR: '2MR',
};

type Props = {
  events: Record<EventCode, EventResult>;
};

export default function EventScores({ events }: Props) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
      {EVENT_CODES.map((code) => {
        const r = events[code];
        const colorClass = r.points === 0
          ? 'text-text-lo'
          : r.pass
            ? 'text-pass'
            : 'text-fail';
        return (
          <div
            key={code}
            className="flex items-center justify-between py-1 border-b border-divider last:border-b-0"
          >
            <span className="text-[10px] tracking-widest uppercase text-text-lo">{LABEL[code]}</span>
            <span className={`num text-sm ${colorClass}`}>{r.points}</span>
          </div>
        );
      })}
    </div>
  );
}
