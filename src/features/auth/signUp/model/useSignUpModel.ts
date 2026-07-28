import { useApolloClient, useMutation } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { GoogleLoginDocument, MeDocument, RegisterDocument } from 'shared/api';

import {
  AUTH_ERROR_CODE,
  CAPTCHA_ACTION,
  isCaptchaChallenge,
  translateAuthError,
} from '../../model/errors';
import { CURRENT_LEGAL_CONSENT } from '../../model/legalConsent';
import { createSignUpSchema } from '../../model/schemas';
import type { SignUpFormValues } from '../../model/schemas';
import { useCaptchaChallenge } from '../../model/useCaptchaChallenge';

type SignUpIntent =
  | { kind: 'register'; values: SignUpFormValues }
  | { kind: 'google'; idToken: string };

const useSignUpModel = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const apolloClient = useApolloClient();
  const [errorMessage, setErrorMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const schema = useMemo(() => createSignUpSchema(t), [t]);
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false,
    },
  });
  const password = useWatch({ control: form.control, name: 'password' });
  const strength = useMemo(
    () =>
      [
        password.length >= 8,
        /[a-z]/.test(password) && /[A-Z]/.test(password),
        /\d/.test(password),
        /[^A-Za-z0-9]/.test(password),
      ].filter(Boolean).length,
    [password]
  );
  const [registerUser] = useMutation(RegisterDocument);
  const [googleLogin] = useMutation(GoogleLoginDocument);
  const { activate, challenge, clear, receiveToken } = useCaptchaChallenge<SignUpIntent>();

  const completeLogin = useCallback(
    (user: { id: string; email: string; username: string; emailVerified: boolean }) => {
      apolloClient.writeQuery({ query: MeDocument, data: { me: user } });
      navigate('/app', { replace: true });
    },
    [apolloClient, navigate]
  );

  const executeIntent = useCallback(
    async (intent: SignUpIntent, captchaToken?: string) => {
      if (busy) return;
      setBusy(true);
      setErrorMessage('');

      try {
        if (intent.kind === 'register') {
          const { username, email, password: nextPassword } = intent.values;
          const { data } = await registerUser({
            variables: {
              input: {
                username,
                email,
                password: nextPassword,
                captchaToken,
                ...CURRENT_LEGAL_CONSENT,
              },
            },
          });
          if (data?.register.accepted) {
            sessionStorage.setItem('pendingVerificationEmail', data.register.email);
            navigate('/verify-email', { state: { email: data.register.email } });
          }
          return;
        }

        const { data } = await googleLogin({
          variables: {
            input: {
              idToken: intent.idToken,
              captchaToken,
              ...CURRENT_LEGAL_CONSENT,
            },
          },
        });
        if (data?.googleLogin) completeLogin(data.googleLogin);
      } catch (error) {
        const translated = translateAuthError(error, t);
        const fallbackAction =
          intent.kind === 'register' ? CAPTCHA_ACTION.register : CAPTCHA_ACTION.googleLogin;

        if (isCaptchaChallenge(translated.code)) {
          activate(translated.action ?? fallbackAction, intent);
        } else if (translated.code === AUTH_ERROR_CODE.captchaUnavailable) {
          clear();
        } else {
          clear();
        }
        setErrorMessage(translated.message);
      } finally {
        setBusy(false);
      }
    },
    [activate, busy, clear, completeLogin, googleLogin, navigate, registerUser, t]
  );

  const submit = form.handleSubmit((values) => {
    const intent: SignUpIntent = { kind: 'register', values };

    if (__TURNSTILE_SITE_KEY__) {
      activate(CAPTCHA_ACTION.register, intent);
      return;
    }

    return executeIntent(intent);
  });
  const submitGoogle = useCallback(
    (idToken: string) => {
      if (busy || challenge) return;

      if (!form.getValues('termsAccepted')) {
        form.setError('termsAccepted', { message: t('validation.terms') });
        return;
      }

      const intent: SignUpIntent = { kind: 'google', idToken };

      if (__TURNSTILE_SITE_KEY__) {
        activate(CAPTCHA_ACTION.googleLogin, intent);
        return;
      }

      void executeIntent(intent);
    },
    [activate, busy, challenge, executeIntent, form, t]
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
    strength,
    submit,
    submitGoogle,
  };
};

export { useSignUpModel };
