import { resources } from './resources';

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
  'up to 80%',
  'gdpr compliant',
  'faster',
  'fastest',
  'в браузере',
  'на стороне клиента',
  'не покидают',
  'ничего не хранится',
  'до 80%',
  'быстрее',
  'самая быстрая',
];

const flatten = (value: unknown, path = ''): [string, string][] => {
  if (typeof value === 'string') return [[path, value]];
  if (value === null || typeof value !== 'object') return [];

  return Object.entries(value).flatMap(([key, nested]) =>
    flatten(nested, path ? `${path}.${key}` : key)
  );
};

const locales = Object.entries(resources);
const englishOnly = locales.filter(([language]) => language === 'en');

describe('user-facing copy', () => {
  it.each(locales)('%s makes no claim the product cannot honour', (_language, bundle) => {
    const offenders = flatten(bundle)
      .filter(([, text]) => BANNED_CLAIMS.some((claim) => text.toLowerCase().includes(claim)))
      .map(([path, text]) => `${path}: ${text}`);

    expect(offenders).toEqual([]);
  });

  it.each(englishOnly)('%s writes without em dashes', (_language, bundle) => {
    const offenders = flatten(bundle)
      .filter(([, text]) => text.includes('—'))
      .map(([path, text]) => `${path}: ${text}`);

    expect(offenders).toEqual([]);
  });

  it('reads every locale and namespace the app registers, not a hand-written list', () => {
    const scanned = locales.flatMap(([language, bundle]) =>
      Object.keys(bundle).map((namespace) => `${language}/${namespace}`)
    );

    expect(scanned).toContain('en/conversion');
    expect(scanned).toContain('ru/conversion');
    expect(scanned.length).toBe(locales.length * Object.keys(resources.en).length);
  });
});
