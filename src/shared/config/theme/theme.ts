const THEMES = ['light', 'dark'] as const;

type Theme = (typeof THEMES)[number];

const THEME_STORAGE_KEY = 'pixaeron-theme';

const THEME_ATTRIBUTE = 'data-theme';

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

const isTheme = (value: unknown): value is Theme => THEMES.includes(value as Theme);

export { DARK_SCHEME_QUERY, THEMES, THEME_ATTRIBUTE, THEME_STORAGE_KEY, isTheme };
export type { Theme };
