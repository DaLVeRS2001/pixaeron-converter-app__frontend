import { fireEvent, render, screen } from '@testing-library/react';

import { ThemeContext } from 'shared/config/theme';
import type { Theme } from 'shared/config/theme';

import { ThemeToggle } from './ThemeToggle';

const renderWithTheme = (theme: Theme) => {
  const setTheme = jest.fn();
  render(
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <ThemeToggle />
    </ThemeContext.Provider>
  );

  return setTheme;
};

describe('ThemeToggle', () => {
  it('is an unchecked switch in the light theme and asks for dark on click', () => {
    const setTheme = renderWithTheme('light');
    const toggle = screen.getByRole('switch', { name: 'theme.dark' });

    expect(toggle).not.toBeChecked();
    fireEvent.click(toggle);

    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('is a checked switch in the dark theme and asks for light on click', () => {
    const setTheme = renderWithTheme('dark');
    const toggle = screen.getByRole('switch', { name: 'theme.dark' });

    expect(toggle).toBeChecked();
    fireEvent.click(toggle);

    expect(setTheme).toHaveBeenCalledWith('light');
  });
});
