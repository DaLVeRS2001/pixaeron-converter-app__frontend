import { useMutation } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { RequestPasswordResetDocument } from 'shared/api';

import {
  AUTH_ERROR_CODE,
  CAPTCHA_ACTION,
  authErrorMessage,
  isCaptchaChallenge,
  resolveAuthError,
} from '../../model/errors';
import type { AuthError } from '../../model/errors';
import { emailSchema } from '../../model/schemas';
import type { EmailFormValues } from '../../model/schemas';
import { useCaptchaChallenge } from '../../model/useCaptchaChallenge';

type ResetRequestIntent = EmailFormValues;

const useRequestPasswordResetModel = () => {
  const { t } = useTranslation('auth');
  const [sent, setSent] = useState(false);
  const [authError, setAuthError] = useState<AuthError>();
  const [busy, setBusy] = useState(false);
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });
  const [requestReset] = useMutation(RequestPasswordResetDocument);
  const { activate, challenge, clear, receiveToken } =
    useCaptchaChallenge<ResetRequestIntent>();

  const executeIntent = useCallback(
    async (intent: ResetRequestIntent, captchaToken?: string) => {
      if (busy) return;
      setBusy(true);
      setAuthError(undefined);
      setSent(false);

      try {
        await requestReset({
          variables: {
            input: { email: intent.email.trim().toLowerCase(), captchaToken },
          },
        });
        clear();
        setSent(true);
      } catch (error) {
        const resolved = resolveAuthError(error);
        if (isCaptchaChallenge(resolved.code)) {
          activate(resolved.action ?? CAPTCHA_ACTION.forgotPassword, intent);
        } else {
          clear();
        }
        setAuthError(resolved);
      } finally {
        setBusy(false);
      }
    },
    [activate, busy, clear, requestReset]
  );

  const submit = form.handleSubmit((intent) => executeIntent(intent));
  const onCaptchaToken = useCallback(
    (token: string) => {
      const intent = receiveToken(token);
      if (intent) void executeIntent(intent, token);
    },
    [executeIntent, receiveToken]
  );
  const handleCaptchaUnavailable = useCallback(() => {
    clear();
    setAuthError({ code: AUTH_ERROR_CODE.captchaUnavailable });
  }, [clear]);

  return {
    busy,
    captcha: challenge,
    error: authError,
    errorMessage: authError ? authErrorMessage(authError, t) : '',
    form,
    onCaptchaToken,
    onCaptchaUnavailable: handleCaptchaUnavailable,
    sent,
    submit,
  };
};

export { useRequestPasswordResetModel };
