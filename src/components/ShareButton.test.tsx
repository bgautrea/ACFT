import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShareButton from './ShareButton';

const ORIGINAL_HREF = window.location.href;

function setHref(href: string) {
  Object.defineProperty(window, 'location', {
    value: { ...window.location, href },
    writable: true,
  });
}

describe('ShareButton', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setHref('https://example.test/?age=25&sex=M');
  });

  afterEach(() => {
    vi.useRealTimers();
    setHref(ORIGINAL_HREF);
    delete (navigator as any).share;
    delete (navigator as any).clipboard;
  });

  it('uses navigator.share when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { value: share, configurable: true });

    render(<ShareButton />);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await user.click(screen.getByRole('button', { name: /share scorecard/i }));

    expect(share).toHaveBeenCalledWith({
      url: 'https://example.test/?age=25&sex=M',
      title: 'ACFT scorecard',
    });
  });

  it('does not flash "Copied" when the user cancels the share sheet', async () => {
    const err = new DOMException('cancelled', 'AbortError');
    const share = vi.fn().mockRejectedValue(err);
    Object.defineProperty(navigator, 'share', { value: share, configurable: true });

    render(<ShareButton />);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await user.click(screen.getByRole('button', { name: /share scorecard/i }));
    await act(async () => { await Promise.resolve(); });

    expect(screen.queryByText(/copied/i)).not.toBeInTheDocument();
  });

  it('falls back to clipboard when navigator.share is undefined', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    render(<ShareButton />);
    // Set clipboard mock AFTER userEvent.setup() so it is not trampled by the
    // userEvent clipboard stub that attachClipboardStubToView installs.
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    await user.click(screen.getByRole('button', { name: /share scorecard/i }));
    await act(async () => { await Promise.resolve(); });

    expect(writeText).toHaveBeenCalledWith('https://example.test/?age=25&sex=M');
    expect(screen.getByText(/copied/i)).toBeInTheDocument();

    act(() => { vi.advanceTimersByTime(1500); });
    expect(screen.queryByText(/copied/i)).not.toBeInTheDocument();
  });

  it('renders a readonly URL input when clipboard write rejects', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));

    render(<ShareButton />);
    // Set clipboard mock AFTER userEvent.setup() so it is not trampled by the
    // userEvent clipboard stub that attachClipboardStubToView installs.
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    await user.click(screen.getByRole('button', { name: /share scorecard/i }));
    await act(async () => { await Promise.resolve(); });

    const input = screen.getByDisplayValue('https://example.test/?age=25&sex=M');
    expect(input).toHaveAttribute('readonly');
  });
});
