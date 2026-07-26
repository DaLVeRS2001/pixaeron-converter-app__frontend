import block from 'bem-cn';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import LockIcon from 'shared/assets/icons/lock.svg';
import { Alert } from 'shared/ui/Alert';
import { Button } from 'shared/ui/Button';
import { Captcha } from 'shared/ui/Captcha';
import { FormField } from 'shared/ui/FormField';

import { useRequestPasswordResetModel } from '../model/useRequestPasswordResetModel';

import '../../ui/AuthForm.scss';

const cn = block('auth-form');

const RequestPasswordResetForm = () => {
  const { t } = useTranslation('auth');
  const model = useRequestPasswordResetModel();
  const { errors } = model.form.formState;

  return (
    <div className={cn({ centered: true })}>
      <div className={cn('icon')} aria-hidden="true">
        <LockIcon />
      </div>
      <header className={cn('header')}>
        <h1>{t('forgot.title')}</h1>
        <p>{t('forgot.subtitle')}</p>
      </header>
      <div className={cn('stack')}>
        {model.sent && (
          <Alert variant="success" title={t('forgot.sentTitle')}>
            {t('forgot.sent')}
          </Alert>
        )}
        {model.errorMessage && <Alert variant="error">{model.errorMessage}</Alert>}
        <form className={cn('stack')} onSubmit={model.submit} noValidate>
          <FormField
            id="forgot-email"
            label={t('common.email')}
            type="email"
            autoComplete="email"
            placeholder={t('common.emailPlaceholder')}
            error={errors.email?.message}
            {...model.form.register('email')}
          />
          {model.captcha && (
            <Captcha
              key={`${model.captcha.action}-${model.captcha.version}`}
              action={model.captcha.action}
              onToken={model.onCaptchaToken}
              onUnavailable={model.onCaptchaUnavailable}
            />
          )}
          <Button type="submit" disabled={model.busy || Boolean(model.captcha)}>
            {model.busy ? t('forgot.submitting') : t('forgot.submit')}
          </Button>
        </form>
      </div>
      <p className={cn('footer')}>
        {t('forgot.remember')}
        <Link className={cn('link')} to="/sign-in">
          {t('common.signIn')}
        </Link>
      </p>
      <p className={cn('footer')}>
        {t('forgot.noAccount')}
        <Link className={cn('link')} to="/sign-up">
          {t('common.signUp')}
        </Link>
      </p>
    </div>
  );
};

export { RequestPasswordResetForm };
