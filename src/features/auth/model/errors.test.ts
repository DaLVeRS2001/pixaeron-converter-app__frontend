import { CombinedGraphQLErrors } from '@apollo/client/errors';
import type { TFunction } from 'i18next';

import { AUTH_ERROR_CODE, authErrorMessage, resolveAuthError } from './errors';

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

describe('resolveAuthError', () => {
  it('keeps the error identity instead of a rendered message', () => {
    expect(
      resolveAuthError(
        authError(AUTH_ERROR_CODE.captchaRequired, { action: 'login', retryAfter: 30 })
      )
    ).toEqual({ code: AUTH_ERROR_CODE.captchaRequired, action: 'login', retryAfter: 30 });
  });

  it('reports an unrecognized failure as a network error', () => {
    expect(resolveAuthError(new Error('socket details'))).toEqual({
      code: AUTH_ERROR_CODE.network,
    });
  });
});

describe('authErrorMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    [AUTH_ERROR_CODE.captchaRequired, 'errors.captchaRequired'],
    [AUTH_ERROR_CODE.captchaInvalid, 'errors.captchaInvalid'],
    [AUTH_ERROR_CODE.captchaUnavailable, 'errors.captchaUnavailable'],
    [AUTH_ERROR_CODE.tooManyLoginAttempts, 'errors.tooManyAttemptsUnknown'],
    [AUTH_ERROR_CODE.tooManyAuthAttempts, 'errors.tooManyAttemptsUnknown'],
    [AUTH_ERROR_CODE.tooManyRequests, 'errors.tooManyAttemptsUnknown'],
    [AUTH_ERROR_CODE.actionCooldown, 'errors.tooManyAttemptsUnknown'],
    [AUTH_ERROR_CODE.invalidCredentials, 'errors.invalidCredentials'],
    [AUTH_ERROR_CODE.emailNotVerified, 'errors.emailNotVerified'],
    [AUTH_ERROR_CODE.emailAlreadyRegistered, 'errors.emailAlreadyRegistered'],
    [AUTH_ERROR_CODE.googleEmailNotVerified, 'errors.googleEmailNotVerified'],
    [AUTH_ERROR_CODE.emailDeliveryUnavailable, 'errors.emailDeliveryUnavailable'],
    [AUTH_ERROR_CODE.accountLinkRequired, 'errors.accountLinkRequired'],
    [AUTH_ERROR_CODE.googleTokenInvalid, 'errors.googleTokenInvalid'],
    [AUTH_ERROR_CODE.legalConsentRequired, 'errors.legalConsentRequired'],
    [AUTH_ERROR_CODE.googleUnavailable, 'errors.googleUnavailable'],
    [AUTH_ERROR_CODE.serviceUnavailable, 'errors.serviceUnavailable'],
    [AUTH_ERROR_CODE.network, 'errors.network'],
  ])('maps %s to %s', (code, translationKey) => {
    expect(authErrorMessage({ code }, translate)).toBe(translationKey);
  });

  it('never displays the backend message', () => {
    const resolved = resolveAuthError(authError(AUTH_ERROR_CODE.invalidCredentials));

    expect(authErrorMessage(resolved, translate)).not.toContain('private backend message');
  });

  it('converts a cooldown retryAfter to localized seconds', () => {
    const resolved = resolveAuthError(
      authError(AUTH_ERROR_CODE.actionCooldown, { retryAfter: 12.2 })
    );

    expect(authErrorMessage(resolved, translate)).toBe('errors.cooldown:{"seconds":13}');
  });

  it('converts an attempt retryAfter to localized minutes', () => {
    const resolved = resolveAuthError(
      authError(AUTH_ERROR_CODE.tooManyLoginAttempts, { retryAfter: 61 })
    );

    expect(authErrorMessage(resolved, translate)).toBe('errors.tooManyAttempts:{"minutes":2}');
  });

  it('falls back to the generic message only for an unknown code', () => {
    expect(authErrorMessage({ code: 'UNKNOWN_PUBLIC_CODE' }, translate)).toBe('errors.generic');
  });
});
