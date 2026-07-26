import enAuth from './locales/en/auth.json';
import enTranslation from './locales/en/common.json';
import enErrorMessages from './locales/en/errorMessages.json';
import ruAuth from './locales/ru/auth.json';
import ruTranslation from './locales/ru/common.json';
import ruErrorMessages from './locales/ru/errorMessages.json';

type TTranslationSchema<TData> = {
  [TKey in keyof TData]: TData[TKey] extends string ? string : TTranslationSchema<TData[TKey]>;
};

const defaultLanguage = 'en';

const defaultNS = 'translation';

const defaultLanguageResources = {
  translation: enTranslation,
  auth: enAuth,
  errorMessages: enErrorMessages,
};

type TDefaultLanguageResources = typeof defaultLanguageResources;

type TLanguageResourcesSchema = TTranslationSchema<TDefaultLanguageResources>;

const resources = {
  en: defaultLanguageResources,

  ru: {
    translation: ruTranslation,
    auth: ruAuth,
    errorMessages: ruErrorMessages,
  } satisfies TLanguageResourcesSchema,
};

type TSupportedLanguage = keyof typeof resources;

type TNamespace = keyof TDefaultLanguageResources;

const supportedLanguages = Object.keys(resources) as TSupportedLanguage[];

const namespaces = Object.keys(defaultLanguageResources) as TNamespace[];

const isSupportedLanguage = (language: string): language is TSupportedLanguage => {
  return supportedLanguages.includes(language as TSupportedLanguage);
};

export {
  defaultLanguage,
  defaultLanguageResources,
  defaultNS,
  isSupportedLanguage,
  namespaces,
  resources,
  supportedLanguages,
};

export type {
  TDefaultLanguageResources,
  TLanguageResourcesSchema,
  TNamespace,
  TSupportedLanguage,
};
