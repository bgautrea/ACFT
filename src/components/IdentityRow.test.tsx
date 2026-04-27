import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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

  it('dispatches set-age when the age input changes', async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(<IdentityRow age={22} sex="M" dispatch={dispatch} />);
    const input = screen.getByLabelText(/age/i);
    await user.clear(input);
    await user.type(input, '30');
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
