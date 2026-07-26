import type { ChangeEvent } from 'react';
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

  const currentLanguage = isSupportedLanguage(i18n.resolvedLanguage || '')
    ? i18n.resolvedLanguage
    : defaultLanguage;

  const languageOptions = supportedLanguages.map(createLanguageOption);

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLanguage = event.target.value;

    if (!isSupportedLanguage(nextLanguage)) {
      return;
    }

    void i18n.changeLanguage(nextLanguage);
  };

  return {
    currentLanguage,
    handleLanguageChange,
    languageLabel: t('language.label'),
    languageOptions,
  };
};

export { useLanguageSwitcher };

export type { TLanguageOption };
