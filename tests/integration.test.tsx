import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('App integration', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, search: '' },
      writable: true,
    });
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

  it('hydrates from URL on mount and offers Restore mine when localStorage differs', async () => {
    localStorage.setItem(
      'acft:v1',
      JSON.stringify({
        v: 1,
        state: {
          age: 22,
          sex: 'M',
          raw: { MDL: '', SPT: '', HRP: '', SDC: '', PLK: '', TMR: '' },
        },
      }),
    );
    Object.defineProperty(window, 'location', {
      value: { ...window.location, search: '?age=35&sex=F&mdl=240' },
      writable: true,
    });

    render(<App />);

    expect(screen.getByLabelText(/age/i)).toHaveValue(35);
    expect(screen.getByRole('button', { name: 'F' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByLabelText(/^MDL$/)).toHaveValue('240');

    const restoreBtn = screen.getByRole('button', { name: /restore mine/i });
    expect(restoreBtn).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(restoreBtn);

    expect(screen.getByLabelText(/age/i)).toHaveValue(22);
    expect(screen.getByRole('button', { name: 'M' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByLabelText(/^MDL$/)).toHaveValue('');
  });

  it('renders a Share scorecard button in the header', () => {
    render(<App />);
    expect(
      screen.getByRole('button', { name: /share scorecard/i }),
    ).toBeInTheDocument();
  });

  it('shows a delta on a failing event and clears it once passing', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Default state is age 22, sex M. MDL threshold is 140 lb.
    const mdl = screen.getByLabelText(/^MDL$/);

    // Type a failing value (130 lb → 50 pts)
    await user.type(mdl, '130');
    expect(screen.getByTestId('acft-delta-MDL')).toHaveTextContent('+10 lb');

    // Bring it to passing (240 lb → 82 pts)
    await user.clear(mdl);
    await user.type(mdl, '240');
    expect(screen.queryByTestId('acft-delta-MDL')).not.toBeInTheDocument();
  });
});
