import { useRef, useState } from 'react';

type Status = 'idle' | 'copied' | 'fallback';

export default function ShareButton() {
  const [status, setStatus] = useState<Status>('idle');
  const fallbackUrlRef = useRef<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function handleClick() {
    const url = window.location.href;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ url, title: 'ACFT scorecard' });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setStatus('copied');
      setTimeout(() => setStatus('idle'), 1500);
    } catch {
      fallbackUrlRef.current = url;
      setStatus('fallback');
      setTimeout(() => {
        inputRef.current?.select();
      }, 0);
      setTimeout(() => setStatus('idle'), 4000);
    }
  }

  const label = status === 'copied' ? 'Copied' : 'Share';
  const ariaLabel = status === 'copied' ? 'Link copied' : 'Share scorecard';

  return (
    <div className="flex items-center gap-2">
      {status === 'fallback' ? (
        <input
          ref={inputRef}
          readOnly
          value={fallbackUrlRef.current}
          aria-label="Scorecard URL"
          className="num text-xs bg-transparent border border-paper-2 px-2 py-1 text-ink w-48"
        />
      ) : null}
      <button
        type="button"
        onClick={handleClick}
        aria-label={ariaLabel}
        className="p-2 -m-2 text-[10px] tracking-[0.18em] uppercase text-ink-md hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent inline-block min-w-[5ch] text-right"
      >
        {label}
      </button>
    </div>
  );
}
