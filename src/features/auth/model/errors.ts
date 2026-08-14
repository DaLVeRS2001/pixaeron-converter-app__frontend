import type { TFunction } from 'i18next';

import type { GraphQLErrorDetails } from 'shared/api';

const AUTH_ERROR_CODE = {
  captchaRequired: 'CAPTCHA_REQUIRED',
  captchaInvalid: 'CAPTCHA_INVALID',
  captchaUnavailable: 'CAPTCHA_UNAVAILABLE',
  tooManyLoginAttempts: 'TOO_MANY_LOGIN_ATTEMPTS',
  tooManyAuthAttempts: 'TOO_MANY_AUTH_ATTEMPTS',
  tooManyRequests: 'TOO_MANY_REQUESTS',
  actionCooldown: 'AUTH_ACTION_COOLDOWN',
  invalidCredentials: 'INVALID_CREDENTIALS',
  emailNotVerified: 'EMAIL_NOT_VERIFIED',
  emailAlreadyRegistered: 'EMAIL_ALREADY_REGISTERED',
  googleEmailNotVerified: 'GOOGLE_EMAIL_NOT_VERIFIED',
  emailDeliveryUnavailable: 'EMAIL_DELIVERY_UNAVAILABLE',
  accountLinkRequired: 'ACCOUNT_LINK_REQUIRED',
  googleTokenInvalid: 'GOOGLE_TOKEN_INVALID',
  legalConsentRequired: 'LEGAL_CONSENT_REQUIRED',
  googleUnavailable: 'GOOGLE_UNAVAILABLE',
  serviceUnavailable: 'SERVICE_UNAVAILABLE',
  network: 'NETWORK_ERROR',
} as const;

const CAPTCHA_ACTION = {
  login: 'login',
  googleLogin: 'google_login',
  register: 'register',
  forgotPassword: 'forgot_password',
  resendConfirmation: 'resend_confirmation',
} as const;

type CaptchaAction = (typeof CAPTCHA_ACTION)[keyof typeof CAPTCHA_ACTION];

const isCaptchaChallenge = (code?: string) =>
  code === AUTH_ERROR_CODE.captchaRequired || code === AUTH_ERROR_CODE.captchaInvalid;

const authErrorMessage = (error: GraphQLErrorDetails, t: TFunction<'auth'>): string => {
  if (error.retryAfter !== undefined) {
    if (error.code === AUTH_ERROR_CODE.actionCooldown) {
      return t('errors.cooldown', { seconds: Math.max(1, Math.ceil(error.retryAfter)) });
    }

    return t('errors.tooManyAttempts', {
      minutes: Math.max(1, Math.ceil(error.retryAfter / 60)),
    });
  }

  switch (error.code) {
    case AUTH_ERROR_CODE.captchaRequired:
      return t('errors.captchaRequired');
    case AUTH_ERROR_CODE.captchaInvalid:
      return t('errors.captchaInvalid');
    case AUTH_ERROR_CODE.captchaUnavailable:
      return t('errors.captchaUnavailable');
    case AUTH_ERROR_CODE.tooManyLoginAttempts:
    case AUTH_ERROR_CODE.tooManyAuthAttempts:
    case AUTH_ERROR_CODE.tooManyRequests:
    case AUTH_ERROR_CODE.actionCooldown:
      return t('errors.tooManyAttemptsUnknown');
    case AUTH_ERROR_CODE.invalidCredentials:
      return t('errors.invalidCredentials');
    case AUTH_ERROR_CODE.emailNotVerified:
      return t('errors.emailNotVerified');
    case AUTH_ERROR_CODE.emailAlreadyRegistered:
      return t('errors.emailAlreadyRegistered');
    case AUTH_ERROR_CODE.googleEmailNotVerified:
      return t('errors.googleEmailNotVerified');
    case AUTH_ERROR_CODE.emailDeliveryUnavailable:
      return t('errors.emailDeliveryUnavailable');
    case AUTH_ERROR_CODE.accountLinkRequired:
      return t('errors.accountLinkRequired');
    case AUTH_ERROR_CODE.googleTokenInvalid:
      return t('errors.googleTokenInvalid');
    case AUTH_ERROR_CODE.legalConsentRequired:
      return t('errors.legalConsentRequired');
    case AUTH_ERROR_CODE.googleUnavailable:
      return t('errors.googleUnavailable');
    case AUTH_ERROR_CODE.serviceUnavailable:
      return t('errors.serviceUnavailable');
    case AUTH_ERROR_CODE.network:
      return t('errors.network');
    default:
      return t('errors.generic');
  }
};

export { AUTH_ERROR_CODE, CAPTCHA_ACTION, authErrorMessage, isCaptchaChallenge };
export type { CaptchaAction };
