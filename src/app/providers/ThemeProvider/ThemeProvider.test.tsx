import { act, render, screen } from '@testing-library/react';

import { THEME_ATTRIBUTE, THEME_STORAGE_KEY, useTheme } from 'shared/config/theme';

import { ThemeProvider } from './ThemeProvider';

type SchemeListener = (event: { matches: boolean }) => void;

const listeners: SchemeListener[] = [];

const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: () => ({
      matches,
      addEventListener: (_type: string, listener: SchemeListener) => listeners.push(listener),
      removeEventListener: (_type: string, listener: SchemeListener) => {
        listeners.splice(listeners.indexOf(listener), 1);
      },
    }),
  });
};

const Probe = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme}
    </button>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    listeners.length = 0;
    document.documentElement.removeAttribute(THEME_ATTRIBUTE);
  });

  it('starts from the system scheme when nothing is stored and follows its changes', () => {
    mockMatchMedia(true);
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );

    expect(screen.getByRole('button')).toHaveTextContent('dark');
    expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, 'dark');

    act(() => listeners.forEach((listener) => listener({ matches: false })));

    expect(screen.getByRole('button')).toHaveTextContent('light');
    expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, 'light');
  });

  it('prefers the stored choice over the system scheme', () => {
    mockMatchMedia(true);
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );

    expect(screen.getByRole('button')).toHaveTextContent('light');
    expect(listeners).toHaveLength(0);
  });

  it('falls back to the system scheme when the stored value is unknown', () => {
    mockMatchMedia(true);
    localStorage.setItem(THEME_STORAGE_KEY, 'sepia');
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );

    expect(screen.getByRole('button')).toHaveTextContent('dark');
    expect(listeners).toHaveLength(1);
  });

  it('stores an explicit choice and stops following the system afterwards', () => {
    mockMatchMedia(false);
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );

    act(() => screen.getByRole('button').click());

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, 'dark');
    expect(listeners).toHaveLength(0);
  });
});
