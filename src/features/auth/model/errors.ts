import type { TFunction } from 'i18next';

import { getGraphQLErrorDetails } from 'shared/api';

const AUTH_ERROR_CODE = {
  captchaRequired: 'CAPTCHA_REQUIRED',
  captchaInvalid: 'CAPTCHA_INVALID',
  captchaUnavailable: 'CAPTCHA_UNAVAILABLE',
  tooManyLoginAttempts: 'TOO_MANY_LOGIN_ATTEMPTS',
  tooManyAuthAttempts: 'TOO_MANY_AUTH_ATTEMPTS',
  actionCooldown: 'AUTH_ACTION_COOLDOWN',
  invalidCredentials: 'INVALID_CREDENTIALS',
  emailNotVerified: 'EMAIL_NOT_VERIFIED',
  emailAlreadyRegistered: 'EMAIL_ALREADY_REGISTERED',
  googleEmailNotVerified: 'GOOGLE_EMAIL_NOT_VERIFIED',
  emailDeliveryUnavailable: 'EMAIL_DELIVERY_UNAVAILABLE',
  accountLinkRequired: 'ACCOUNT_LINK_REQUIRED',
  googleTokenInvalid: 'GOOGLE_TOKEN_INVALID',
  legalConsentRequired: 'LEGAL_CONSENT_REQUIRED',
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

type AuthError = {
  code?: string;
  action?: string;
  retryAfter?: number;
  message: string;
};

const isCaptchaChallenge = (code?: string) =>
  code === AUTH_ERROR_CODE.captchaRequired || code === AUTH_ERROR_CODE.captchaInvalid;

const translateAuthError = (error: unknown, t: TFunction<'auth'>): AuthError => {
  const details = getGraphQLErrorDetails(error);

  if (details.retryAfter !== undefined) {
    if (details.code === AUTH_ERROR_CODE.actionCooldown) {
      return {
        ...details,
        message: t('errors.cooldown', { seconds: Math.max(1, Math.ceil(details.retryAfter)) }),
      };
    }

    return {
      ...details,
      message: t('errors.tooManyAttempts', {
        minutes: Math.max(1, Math.ceil(details.retryAfter / 60)),
      }),
    };
  }

  switch (details.code) {
    case AUTH_ERROR_CODE.captchaRequired:
    case AUTH_ERROR_CODE.captchaInvalid:
      return { ...details, message: t('errors.captchaRequired') };
    case AUTH_ERROR_CODE.captchaUnavailable:
      return { ...details, message: t('errors.captchaUnavailable') };
    case AUTH_ERROR_CODE.invalidCredentials:
      return { ...details, message: t('errors.invalidCredentials') };
    case AUTH_ERROR_CODE.emailNotVerified:
      return { ...details, message: t('errors.emailNotVerified') };
    case AUTH_ERROR_CODE.emailAlreadyRegistered:
      return { ...details, message: t('errors.emailAlreadyRegistered') };
    case AUTH_ERROR_CODE.googleEmailNotVerified:
      return { ...details, message: t('errors.googleEmailNotVerified') };
    case AUTH_ERROR_CODE.emailDeliveryUnavailable:
      return { ...details, message: t('errors.emailDeliveryUnavailable') };
    case AUTH_ERROR_CODE.accountLinkRequired:
      return { ...details, message: t('errors.accountLinkRequired') };
    case AUTH_ERROR_CODE.googleTokenInvalid:
      return { ...details, message: t('errors.googleTokenInvalid') };
    case AUTH_ERROR_CODE.legalConsentRequired:
      return { ...details, message: t('errors.legalConsentRequired') };
    case AUTH_ERROR_CODE.network:
      return { ...details, message: t('errors.network') };
    default:
      return { ...details, message: t('errors.generic') };
  }
};

export { AUTH_ERROR_CODE, CAPTCHA_ACTION, isCaptchaChallenge, translateAuthError };
export type { AuthError, CaptchaAction };
