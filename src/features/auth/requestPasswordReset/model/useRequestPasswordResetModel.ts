import { useMutation } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { RequestPasswordResetDocument } from 'shared/api';

import { CAPTCHA_ACTION, isCaptchaChallenge, translateAuthError } from '../../model/errors';
import { createEmailSchema } from '../../model/schemas';
import type { EmailFormValues } from '../../model/schemas';
import { useCaptchaChallenge } from '../../model/useCaptchaChallenge';

type ResetRequestIntent = EmailFormValues;

const useRequestPasswordResetModel = () => {
  const { t } = useTranslation('auth');
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const schema = useMemo(() => createEmailSchema(t), [t]);
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });
  const [requestReset] = useMutation(RequestPasswordResetDocument);
  const { activate, challenge, clear, receiveToken } =
    useCaptchaChallenge<ResetRequestIntent>();

  const executeIntent = useCallback(
    async (intent: ResetRequestIntent, captchaToken?: string) => {
      if (busy) return;
      setBusy(true);
      setErrorMessage('');
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
        const translated = translateAuthError(error, t);
        if (isCaptchaChallenge(translated.code)) {
          activate(translated.action ?? CAPTCHA_ACTION.forgotPassword, intent);
        } else {
          clear();
        }
        setErrorMessage(translated.message);
      } finally {
        setBusy(false);
      }
    },
    [activate, busy, clear, requestReset, t]
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
    setErrorMessage(t('errors.captchaUnavailable'));
  }, [clear, t]);

  return {
    busy,
    captcha: challenge,
    errorMessage,
    form,
    onCaptchaToken,
    onCaptchaUnavailable: handleCaptchaUnavailable,
    sent,
    submit,
  };
};

export { useRequestPasswordResetModel };
