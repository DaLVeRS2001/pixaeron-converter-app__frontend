import { useMutation } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ResetPasswordDocument, getGraphQLErrorDetails } from 'shared/api';
import type { GraphQLErrorDetails, PasswordResetStatus } from 'shared/api';

import { authErrorMessage } from '../../model/errors';
import { resetPasswordSchema } from '../../model/schemas';
import type { ResetPasswordFormValues } from '../../model/schemas';

const useResetPasswordModel = () => {
  const { t } = useTranslation('auth');
  const [token] = useState(
    () => new URLSearchParams(window.location.hash.slice(1)).get('token') ?? ''
  );
  const [status, setStatus] = useState<PasswordResetStatus>();
  const [authError, setAuthError] = useState<GraphQLErrorDetails>();
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
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
    setAuthError(undefined);
    try {
      const { data } = await resetPassword({ variables: { input: { token, password } } });
      if (data?.resetPassword.status) setStatus(data.resetPassword.status);
    } catch (error) {
      setAuthError(getGraphQLErrorDetails(error));
    }
  });

  return {
    complete: status === 'RESET',
    error: authError,
    errorMessage: authError ? authErrorMessage(authError, t) : '',
    form,
    loading,
    status,
    submit,
    tokenPresent: Boolean(token),
  };
};

export { useResetPasswordModel };
