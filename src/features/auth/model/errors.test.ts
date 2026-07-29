import { CombinedGraphQLErrors } from '@apollo/client/errors';
import type { TFunction } from 'i18next';

import { AUTH_ERROR_CODE, translateAuthError } from './errors';

const translate = jest.fn((key: string, options?: Record<string, unknown>) =>
  options ? `${key}:${JSON.stringify(options)}` : key
) as unknown as TFunction<'auth'>;

const authError = (
  code: string,
  extensions: Record<string, unknown> = {},
  message = 'private backend message'
) =>
  new CombinedGraphQLErrors({
    data: null,
    errors: [{ message, extensions: { code, ...extensions } }],
  });

describe('translateAuthError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    [AUTH_ERROR_CODE.captchaRequired, 'errors.captchaRequired'],
    [AUTH_ERROR_CODE.captchaInvalid, 'errors.captchaRequired'],
    [AUTH_ERROR_CODE.captchaUnavailable, 'errors.captchaUnavailable'],
    [AUTH_ERROR_CODE.invalidCredentials, 'errors.invalidCredentials'],
    [AUTH_ERROR_CODE.emailNotVerified, 'errors.emailNotVerified'],
    [AUTH_ERROR_CODE.emailAlreadyRegistered, 'errors.emailAlreadyRegistered'],
    [AUTH_ERROR_CODE.googleEmailNotVerified, 'errors.googleEmailNotVerified'],
    [AUTH_ERROR_CODE.emailDeliveryUnavailable, 'errors.emailDeliveryUnavailable'],
    [AUTH_ERROR_CODE.accountLinkRequired, 'errors.accountLinkRequired'],
    [AUTH_ERROR_CODE.googleTokenInvalid, 'errors.googleTokenInvalid'],
    [AUTH_ERROR_CODE.legalConsentRequired, 'errors.legalConsentRequired'],
  ])('maps %s to %s without displaying the backend message', (code, translationKey) => {
    const result = translateAuthError(authError(code), translate);

    expect(result.message).toBe(translationKey);
    expect(result.message).not.toContain('private backend message');
  });

  it('converts a cooldown retryAfter to localized seconds', () => {
    const result = translateAuthError(
      authError(AUTH_ERROR_CODE.actionCooldown, { retryAfter: 12.2 }),
      translate
    );

    expect(result.message).toBe('errors.cooldown:{"seconds":13}');
  });

  it('converts an attempt retryAfter to localized minutes', () => {
    const result = translateAuthError(
      authError(AUTH_ERROR_CODE.tooManyLoginAttempts, { retryAfter: 61 }),
      translate
    );

    expect(result.message).toBe('errors.tooManyAttempts:{"minutes":2}');
  });

  it('localizes network and unknown errors without exposing their messages', () => {
    expect(translateAuthError(new Error('socket details'), translate).message).toBe(
      'errors.network'
    );
    expect(translateAuthError(authError('UNKNOWN_PUBLIC_CODE'), translate).message).toBe(
      'errors.generic'
    );
  });
});
