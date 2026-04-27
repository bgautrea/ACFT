import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Wordmark from './Wordmark';

describe('Wordmark', () => {
  it('renders the ACFT mark as a level-1 heading', () => {
    render(<Wordmark />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'ACFT' }),
    ).toBeInTheDocument();
  });

  it('renders the descriptor sub-line', () => {
    render(<Wordmark />);
    expect(screen.getByText(/score calculator/i)).toBeInTheDocument();
  });

  it('applies the wordmark font utility to the mark', () => {
    render(<Wordmark />);
    const heading = screen.getByRole('heading', { level: 1, name: 'ACFT' });
    expect(heading.className).toContain('wordmark');
  });

  it('renders a right-slot child when provided', () => {
    render(<Wordmark right={<span data-testid="right-slot">SLOT</span>} />);
    expect(screen.getByTestId('right-slot')).toBeInTheDocument();
  });

  it('renders without a right slot when none is provided', () => {
    render(<Wordmark />);
    expect(screen.queryByTestId('right-slot')).not.toBeInTheDocument();
  });
});
