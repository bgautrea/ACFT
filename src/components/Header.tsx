import type { Action, Sex } from '../lib/types';

type Props = {
  age: number;
  sex: Sex;
  overallPass: boolean;
  hasInput: boolean;
  dispatch: (action: Action) => void;
};

export default function Header({ age, sex, overallPass, hasInput, dispatch }: Props) {
  const status = !hasInput ? '—' : overallPass ? 'PASS' : 'FAIL';
  const statusClass = !hasInput
    ? 'text-text-lo'
    : overallPass
      ? 'text-pass'
      : 'text-fail';

  return (
    <div className="flex flex-wrap items-end gap-6 pb-4 mb-4 border-b border-divider">
      <div>
        <label htmlFor="acft-age" className="text-[10px] tracking-widest uppercase text-text-lo block mb-1">Age</label>
        <input
          id="acft-age"
          type="number"
          min={17}
          max={99}
          value={age}
          onChange={(e) => dispatch({ type: 'set-age', age: Number(e.target.value) })}
          className="num w-20 bg-surface border border-divider rounded-md px-3 py-2 text-text-hi focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <span className="text-[10px] tracking-widest uppercase text-text-lo block mb-1">Sex</span>
        <div className="inline-flex border border-divider rounded-md overflow-hidden text-sm">
          {(['M', 'F'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => dispatch({ type: 'set-sex', sex: s })}
              aria-pressed={sex === s}
              className={
                sex === s
                  ? 'px-4 py-2 bg-accent text-bg font-semibold'
                  : 'px-4 py-2 text-text-md hover:text-text-hi'
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="ml-auto text-right">
        <span className="text-[10px] tracking-widest uppercase text-text-lo block mb-1">Status</span>
        <span className={`num text-sm ${statusClass}`}>{status}</span>
      </div>
    </div>
  );
}
