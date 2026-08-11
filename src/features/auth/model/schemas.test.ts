import type { TFunction } from 'i18next';

import { signUpSchema, validationMessage } from './schemas';

const translate = ((key: string) => `translated:${key}`) as unknown as TFunction<'auth'>;

describe('schemas', () => {
  it('reports validation failures as i18n keys, not baked strings', () => {
    const result = signUpSchema.safeParse({
      username: 'ab',
      email: 'not-an-email',
      password: 'short',
      confirmPassword: 'different',
      termsAccepted: false,
    });

    expect(result.success).toBe(false);
    const messages = result.error?.issues.map((issue) => issue.message) ?? [];
    expect(messages).toEqual(
      expect.arrayContaining([
        'validation.usernameMin',
        'validation.email',
        'validation.passwordMin',
        'validation.terms',
      ])
    );
    for (const message of messages) {
      expect(message).toMatch(/^validation\./);
    }
  });

  it('translates a stored key with the current translator', () => {
    expect(validationMessage(translate, 'validation.email')).toBe(
      'translated:validation.email'
    );
    expect(validationMessage(translate, undefined)).toBeUndefined();
  });
});
