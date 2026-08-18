import enCommon from './locales/en/common.json';
import enConversion from './locales/en/conversion.json';
import ruCommon from './locales/ru/common.json';
import ruConversion from './locales/ru/conversion.json';

const BANNED_CLAIMS = [
  'in your browser',
  'client-side',
  'clientside',
  'webassembly',
  'never leave',
  'nothing is stored',
  'no server storage',
  '50,000+',
  '50k+',
  '2.4m+',
  'ssim',
  'lossless',
  'up to 80%',
  'gdpr compliant',
  'в браузере',
  'на стороне клиента',
  'не покидают',
  'ничего не хранится',
  'без потерь',
  'до 80%',
];

const flatten = (value: unknown, path = ''): [string, string][] => {
  if (typeof value === 'string') return [[path, value]];
  if (value === null || typeof value !== 'object') return [];

  return Object.entries(value).flatMap(([key, nested]) =>
    flatten(nested, path ? `${path}.${key}` : key)
  );
};

const LOCALES = {
  'en/common': enCommon,
  'en/conversion': enConversion,
  'ru/common': ruCommon,
  'ru/conversion': ruConversion,
};

describe('user-facing copy', () => {
  it.each(Object.entries(LOCALES))(
    '%s makes no claim the product cannot honour',
    (_name, resource) => {
      const offenders = flatten(resource)
        .filter(([, text]) =>
          BANNED_CLAIMS.some((claim) => text.toLowerCase().includes(claim))
        )
        .map(([path, text]) => `${path}: ${text}`);

      expect(offenders).toEqual([]);
    }
  );

  it('covers every locale, so a stale translation cannot outlive the cleanup', () => {
    const locales = new Set(Object.keys(LOCALES).map((name) => name.split('/')[0]));

    expect([...locales].sort()).toEqual(['en', 'ru']);
  });
});
