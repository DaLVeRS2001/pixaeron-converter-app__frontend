import block from 'bem-cn';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';

import { Alert } from 'shared/ui/Alert';
import { Button } from 'shared/ui/Button';
import { Captcha } from 'shared/ui/Captcha';
import { FormField } from 'shared/ui/FormField';
import { GoogleButton } from 'shared/ui/GoogleButton';

import { useSignInModel } from '../model/useSignInModel';

import '../../ui/AuthForm.scss';

const cn = block('auth-form');

const SignInForm = () => {
  const { t } = useTranslation('auth');
  const [searchParams] = useSearchParams();
  const model = useSignInModel();
  const { errors } = model.form.formState;

  return (
    <div className={cn()}>
      <header className={cn('header')}>
        <h1>{t('signIn.title')}</h1>
        <p>{t('signIn.subtitle')}</p>
      </header>
      <div className={cn('stack')}>
        {searchParams.get('verified') === '1' && (
          <Alert variant="success">{t('signIn.verified')}</Alert>
        )}
        {model.errorMessage && <Alert variant="error">{model.errorMessage}</Alert>}
        <form className={cn('stack')} onSubmit={model.submit} noValidate>
          <FormField
            id="sign-in-email"
            label={t('common.email')}
            type="email"
            autoComplete="email"
            placeholder={t('common.emailPlaceholder')}
            error={errors.email?.message}
            {...model.form.register('email')}
          />
          <div>
            <div className={cn('row')}>
              <span>{t('common.password')}</span>
              <Link className={cn('link')} to="/forgot-password">
                {t('signIn.forgotPassword')}
              </Link>
            </div>
            <FormField
              id="sign-in-password"
              label=""
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...model.form.register('password')}
            />
          </div>
          <label className={cn('checkbox')}>
            <input type="checkbox" {...model.form.register('rememberMe')} />
            {t('signIn.rememberMe')}
          </label>
          {model.captcha && (
            <Captcha
              key={`${model.captcha.action}-${model.captcha.version}`}
              action={model.captcha.action}
              onToken={model.onCaptchaToken}
              onUnavailable={model.onCaptchaUnavailable}
            />
          )}
          <Button type="submit" disabled={model.busy || Boolean(model.captcha)}>
            {model.busy ? t('signIn.submitting') : t('signIn.submit')}
          </Button>
        </form>
        <div className={cn('divider')}>{t('signIn.divider')}</div>
        <GoogleButton
          mode="signin_with"
          onCredential={model.submitGoogle}
          onUnavailable={model.onGoogleUnavailable}
        />
      </div>
      <p className={cn('footer')}>
        {t('signIn.noAccount')}
        <Link className={cn('link')} to="/sign-up">
          {t('signIn.createAccount')}
        </Link>
      </p>
      <Link className={cn('back')} to="/">
        {t('signIn.back')}
      </Link>
    </div>
  );
};

export { SignInForm };
