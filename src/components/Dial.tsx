type Props = {
  score: number;
  max?: number;
};

const RADIUS = 60;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function Dial({ score, max = 600 }: Props) {
  const ratio = Math.max(0, Math.min(1, score / max));
  const offset = CIRCUMFERENCE * (1 - ratio);

  return (
    <div className="relative w-40 h-40 mx-auto" aria-hidden="true">
      <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
        <circle
          r={RADIUS}
          cx="70"
          cy="70"
          fill="transparent"
          stroke="var(--color-surface-2)"
          strokeWidth="8"
        />
        <circle
          r={RADIUS}
          cx="70"
          cy="70"
          fill="transparent"
          stroke="var(--color-accent)"
          strokeWidth="8"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 250ms cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="num text-4xl">{score}</span>
        <span className="text-xs tracking-widest uppercase text-text-lo">/ {max}</span>
      </div>
    </div>
  );
}
