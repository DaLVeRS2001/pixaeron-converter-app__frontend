import { fireEvent, render, screen } from '@testing-library/react';

import { Select } from './Select';

const OPTIONS = [
  { value: 'en', label: 'EN' },
  { value: 'ru', label: 'RU' },
] as const;

class ResizeObserverStub {
  observe() {
    return undefined;
  }
  unobserve() {
    return undefined;
  }
  disconnect() {
    return undefined;
  }
}

describe('Select', () => {
  beforeAll(() => {
    Object.assign(globalThis, { ResizeObserver: ResizeObserverStub });
  });

  it('shows the chosen option on a button named by its label', () => {
    render(<Select label="Language" options={OPTIONS} value="ru" onChange={jest.fn()} />);

    expect(screen.getByRole('button', { name: /Language/ })).toHaveTextContent('RU');
  });

  it('opens the list and reports the option the user picks', () => {
    const onChange = jest.fn();
    render(<Select label="Language" options={OPTIONS} value="en" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /Language/ }));
    fireEvent.click(screen.getByRole('option', { name: 'RU' }));

    expect(onChange).toHaveBeenCalledWith('ru');
  });

  it('keeps the label for assistive technology when it is visually hidden', () => {
    render(
      <Select label="Language" options={OPTIONS} value="en" onChange={jest.fn()} labelHidden />
    );

    expect(screen.getByRole('button', { name: /Language/ })).toBeInTheDocument();
    expect(screen.getByText('Language')).toHaveClass('select__label_hidden');
  });

  it('marks the current option as selected while the list is open', () => {
    render(<Select label="Language" options={OPTIONS} value="ru" onChange={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /Language/ }));

    expect(screen.getByRole('option', { name: 'RU' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('option', { name: 'EN' })).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });
});
