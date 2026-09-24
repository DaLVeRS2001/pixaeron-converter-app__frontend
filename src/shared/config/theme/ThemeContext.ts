import { createContext, useContext } from 'react';

import type { Theme } from './theme';

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const useTheme = (): ThemeContextValue => {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider');

  return value;
};

export { ThemeContext, useTheme };
export type { ThemeContextValue };
