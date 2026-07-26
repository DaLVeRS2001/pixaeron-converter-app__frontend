import block from 'bem-cn';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import MailCheckIcon from 'shared/assets/icons/mail-check.svg';
import { Alert } from 'shared/ui/Alert';
import { Button } from 'shared/ui/Button';
import { Captcha } from 'shared/ui/Captcha';
import { FormField } from 'shared/ui/FormField';

import { useVerifyEmailModel } from '../model/useVerifyEmailModel';
import type { VerificationViewStatus } from '../model/useVerifyEmailModel';

import '../../ui/AuthForm.scss';

const cn = block('auth-form');

const VerifyEmailStatus = ({ status }: { status: VerificationViewStatus }) => {
  const { t } = useTranslation('auth');

  switch (status) {
    case 'VERIFIED':
      return (
        <Alert variant="success" title={t('verify.emailVerifiedTitle')}>
          {t('verify.emailVerified')}
        </Alert>
      );
    case 'ALREADY_VERIFIED':
      return (
        <Alert variant="success" title={t('verify.alreadyVerifiedTitle')}>
          {t('verify.alreadyVerified')}
        </Alert>
      );
    case 'EXPIRED':
      return (
        <Alert variant="warning" title={t('verify.expiredTitle')}>
          {t('verify.expired')}
        </Alert>
      );
    case 'INVALID':
      return (
        <Alert variant="error" title={t('verify.invalidTitle')}>
          {t('verify.invalid')}
        </Alert>
      );
    case 'RESENT':
      return (
        <Alert variant="success" title={t('verify.resentTitle')}>
          {t('verify.resent')}
        </Alert>
      );
    case 'CHECK_EMAIL':
      return null;
  }
};

const VerifyEmailPanel = () => {
  const { t } = useTranslation('auth');
  const model = useVerifyEmailModel();

  return (
    <div className={cn({ centered: true })}>
      <div className={cn('icon')} aria-hidden="true">
        <MailCheckIcon />
      </div>
      <header className={cn('header')}>
        <h1>{model.verified ? t('verify.confirmedTitle') : t('verify.checkTitle')}</h1>
        <p>
          {model.maskedEmail
            ? t('verify.sentTo', { email: model.maskedEmail })
            : t('verify.openLink')}
        </p>
      </header>
      <div className={cn('stack')}>
        {model.errorMessage ? (
          <Alert variant="error">{model.errorMessage}</Alert>
        ) : (
          <VerifyEmailStatus status={model.status} />
        )}
        {!model.verified && (
          <>
            {model.editingEmail && (
              <FormField
                id="confirmation-email"
                label={t('common.email')}
                type="email"
                autoComplete="email"
                placeholder={t('common.emailPlaceholder')}
                value={model.email}
                onChange={(event) => model.setEmail(event.target.value)}
              />
            )}
            {model.captcha && (
              <Captcha
                key={`${model.captcha.action}-${model.captcha.version}`}
                action={model.captcha.action}
                onToken={model.onCaptchaToken}
                onUnavailable={model.onCaptchaUnavailable}
              />
            )}
            <Button
              onClick={model.resendEmail}
              disabled={
                model.busy ||
                !model.email.trim() ||
                model.cooldown > 0 ||
                Boolean(model.captcha)
              }
            >
              {model.busy
                ? t('verify.sending')
                : model.cooldown > 0
                  ? t('verify.resendIn', { seconds: model.cooldown })
                  : t('verify.resend')}
            </Button>
          </>
        )}
      </div>

      <Link className={cn('back')} to={model.verified ? '/sign-in?verified=1' : '/sign-in'}>
        {t('common.backToSignIn')}
      </Link>
    </div>
  );
};

export { VerifyEmailPanel };
