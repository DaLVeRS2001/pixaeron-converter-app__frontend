import block from 'bem-cn';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import LockIcon from 'shared/assets/icons/lock.svg';
import { Alert } from 'shared/ui/Alert';
import { Button } from 'shared/ui/Button';
import { Captcha } from 'shared/ui/Captcha';
import { FormField } from 'shared/ui/FormField';

import { GoogleButton } from '../../google/ui/GoogleButton';
import { validationMessage } from '../../model/schemas';
import { LegalNotice } from '../../ui/LegalNotice';
import { useSignUpModel } from '../model/useSignUpModel';

import '../../ui/AuthForm.scss';

const cn = block('auth-form');

const SignUpForm = () => {
  const { t } = useTranslation('auth');
  const model = useSignUpModel();
  const { errors } = model.form.formState;

  return (
    <div className={cn()}>
      <header className={cn('header')}>
        <h1>{t('signUp.title')}</h1>
        <p>{t('signUp.subtitle')}</p>
      </header>
      <div className={cn('stack')}>
        {model.errorMessage && <Alert variant="error">{model.errorMessage}</Alert>}
        <GoogleButton
          caption={<LegalNotice lead={t('legal.continueWithGoogle')} />}
          onCredential={model.submitGoogle}
          onUnavailable={model.onGoogleUnavailable}
        />
        {__GOOGLE_CLIENT_ID__ && <div className={cn('divider')}>{t('signUp.divider')}</div>}
        <form className={cn('stack')} onSubmit={model.submit} noValidate>
          <FormField
            id="sign-up-username"
            label={t('common.username')}
            autoComplete="username"
            placeholder={t('signUp.usernamePlaceholder')}
            error={validationMessage(t, errors.username?.message)}
            {...model.form.register('username')}
          />
          <FormField
            id="sign-up-email"
            label={t('common.email')}
            type="email"
            autoComplete="email"
            placeholder={t('common.emailPlaceholder')}
            error={validationMessage(t, errors.email?.message)}
            {...model.form.register('email')}
          />
          <FormField
            id="sign-up-password"
            label={t('common.password')}
            type="password"
            autoComplete="new-password"
            error={validationMessage(t, errors.password?.message)}
            {...model.form.register('password')}
          />
          <div
            className={cn('strength')}
            aria-label={t('signUp.strength', { value: model.strength })}
          >
            {[1, 2, 3, 4].map((segment) => (
              <span
                key={segment}
                className={cn('strength-segment', {
                  active: segment <= model.strength,
                  strong: model.strength === 4,
                })}
              />
            ))}
          </div>
          <FormField
            id="sign-up-confirm-password"
            label={t('common.confirmPassword')}
            type="password"
            autoComplete="new-password"
            error={validationMessage(t, errors.confirmPassword?.message)}
            {...model.form.register('confirmPassword')}
          />
          {model.captcha && (
            <Captcha
              key={`${model.captcha.action}-${model.captcha.version}`}
              action={model.captcha.action}
              onToken={model.onCaptchaToken}
              onUnavailable={model.onCaptchaUnavailable}
            />
          )}
          <Button
            type="submit"
            aria-describedby="sign-up-legal"
            disabled={model.busy || Boolean(model.captcha)}
          >
            {model.busy ? t('signUp.submitting') : t('signUp.submit')}
          </Button>
          <LegalNotice id="sign-up-legal" lead={t('legal.createAccount')} />
          <p className={cn('security-note')}>
            <LockIcon aria-hidden="true" />
            {t('signUp.security')}
          </p>
        </form>
      </div>
      <p className={cn('footer')}>
        {t('signUp.hasAccount')}{' '}
        <Link className={cn('link')} to="/sign-in">
          {t('common.signIn')}
        </Link>
      </p>
    </div>
  );
};

export { SignUpForm };
