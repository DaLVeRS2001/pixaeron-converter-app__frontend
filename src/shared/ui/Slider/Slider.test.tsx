import { fireEvent, render, screen } from '@testing-library/react';

import { Slider } from './Slider';

const STOPS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
] as const;

describe('Slider', () => {
  it('reports the stop the user drags to', () => {
    const onChange = jest.fn();
    render(<Slider label="Strength" stops={STOPS} value="LOW" onChange={onChange} />);

    const input = screen.getByRole('slider', { name: 'Strength' });
    fireEvent.change(input, { target: { value: '2' } });

    expect(onChange).toHaveBeenCalledWith('HIGH');
  });

  it('announces the current stop by name', () => {
    render(<Slider label="Strength" stops={STOPS} value="MEDIUM" onChange={jest.fn()} />);

    expect(screen.getByRole('slider', { name: 'Strength' })).toHaveAttribute(
      'aria-valuetext',
      'Medium'
    );
  });

  it('describes the control with its hint for assistive technology', () => {
    render(
      <Slider
        label="Strength"
        stops={STOPS}
        value="LOW"
        onChange={jest.fn()}
        hint="Smaller files, more visible loss"
      />
    );

    expect(screen.getByRole('slider', { name: 'Strength' })).toHaveAccessibleDescription(
      'Smaller files, more visible loss'
    );
  });

  it('falls back to the first stop when the value is unknown', () => {
    render(
      <Slider
        label="Strength"
        stops={STOPS}
        value={'NONSENSE' as 'LOW'}
        onChange={jest.fn()}
      />
    );

    expect(screen.getByRole('slider', { name: 'Strength' })).toHaveValue('0');
  });
});
