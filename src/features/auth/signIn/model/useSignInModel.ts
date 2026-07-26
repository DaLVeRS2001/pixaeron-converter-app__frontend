import { useApolloClient, useMutation } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { GoogleLoginDocument, LoginDocument, MeDocument } from 'shared/api';

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

type SignInIntent =
  | { kind: 'password'; values: SignInFormValues }
  | { kind: 'google'; idToken: string };

const useSignInModel = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const apolloClient = useApolloClient();
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

  const completeLogin = useCallback(
    (user: { id: string; email: string; username: string; emailVerified: boolean }) => {
      apolloClient.writeQuery({ query: MeDocument, data: { me: user } });
      navigate('/app', { replace: true });
    },
    [apolloClient, navigate]
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
        const translated = translateAuthError(error, t);
        const fallbackAction =
          intent.kind === 'password' ? CAPTCHA_ACTION.login : CAPTCHA_ACTION.googleLogin;

        if (isCaptchaChallenge(translated.code)) {
          activate(translated.action ?? fallbackAction, intent);
        } else if (translated.code === AUTH_ERROR_CODE.captchaUnavailable) {
          clear();
        } else if (
          intent.kind === 'google' &&
          (translated.code === AUTH_ERROR_CODE.legalConsentRequired ||
            translated.action === LEGAL_CONSENT_ACTION)
        ) {
          clear();
          navigate('/sign-up', {
            replace: true,
            state: { notice: LEGAL_CONSENT_NOTICE },
          });
          return;
        } else if (
          translated.code === AUTH_ERROR_CODE.emailNotVerified &&
          intent.kind === 'password'
        ) {
          const email = intent.values.email.trim().toLowerCase();
          sessionStorage.setItem('pendingVerificationEmail', email);
          navigate('/verify-email', { state: { email } });
          return;
        } else {
          clear();
        }

        setErrorMessage(translated.message);
      } finally {
        setBusy(false);
      }
    },
    [activate, busy, clear, completeLogin, googleLogin, login, navigate, t]
  );

  const submit = form.handleSubmit((values) => executeIntent({ kind: 'password', values }));
  const submitGoogle = useCallback(
    (idToken: string) => executeIntent({ kind: 'google', idToken }),
    [executeIntent]
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
