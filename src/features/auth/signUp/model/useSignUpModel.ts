import { useMutation } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { GoogleLoginDocument, RegisterDocument } from 'shared/api';

import { AUTH_ERROR_CODE, CAPTCHA_ACTION } from '../../model/errors';
import { CURRENT_LEGAL_CONSENT } from '../../model/legalConsent';
import { signUpSchema } from '../../model/schemas';
import type { SignUpFormValues } from '../../model/schemas';
import { useAuthAction } from '../../model/useAuthAction';
import { useCompleteLogin } from '../../model/useCompleteLogin';

type SignUpIntent =
  | { kind: 'register'; values: SignUpFormValues }
  | { kind: 'google'; idToken: string };

const useSignUpModel = () => {
  const navigate = useNavigate();
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
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
  const completeLogin = useCompleteLogin();

  const execute = useCallback(
    async (intent: SignUpIntent, captchaToken?: string) => {
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
    },
    [completeLogin, googleLogin, navigate, registerUser]
  );
  const fallbackCaptchaAction = useCallback(
    (intent: SignUpIntent) =>
      intent.kind === 'register' ? CAPTCHA_ACTION.register : CAPTCHA_ACTION.googleLogin,
    []
  );
  const action = useAuthAction<SignUpIntent>({ execute, fallbackCaptchaAction });

  const submit = form.handleSubmit((values) => {
    const intent: SignUpIntent = { kind: 'register', values };

    if (__TURNSTILE_SITE_KEY__) {
      action.activate(CAPTCHA_ACTION.register, intent);
      return;
    }

    return action.run(intent);
  });
  const submitGoogle = useCallback(
    (idToken: string) => {
      if (action.busy || action.captcha) return;

      if (!form.getValues('termsAccepted')) {
        form.setError('termsAccepted', { message: 'validation.terms' });
        return;
      }

      const intent: SignUpIntent = { kind: 'google', idToken };

      if (__TURNSTILE_SITE_KEY__) {
        action.activate(CAPTCHA_ACTION.googleLogin, intent);
        return;
      }

      void action.run(intent);
    },
    [action, form]
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
    strength,
    submit,
    submitGoogle,
  };
};

export { useSignUpModel };
