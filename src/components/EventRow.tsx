import type { EventCode } from '../lib/types';

type Props = {
  code: EventCode;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

export default function EventRow({ code, label, value, placeholder, onChange }: Props) {
  const id = `acft-${code.toLowerCase()}`;
  return (
    <div className="flex items-center gap-4 py-3 border-b border-divider last:border-b-0">
      <label
        htmlFor={id}
        className="w-16 text-[11px] tracking-widest uppercase text-text-md"
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
        onChange={(e) => onChange(e.target.value)}
        className="num flex-1 bg-surface border border-divider rounded-md px-3 py-2 text-text-hi placeholder:text-text-lo focus:border-accent focus:outline-none"
      />
    </div>
  );
}
