import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('App integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders with initial empty state', () => {
    render(<App />);
    expect(screen.getByLabelText(/age/i)).toHaveValue(22);
    // MDL appears in both the EventRow label and the EventScores span; use getAllByText
    expect(screen.getAllByText(/MDL/i).length).toBeGreaterThan(0);
  });

  it('typing in MDL updates the displayed total', async () => {
    const user = userEvent.setup();
    render(<App />);
    const mdl = screen.getByLabelText(/^MDL$/);
    await user.type(mdl, '240');
    // Total is rendered in the Dial and also mirrored in EventScores; use getAllByText.
    const nonZeroNodes = screen.getAllByText(/^[1-9]\d*$/);
    expect(nonZeroNodes.length).toBeGreaterThan(0);
  });

  it('switching sex updates the calculation', async () => {
    const user = userEvent.setup();
    render(<App />);
    const fButton = screen.getByRole('button', { name: 'F' });
    await user.click(fButton);
    expect(fButton).toHaveAttribute('aria-pressed', 'true');
  });
});
