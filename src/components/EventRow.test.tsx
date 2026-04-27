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

  it('renders the delta string in the 4th column when provided', () => {
    render(
      <EventRow
        code="MDL"
        label="MDL"
        placeholder="240 lb"
        value="130"
        points={50}
        pass={false}
        delta="+10 lb"
        dispatch={() => {}}
      />,
    );
    expect(screen.getByTestId('acft-delta-MDL')).toHaveTextContent('+10 lb');
  });

  it('does not render the delta cell when delta is null', () => {
    render(
      <EventRow
        code="MDL"
        label="MDL"
        placeholder="240 lb"
        value=""
        points={0}
        pass={false}
        delta={null}
        dispatch={() => {}}
      />,
    );
    expect(screen.queryByTestId('acft-delta-MDL')).not.toBeInTheDocument();
  });

  it('uses inputMode="numeric" for non-SPT events', () => {
    render(<EventRow {...baseProps} />);
    expect(screen.getByPlaceholderText('240 lb')).toHaveAttribute('inputMode', 'numeric');
  });

  it('uses inputMode="decimal" for SPT (decimal meters)', () => {
    render(
      <EventRow
        code="SPT"
        label="SPT"
        placeholder="9.2 m"
        value=""
        points={0}
        pass={false}
        dispatch={() => {}}
      />,
    );
    expect(screen.getByPlaceholderText('9.2 m')).toHaveAttribute('inputMode', 'decimal');
  });

  it('auto-formats time-event input on change (TMR: 239 → 2:39)', () => {
    const dispatch = vi.fn();
    render(
      <EventRow
        code="TMR"
        label="2MR"
        placeholder="14:42"
        value=""
        points={0}
        pass={false}
        dispatch={dispatch}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText('14:42'), {
      target: { value: '239' },
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: 'set-raw',
      event: 'TMR',
      value: '2:39',
    });
  });

  it('auto-formats time-event input on change (SDC: 1430 → 14:30)', () => {
    const dispatch = vi.fn();
    render(
      <EventRow
        code="SDC"
        label="SDC"
        placeholder="2:14"
        value=""
        points={0}
        pass={false}
        dispatch={dispatch}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText('2:14'), {
      target: { value: '1430' },
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: 'set-raw',
      event: 'SDC',
      value: '14:30',
    });
  });

  it('does not normalize non-time events (MDL: "240" stays "240")', () => {
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
