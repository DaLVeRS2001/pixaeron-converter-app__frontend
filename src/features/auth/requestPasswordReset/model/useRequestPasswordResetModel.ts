import { useMutation } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';

import { RequestPasswordResetDocument } from 'shared/api';

import { CAPTCHA_ACTION } from '../../model/errors';
import { emailSchema } from '../../model/schemas';
import type { EmailFormValues } from '../../model/schemas';
import { useAuthAction } from '../../model/useAuthAction';

type ResetRequestIntent = EmailFormValues;

const useRequestPasswordResetModel = () => {
  const [sent, setSent] = useState(false);
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });
  const [requestReset] = useMutation(RequestPasswordResetDocument);

  const execute = useCallback(
    async (intent: ResetRequestIntent, captchaToken?: string) => {
      setSent(false);
      await requestReset({
        variables: {
          input: { email: intent.email.trim().toLowerCase(), captchaToken },
        },
      });
      setSent(true);
    },
    [requestReset]
  );

  const auth = useAuthAction<ResetRequestIntent>({
    execute,
    fallbackCaptchaAction: () => CAPTCHA_ACTION.forgotPassword,
  });

  const submit = form.handleSubmit((intent) => auth.run(intent));

  return {
    busy: auth.busy,
    captcha: auth.captcha,
    error: auth.error,
    errorMessage: auth.errorMessage,
    form,
    onCaptchaToken: auth.onCaptchaToken,
    onCaptchaUnavailable: auth.onCaptchaUnavailable,
    sent,
    submit,
  };
};

export { useRequestPasswordResetModel };
