import type { Action, EventCode } from '../lib/types';

type Props = {
  code: EventCode;
  label: string;
  placeholder: string;
  value: string;
  points: number;
  pass: boolean;
  dispatch: (action: Action) => void;
};

export default function EventRow({
  code,
  label,
  placeholder,
  value,
  points,
  pass,
  dispatch,
}: Props) {
  const id = `acft-${code.toLowerCase()}`;
  const hasValue = value.trim() !== '';
  const pointsClass = !hasValue
    ? 'text-ink-lo'
    : pass
      ? 'text-pass'
      : 'text-fail';
  const pointsDisplay = hasValue ? String(points) : '';

  return (
    <div className="grid grid-cols-[3.5rem_1fr_3rem] items-center gap-4 py-3 border-b border-paper-2 last:border-b-0">
      <label
        htmlFor={id}
        className="text-[11px] tracking-[0.18em] uppercase text-ink-md font-medium"
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          dispatch({ type: 'set-raw', event: code, value: e.target.value })
        }
        className="num bg-transparent border-0 border-b border-paper-2 px-1 py-1 text-ink placeholder:text-ink-lo focus:border-accent focus:outline-none w-full"
      />
      <span
        data-testid={`acft-points-${code}`}
        className={`num text-right text-base ${pointsClass}`}
      >
        {pointsDisplay}
      </span>
    </div>
  );
}
