import block from 'bem-cn';
import { useTranslation } from 'react-i18next';

import KeyIcon from 'shared/assets/icons/key.svg';
import { Alert } from 'shared/ui/Alert';
import { Button } from 'shared/ui/Button';
import { FormField } from 'shared/ui/FormField';

import { validationMessage } from '../../model/schemas';
import { useResetPasswordModel } from '../model/useResetPasswordModel';

import '../../ui/AuthForm.scss';

const cn = block('auth-form');

const ResetPasswordForm = () => {
  const { t } = useTranslation('auth');
  const model = useResetPasswordModel();
  const { errors } = model.form.formState;

  return (
    <div className={cn({ centered: true })}>
      <div className={cn('icon')} aria-hidden="true">
        <KeyIcon />
      </div>
      <header className={cn('header')}>
        <h1>{model.complete ? t('reset.updatedTitle') : t('reset.title')}</h1>
        <p>{model.complete ? t('reset.updatedSubtitle') : t('reset.subtitle')}</p>
      </header>
      <div className={cn('stack')}>
        {!model.tokenPresent && (
          <Alert variant="error" title={t('reset.invalidTitle')}>
            {t('reset.requestNew')}
          </Alert>
        )}
        {model.status === 'EXPIRED' && (
          <Alert variant="warning" title={t('reset.expiredTitle')}>
            {t('reset.requestNew')}
          </Alert>
        )}
        {model.status === 'INVALID' && (
          <Alert variant="error" title={t('reset.invalidTitle')}>
            {t('reset.invalid')}
          </Alert>
        )}
        {model.status === 'ALREADY_USED' && (
          <Alert variant="info" title={t('reset.usedTitle')}>
            {t('reset.used')}
          </Alert>
        )}
        {model.complete && <Alert variant="success">{t('reset.success')}</Alert>}
        {model.errorMessage && <Alert variant="error">{model.errorMessage}</Alert>}
        {model.tokenPresent && !model.status && (
          <form className={cn('stack')} onSubmit={model.submit} noValidate>
            <FormField
              id="reset-password"
              label={t('common.newPassword')}
              type="password"
              autoComplete="new-password"
              error={validationMessage(t, errors.password?.message)}
              {...model.form.register('password')}
            />
            <FormField
              id="reset-confirm-password"
              label={t('common.confirmPassword')}
              type="password"
              autoComplete="new-password"
              error={validationMessage(t, errors.confirmPassword?.message)}
              {...model.form.register('confirmPassword')}
            />
            <Button type="submit" disabled={model.loading}>
              {model.loading ? t('reset.submitting') : t('reset.submit')}
            </Button>
          </form>
        )}
        {(model.complete || model.status || !model.tokenPresent) && (
          <Button to={model.complete ? '/sign-in' : '/forgot-password'}>
            {model.complete ? t('reset.continue') : t('reset.request')}
          </Button>
        )}
      </div>
    </div>
  );
};

export { ResetPasswordForm };
