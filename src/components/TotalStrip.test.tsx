import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import TotalStrip from './TotalStrip';

describe('TotalStrip', () => {
  it('shows em-dashes for total and status when there is no input', () => {
    render(
      <TotalStrip
        total={0}
        hasInput={false}
        isComplete={false}
        overallPass={false}
      />,
    );
    expect(screen.getByTestId('acft-total')).toHaveTextContent('—');
    expect(screen.getByTestId('acft-status')).toHaveTextContent('—');
  });

  it('shows the running total in ink while input is partial', () => {
    render(
      <TotalStrip
        total={120}
        hasInput={true}
        isComplete={false}
        overallPass={false}
      />,
    );
    const total = screen.getByTestId('acft-total');
    expect(total).toHaveTextContent('120');
    expect(total).toHaveClass('text-ink');
    expect(total).not.toHaveClass('text-accent');
    expect(screen.getByTestId('acft-status')).toHaveTextContent('—');
  });

  it('renders FAIL in fail color when complete and failing', () => {
    render(
      <TotalStrip
        total={359}
        hasInput={true}
        isComplete={true}
        overallPass={false}
      />,
    );
    const total = screen.getByTestId('acft-total');
    expect(total).toHaveTextContent('359');
    expect(total).toHaveClass('text-ink');
    expect(total).not.toHaveClass('text-accent');
    const status = screen.getByTestId('acft-status');
    expect(status).toHaveTextContent('FAIL');
    expect(status).toHaveClass('text-fail');
  });

  it('renders PASS in pass color and accents the total when complete and passing', () => {
    render(
      <TotalStrip
        total={500}
        hasInput={true}
        isComplete={true}
        overallPass={true}
      />,
    );
    const total = screen.getByTestId('acft-total');
    expect(total).toHaveTextContent('500');
    expect(total).toHaveClass('text-accent');
    const status = screen.getByTestId('acft-status');
    expect(status).toHaveTextContent('PASS');
    expect(status).toHaveClass('text-pass');
  });

  it('marks the total as an aria-live region', () => {
    render(
      <TotalStrip
        total={0}
        hasInput={false}
        isComplete={false}
        overallPass={false}
      />,
    );
    expect(screen.getByTestId('acft-total')).toHaveAttribute(
      'aria-live',
      'polite',
    );
  });
});
