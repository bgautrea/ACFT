import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import EventRow from './EventRow';

describe('EventRow', () => {
  const baseProps = {
    code: 'MDL' as const,
    label: 'MDL',
    placeholder: '240 lb',
    value: '',
    points: 0,
    pass: false,
    dispatch: () => {},
  };

  it('renders the label and the placeholder on an empty row', () => {
    render(<EventRow {...baseProps} />);
    expect(screen.getByText('MDL')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('240 lb')).toBeInTheDocument();
  });

  it('shows an empty points slot when value is empty', () => {
    render(<EventRow {...baseProps} />);
    expect(screen.getByTestId('acft-points-MDL')).toHaveTextContent('');
  });

  it('renders points in pass color when value is present and pass is true', () => {
    render(
      <EventRow
        {...baseProps}
        value="240"
        points={88}
        pass={true}
      />,
    );
    const points = screen.getByTestId('acft-points-MDL');
    expect(points).toHaveTextContent('88');
    expect(points).toHaveClass('text-pass');
  });

  it('renders points in fail color when value is present and pass is false', () => {
    render(
      <EventRow
        {...baseProps}
        value="140"
        points={50}
        pass={false}
      />,
    );
    const points = screen.getByTestId('acft-points-MDL');
    expect(points).toHaveTextContent('50');
    expect(points).toHaveClass('text-fail');
  });

  it('dispatches set-raw on input change', () => {
    const dispatch = vi.fn();
    render(<EventRow {...baseProps} dispatch={dispatch} />);
    fireEvent.change(screen.getByPlaceholderText('240 lb'), {
      target: { value: '240' },
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: 'set-raw',
      event: 'MDL',
      value: '240',
    });
  });
});
