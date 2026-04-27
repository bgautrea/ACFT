import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RestoreBanner from './RestoreBanner';
import { initialState } from '../lib/reducer';
import type { State } from '../lib/types';

const snapshot: State = {
  age: 22,
  sex: 'M',
  raw: { ...initialState.raw, MDL: '240' },
};

describe('RestoreBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the loaded copy and the Restore mine button', () => {
    render(<RestoreBanner snapshot={snapshot} onRestore={() => {}} onDismiss={() => {}} />);
    expect(screen.getByRole('status')).toHaveTextContent(/loaded shared scorecard/i);
    expect(screen.getByRole('button', { name: /restore mine/i })).toBeInTheDocument();
  });

  it('calls onRestore with the snapshot when Restore mine is clicked', async () => {
    const onRestore = vi.fn();
    const onDismiss = vi.fn();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<RestoreBanner snapshot={snapshot} onRestore={onRestore} onDismiss={onDismiss} />);
    await user.click(screen.getByRole('button', { name: /restore mine/i }));
    expect(onRestore).toHaveBeenCalledWith(snapshot);
  });

  it('calls onDismiss after 8 seconds with no interaction', () => {
    const onDismiss = vi.fn();
    render(<RestoreBanner snapshot={snapshot} onRestore={() => {}} onDismiss={onDismiss} />);
    act(() => { vi.advanceTimersByTime(7999); });
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1); });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not call onDismiss after Restore mine has been clicked', async () => {
    const onDismiss = vi.fn();
    const onRestore = vi.fn();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<RestoreBanner snapshot={snapshot} onRestore={onRestore} onDismiss={onDismiss} />);
    await user.click(screen.getByRole('button', { name: /restore mine/i }));
    act(() => { vi.advanceTimersByTime(8000); });
    expect(onDismiss).not.toHaveBeenCalled();
  });
});
