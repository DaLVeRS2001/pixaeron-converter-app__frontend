import { useMutation } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';

import { GoogleLoginDocument, LoginDocument } from 'shared/api';
import type { GraphQLErrorDetails } from 'shared/api';

import { AUTH_ERROR_CODE, CAPTCHA_ACTION } from '../../model/errors';
import { LEGAL_CONSENT_ACTION, LEGAL_CONSENT_NOTICE } from '../../model/legalConsent';
import { signInSchema } from '../../model/schemas';
import type { SignInFormValues } from '../../model/schemas';
import { useAuthAction } from '../../model/useAuthAction';
import { getSafePostLoginLocation, useCompleteLogin } from '../../model/useCompleteLogin';

type SignInIntent =
  | { kind: 'password'; values: SignInFormValues }
  | { kind: 'google'; idToken: string };

const useSignInModel = () => {
  const { state: locationState } = useLocation();
  const navigate = useNavigate();
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });
  const [login] = useMutation(LoginDocument);
  const [googleLogin] = useMutation(GoogleLoginDocument);
  const completeLogin = useCompleteLogin();

  const execute = useCallback(
    async (intent: SignInIntent, captchaToken?: string) => {
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
    },
    [completeLogin, googleLogin, login]
  );
  const fallbackCaptchaAction = useCallback(
    (intent: SignInIntent) =>
      intent.kind === 'password' ? CAPTCHA_ACTION.login : CAPTCHA_ACTION.googleLogin,
    []
  );
  const handleSignInError = useCallback(
    (details: GraphQLErrorDetails, intent: SignInIntent) => {
      const requiresGoogleConsent =
        intent.kind === 'google' &&
        (details.code === AUTH_ERROR_CODE.legalConsentRequired ||
          details.action === LEGAL_CONSENT_ACTION);

      if (requiresGoogleConsent) {
        const from = getSafePostLoginLocation(locationState);

        navigate('/sign-up', {
          replace: true,
          state: {
            notice: LEGAL_CONSENT_NOTICE,
            ...(from ? { from } : {}),
          },
        });
        return true;
      }

      if (intent.kind === 'password' && details.code === AUTH_ERROR_CODE.emailNotVerified) {
        const email = intent.values.email.trim().toLowerCase();
        sessionStorage.setItem('pendingVerificationEmail', email);
        navigate('/verify-email', { state: { email } });
        return true;
      }

      return false;
    },
    [locationState, navigate]
  );
  const action = useAuthAction<SignInIntent>({
    execute,
    fallbackCaptchaAction,
    onError: handleSignInError,
  });

  const submit = form.handleSubmit((values) => action.run({ kind: 'password', values }));
  const submitGoogle = useCallback(
    (idToken: string) => {
      if (action.busy || action.captcha) return;

      const intent: SignInIntent = { kind: 'google', idToken };

      if (__TURNSTILE_SITE_KEY__) {
        action.activate(CAPTCHA_ACTION.googleLogin, intent);
        return;
      }

      void action.run(intent);
    },
    [action]
  );
  const handleGoogleUnavailable = useCallback(() => {
    action.clear();
    action.setAuthError({ code: AUTH_ERROR_CODE.googleUnavailable });
  }, [action]);

  return {
    busy: action.busy,
    captcha: action.captcha,
    error: action.error,
    errorMessage: action.errorMessage,
    form,
    onCaptchaToken: action.onCaptchaToken,
    onCaptchaUnavailable: action.onCaptchaUnavailable,
    onGoogleUnavailable: handleGoogleUnavailable,
    submit,
    submitGoogle,
  };
};

export { useSignInModel };
