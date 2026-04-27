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
    expect(
      screen.getByRole('heading', { level: 1, name: 'ACFT' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('acft-total')).toHaveTextContent('—');
    expect(screen.getByTestId('acft-status')).toHaveTextContent('—');
  });

  it('typing in MDL updates the total in the strip', async () => {
    const user = userEvent.setup();
    render(<App />);
    const mdl = screen.getByLabelText(/^MDL$/);
    await user.type(mdl, '240');
    const total = screen.getByTestId('acft-total');
    expect(total.textContent).toMatch(/^[1-9]\d*$/);
  });

  it('switching sex updates aria-pressed', async () => {
    const user = userEvent.setup();
    render(<App />);
    const fButton = screen.getByRole('button', { name: 'F' });
    await user.click(fButton);
    expect(fButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows PASS once all six events have passing inputs', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText(/^MDL$/), '240');
    await user.type(screen.getByLabelText(/^SPT$/), '9.2');
    await user.type(screen.getByLabelText(/^HRP$/), '40');
    await user.type(screen.getByLabelText(/^SDC$/), '2:00');
    await user.type(screen.getByLabelText(/^PLK$/), '2:30');
    await user.type(screen.getByLabelText(/^2MR$/), '15:00');
    expect(screen.getByTestId('acft-status')).toHaveTextContent('PASS');
  });
});
