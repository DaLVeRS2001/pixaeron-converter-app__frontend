import block from 'bem-cn';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcher } from 'features/changeLanguage';

import authHero from 'shared/assets/auth-hero.webp';
import { BrandLogo } from 'shared/ui/BrandLogo';

import './AuthShell.scss';

type AuthShellProps = {
  variant: 'signin' | 'signup' | 'centered';
  children: ReactNode;
};

const cn = block('auth-shell');

const AuthShell = ({ variant, children }: AuthShellProps) => {
  const { t } = useTranslation('auth');

  if (variant === 'centered') {
    return (
      <main className={cn({ variant })}>
        <div className={cn('language')}>
          <LanguageSwitcher />
        </div>
        <BrandLogo />
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
        <BrandLogo light={variant === 'signup'} large={variant === 'signup'} />
        <div className={cn('visual-copy')}>
          <h1>{variant === 'signin' ? t('shell.signInTitle') : t('shell.signUpTitle')}</h1>
          {variant === 'signup' && (
            <>
              <p>{t('shell.signUpDescription')}</p>
              <ul className={cn('benefits')}>
                <li>{t('shell.benefitCompression')}</li>
                <li>{t('shell.benefitStorage')}</li>
                <li>{t('shell.benefitFreeTier')}</li>
              </ul>
            </>
          )}
        </div>
        {variant === 'signin' && (
          <img className={cn('hero')} src={authHero} alt={t('shell.heroAlt')} />
        )}
      </section>
      <section className={cn('content')}>{children}</section>
    </main>
  );
};

export { AuthShell };
