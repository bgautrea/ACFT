import type { Action, Sex } from '../lib/types';

type Props = {
  age: number;
  sex: Sex;
  dispatch: (action: Action) => void;
};

export default function IdentityRow({ age, sex, dispatch }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-8 py-6">
      <div>
        <label
          htmlFor="acft-age"
          className="block mb-1 text-[10px] tracking-[0.18em] uppercase text-ink-md"
        >
          Age
        </label>
        <input
          id="acft-age"
          type="number"
          min={17}
          max={99}
          value={age}
          onChange={(e) =>
            dispatch({ type: 'set-age', age: Number(e.target.value) })
          }
          className="num w-20 bg-transparent border-0 border-b border-paper-2 px-1 py-1 text-ink focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <span className="block mb-1 text-[10px] tracking-[0.18em] uppercase text-ink-md">
          Sex
        </span>
        <div className="inline-flex text-sm">
          {(['M', 'F'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => dispatch({ type: 'set-sex', sex: s })}
              aria-pressed={sex === s}
              className={
                sex === s
                  ? 'px-3 py-1 border-b-2 border-accent text-ink font-semibold'
                  : 'px-3 py-1 border-b-2 border-transparent text-ink-md hover:text-ink'
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
