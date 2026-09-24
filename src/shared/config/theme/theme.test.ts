import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { THEMES, THEME_ATTRIBUTE, THEME_STORAGE_KEY, isTheme } from './theme';

const preloadScript = readFileSync(
  resolve(__dirname, '../../../../public/theme-init.js'),
  'utf8'
);

describe('theme', () => {
  it('keeps the pre-paint script on the same storage key, attribute and names', () => {
    expect(preloadScript).toContain(`'${THEME_STORAGE_KEY}'`);
    expect(preloadScript).toContain(`'${THEME_ATTRIBUTE}'`);
    THEMES.forEach((theme) => expect(preloadScript).toContain(`'${theme}'`));
  });

  it('accepts only the two known themes', () => {
    expect(isTheme('dark')).toBe(true);
    expect(isTheme('sepia')).toBe(false);
    expect(isTheme(null)).toBe(false);
  });
});
