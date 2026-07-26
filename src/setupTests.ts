import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'node:util';

const mockI18n = {
  changeLanguage: jest.fn().mockResolvedValue(undefined),
  resolvedLanguage: 'en',
};

jest.mock('react-i18next', () => ({
  initReactI18next: { type: '3rdParty', init: () => undefined },
  useTranslation: () => ({ i18n: mockI18n, t: (key: string) => key }),
  Trans: ({ children }: { children: object }) => children,
}));

Object.assign(globalThis, {
  TextDecoder,
  TextEncoder,
  __GOOGLE_CLIENT_ID__: '',
  __GRAPHQL_API_URL__: '/graphql',
  __IS_DEV__: true,
  __TURNSTILE_SITE_KEY__: '',
});
