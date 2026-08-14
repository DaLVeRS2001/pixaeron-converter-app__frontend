import block from 'bem-cn';

import { useLanguageSwitcher } from '../model/useLanguageSwitcher';

import './LanguageSwitcher.scss';

const cn = block('language-switcher');

const LanguageSwitcher = () => {
  const { currentLanguage, handleLanguageChange, languageLabel, languageOptions } =
    useLanguageSwitcher();

  return (
    <label className={cn()}>
      <span className={cn('label')}>{languageLabel}</span>

      <select className={cn('select')} value={currentLanguage} onChange={handleLanguageChange}>
        {languageOptions.map((language) => (
          <option key={language.value} value={language.value}>
            {language.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export { LanguageSwitcher };
