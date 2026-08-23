import { fireEvent, render, screen } from '@testing-library/react';

import { Switcher } from './Switcher';

const OPTIONS = [
  { value: 'LOSSLESS', label: 'Lossless' },
  { value: 'LOSSY', label: 'Lossy' },
] as const;

describe('Switcher', () => {
  it('reports the option the user picks', () => {
    const onChange = jest.fn();
    render(<Switcher label="Mode" options={OPTIONS} value="LOSSY" onChange={onChange} />);

    expect(screen.getByRole('radio', { name: 'Lossy' })).toBeChecked();
    fireEvent.click(screen.getByRole('radio', { name: 'Lossless' }));

    expect(onChange).toHaveBeenCalledWith('LOSSLESS');
  });

  it('describes the group with its hint for assistive technology', () => {
    render(
      <Switcher
        label="Mode"
        options={OPTIONS}
        value="LOSSY"
        onChange={jest.fn()}
        hint="Smaller files"
      />
    );

    const group = screen.getByRole('group', { name: 'Mode' });
    expect(group).toHaveAccessibleDescription('Smaller files');
  });

  it('blocks every option while disabled', () => {
    render(
      <Switcher label="Mode" options={OPTIONS} value="LOSSY" onChange={jest.fn()} disabled />
    );

    expect(screen.getByRole('radio', { name: 'Lossless' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Lossy' })).toBeDisabled();
  });
});
