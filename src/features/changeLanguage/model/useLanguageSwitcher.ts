import { useTranslation } from 'react-i18next';

import { defaultLanguage, isSupportedLanguage, supportedLanguages } from 'shared/config/i18n';
import type { TSupportedLanguage } from 'shared/config/i18n';

type TLanguageOption = {
  value: TSupportedLanguage;
  label: string;
};

const createLanguageOption = (language: TSupportedLanguage): TLanguageOption => {
  return {
    value: language,
    label: language.toUpperCase(),
  };
};

const useLanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const resolvedLanguage = i18n.resolvedLanguage ?? '';
  const currentLanguage = isSupportedLanguage(resolvedLanguage)
    ? resolvedLanguage
    : defaultLanguage;

  const languageOptions = supportedLanguages.map(createLanguageOption);

  const changeLanguage = (nextLanguage: TSupportedLanguage) => {
    void i18n.changeLanguage(nextLanguage);
  };

  return {
    currentLanguage,
    changeLanguage,
    languageLabel: t('language.label'),
    languageOptions,
  };
};

export { useLanguageSwitcher };

export type { TLanguageOption };
