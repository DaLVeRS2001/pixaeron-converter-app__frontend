import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import {
  DARK_SCHEME_QUERY,
  THEME_ATTRIBUTE,
  THEME_STORAGE_KEY,
  ThemeContext,
  isTheme,
} from 'shared/config/theme';
import type { Theme } from 'shared/config/theme';

const schemeTheme = (matches: boolean): Theme => (matches ? 'dark' : 'light');

const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [stored] = useState<Theme | null>(() => {
    try {
      const value = localStorage.getItem(THEME_STORAGE_KEY);

      return isTheme(value) ? value : null;
    } catch {
      return null;
    }
  });
  const [theme, setThemeState] = useState<Theme>(
    () => stored ?? schemeTheme(window.matchMedia(DARK_SCHEME_QUERY).matches)
  );
  const [followsSystem, setFollowsSystem] = useState(stored === null);

  useEffect(() => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
  }, [theme]);

  useEffect(() => {
    if (!followsSystem) return;

    const media = window.matchMedia(DARK_SCHEME_QUERY);
    const follow = (event: MediaQueryListEvent) => setThemeState(schemeTheme(event.matches));
    media.addEventListener('change', follow);

    return () => media.removeEventListener('change', follow);
  }, [followsSystem]);

  const setTheme = useCallback((next: Theme) => {
    setFollowsSystem(false);
    setThemeState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      return;
    }
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export { ThemeProvider };
