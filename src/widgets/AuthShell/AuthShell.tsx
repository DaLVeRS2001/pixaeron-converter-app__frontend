import block from 'bem-cn';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { LanguageSwitcher } from 'features/changeLanguage';

import CompressionArt from 'shared/assets/auth-compression.svg';
import { BrandLogo } from 'shared/ui/BrandLogo';
import { SVG } from 'shared/ui/SVG';

import './AuthShell.scss';

type AuthShellProps = {
  variant: 'signin' | 'signup' | 'centered';
  children: ReactNode;
};

const cn = block('auth-shell');

const AuthShell = ({ variant, children }: AuthShellProps) => {
  const { t } = useTranslation('auth');

  const logoLink = (
    <Link to="/" className={cn('logo')} aria-label={t('shell.home')}>
      <BrandLogo light={variant !== 'centered'} />
    </Link>
  );

  if (variant === 'centered') {
    return (
      <main className={cn({ variant })}>
        <div className={cn('language')}>
          <LanguageSwitcher />
        </div>
        {logoLink}
        <section className={cn('card')}>{children}</section>
      </main>
    );
  }

  return (
    <main className={cn({ variant })}>
      <div className={cn('language')}>
        <LanguageSwitcher />
      </div>
      <section className={cn('visual')}>
        {logoLink}
        <div className={cn('visual-copy')}>
          <h1>{variant === 'signin' ? t('shell.signInTitle') : t('shell.signUpTitle')}</h1>
          <p>
            {variant === 'signin'
              ? t('shell.signInDescription')
              : t('shell.signUpDescription')}
          </p>
          {variant === 'signup' && (
            <ul className={cn('benefits')}>
              <li>{t('shell.benefitCompression')}</li>
              <li>{t('shell.benefitStorage')}</li>
              <li>{t('shell.benefitFreeTier')}</li>
            </ul>
          )}
        </div>
        <SVG Svg={CompressionArt} className={cn('art').toString()} aria-hidden="true" />
      </section>
      <section className={cn('content')}>{children}</section>
    </main>
  );
};

export { AuthShell };
