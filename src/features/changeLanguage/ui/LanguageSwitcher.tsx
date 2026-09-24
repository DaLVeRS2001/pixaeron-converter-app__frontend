import { Select } from 'shared/ui/Select';

import { useLanguageSwitcher } from '../model/useLanguageSwitcher';

const LanguageSwitcher = () => {
  const { currentLanguage, changeLanguage, languageLabel, languageOptions } =
    useLanguageSwitcher();

  return (
    <Select
      label={languageLabel}
      options={languageOptions}
      value={currentLanguage}
      onChange={changeLanguage}
      labelHidden
    />
  );
};

export { LanguageSwitcher };
