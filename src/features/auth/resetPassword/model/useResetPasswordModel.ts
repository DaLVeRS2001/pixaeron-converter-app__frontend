import { useMutation } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ResetPasswordDocument } from 'shared/api';
import type { PasswordResetStatus } from 'shared/api';

import { translateAuthError } from '../../model/errors';
import { createResetPasswordSchema } from '../../model/schemas';
import type { ResetPasswordFormValues } from '../../model/schemas';

const useResetPasswordModel = () => {
  const { t } = useTranslation('auth');
  const [token] = useState(
    () => new URLSearchParams(window.location.hash.slice(1)).get('token') ?? ''
  );
  const [status, setStatus] = useState<PasswordResetStatus>();
  const [errorMessage, setErrorMessage] = useState('');
  const schema = useMemo(() => createResetPasswordSchema(t), [t]);
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });
  const [resetPassword, { loading }] = useMutation(ResetPasswordDocument);

  useEffect(() => {
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${window.location.search}`
    );
  }, []);

  const submit = form.handleSubmit(async ({ password }) => {
    if (!token) return;
    setErrorMessage('');
    try {
      const { data } = await resetPassword({ variables: { input: { token, password } } });
      if (data?.resetPassword.status) setStatus(data.resetPassword.status);
    } catch (error) {
      setErrorMessage(translateAuthError(error, t).message);
    }
  });

  return {
    complete: status === 'RESET',
    errorMessage,
    form,
    loading,
    status,
    submit,
    tokenPresent: Boolean(token),
  };
};

export { useResetPasswordModel };
