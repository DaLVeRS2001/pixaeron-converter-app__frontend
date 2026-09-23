import block from 'bem-cn';
import { useTranslation } from 'react-i18next';

import MoonIcon from 'shared/assets/icons/moon.svg';
import SunIcon from 'shared/assets/icons/sun.svg';
import { useTheme } from 'shared/config/theme';
import { SVG } from 'shared/ui/SVG';

import './ThemeToggle.scss';

const cn = block('theme-toggle');

const ThemeToggle = () => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const dark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={t('theme.dark')}
      className={cn({ dark })}
      onClick={() => setTheme(dark ? 'light' : 'dark')}
    >
      <SVG Svg={SunIcon} className={cn('icon', { sun: true }).toString()} />
      <SVG Svg={MoonIcon} className={cn('icon', { moon: true }).toString()} />
      <span className={cn('knob')} />
    </button>
  );
};

export { ThemeToggle };
