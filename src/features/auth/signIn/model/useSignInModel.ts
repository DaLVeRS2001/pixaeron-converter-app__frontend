import { useMutation } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { GoogleLoginDocument, LoginDocument } from 'shared/api';

import {
  AUTH_ERROR_CODE,
  CAPTCHA_ACTION,
  isCaptchaChallenge,
  translateAuthError,
} from '../../model/errors';
import { LEGAL_CONSENT_ACTION, LEGAL_CONSENT_NOTICE } from '../../model/legalConsent';
import { createSignInSchema } from '../../model/schemas';
import type { SignInFormValues } from '../../model/schemas';
import { useCaptchaChallenge } from '../../model/useCaptchaChallenge';
import { useCompleteLogin } from '../../model/useCompleteLogin';

type SignInIntent =
  | { kind: 'password'; values: SignInFormValues }
  | { kind: 'google'; idToken: string };

const useSignInModel = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const schema = useMemo(() => createSignInSchema(t), [t]);
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });
  const [login] = useMutation(LoginDocument);
  const [googleLogin] = useMutation(GoogleLoginDocument);
  const { activate, challenge, clear, receiveToken } = useCaptchaChallenge<SignInIntent>();

  const completeLogin = useCompleteLogin();
  const handleSignInError = useCallback(
    (error: unknown, intent: SignInIntent) => {
      const translated = translateAuthError(error, t);
      const fallbackCaptchaAction =
        intent.kind === 'password' ? CAPTCHA_ACTION.login : CAPTCHA_ACTION.googleLogin;
      const requiresCaptcha = isCaptchaChallenge(translated.code);
      const requiresGoogleConsent =
        intent.kind === 'google' &&
        (translated.code === AUTH_ERROR_CODE.legalConsentRequired ||
          translated.action === LEGAL_CONSENT_ACTION);
      const requiresEmailVerification =
        intent.kind === 'password' && translated.code === AUTH_ERROR_CODE.emailNotVerified;

      if (requiresCaptcha) {
        activate(translated.action ?? fallbackCaptchaAction, intent);
        setErrorMessage(translated.message);
        return;
      }

      if (requiresGoogleConsent) {
        clear();
        navigate('/sign-up', {
          replace: true,
          state: { notice: LEGAL_CONSENT_NOTICE },
        });
        return;
      }

      if (requiresEmailVerification) {
        const email = intent.values.email.trim().toLowerCase();
        sessionStorage.setItem('pendingVerificationEmail', email);
        navigate('/verify-email', { state: { email } });
        return;
      }

      clear();
      setErrorMessage(translated.message);
    },
    [activate, clear, navigate, t]
  );

  const executeIntent = useCallback(
    async (intent: SignInIntent, captchaToken?: string) => {
      if (busy) return;
      setBusy(true);
      setErrorMessage('');

      try {
        if (intent.kind === 'password') {
          const { data } = await login({
            variables: { input: { ...intent.values, captchaToken } },
          });
          if (data?.login) completeLogin(data.login);
          return;
        }

        const { data } = await googleLogin({
          variables: { input: { idToken: intent.idToken, captchaToken } },
        });
        if (data?.googleLogin) completeLogin(data.googleLogin);
      } catch (error) {
        handleSignInError(error, intent);
      } finally {
        setBusy(false);
      }
    },
    [busy, completeLogin, googleLogin, handleSignInError, login]
  );

  const submit = form.handleSubmit((values) => executeIntent({ kind: 'password', values }));
  const submitGoogle = useCallback(
    (idToken: string) => {
      if (busy || challenge) return;

      const intent: SignInIntent = { kind: 'google', idToken };

      if (__TURNSTILE_SITE_KEY__) {
        activate(CAPTCHA_ACTION.googleLogin, intent);
        return;
      }

      void executeIntent(intent);
    },
    [activate, busy, challenge, executeIntent]
  );
  const onCaptchaToken = useCallback(
    (token: string) => {
      const intent = receiveToken(token);
      if (intent) void executeIntent(intent, token);
    },
    [executeIntent, receiveToken]
  );
  const handleCaptchaUnavailable = useCallback(() => {
    clear();
    setErrorMessage(t('errors.captchaUnavailable'));
  }, [clear, t]);
  const handleGoogleUnavailable = useCallback(() => {
    clear();
    setErrorMessage(t('errors.googleUnavailable'));
  }, [clear, t]);

  return {
    busy,
    captcha: challenge,
    errorMessage,
    form,
    onCaptchaToken,
    onCaptchaUnavailable: handleCaptchaUnavailable,
    onGoogleUnavailable: handleGoogleUnavailable,
    submit,
    submitGoogle,
  };
};

export { useSignInModel };
