import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IdentityRow from './IdentityRow';

describe('IdentityRow', () => {
  it('renders the age input with the supplied value', () => {
    render(<IdentityRow age={28} sex="M" dispatch={() => {}} />);
    expect(screen.getByLabelText(/age/i)).toHaveValue(28);
  });

  it('marks the active sex with aria-pressed=true', () => {
    render(<IdentityRow age={22} sex="F" dispatch={() => {}} />);
    expect(screen.getByRole('button', { name: 'F' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'M' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('dispatches set-age when the age input changes', () => {
    // Using fireEvent here (not userEvent) because the input is controlled:
    // user.type/clear simulate keystrokes, but with a vi.fn() dispatch the
    // parent state never updates, so each keystroke dispatches the wrong
    // concatenated value. fireEvent.change matches the real interaction —
    // the reducer is what owns the value.
    const dispatch = vi.fn();
    render(<IdentityRow age={22} sex="M" dispatch={dispatch} />);
    fireEvent.change(screen.getByLabelText(/age/i), { target: { value: '30' } });
    expect(dispatch).toHaveBeenCalledWith({ type: 'set-age', age: 30 });
  });

  it('dispatches set-sex when a sex button is clicked', async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(<IdentityRow age={22} sex="M" dispatch={dispatch} />);
    await user.click(screen.getByRole('button', { name: 'F' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'set-sex', sex: 'F' });
  });
});
