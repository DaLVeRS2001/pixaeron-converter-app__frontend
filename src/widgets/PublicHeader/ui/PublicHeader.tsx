import block from 'bem-cn';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useCurrentUser } from 'entities/user';

import { LanguageSwitcher } from 'features/changeLanguage';

import { BrandLogo } from 'shared/ui/BrandLogo';
import { Button } from 'shared/ui/Button';

import './PublicHeader.scss';

const cn = block('public-header');

const PublicHeader = () => {
  const { t } = useTranslation();
  const session = useCurrentUser();
  const signedIn = session.status === 'authenticated';

  return (
    <header className={cn()}>
      <Link
        to={signedIn ? '/app' : '/'}
        className={cn('logo')}
        aria-label={t('publicHeader.home')}
      >
        <BrandLogo />
      </Link>

      <nav className={cn('nav')} aria-label={t('publicHeader.navLabel')}>
        <Link to="/#compress">{t('publicHeader.compressor')}</Link>
        <Link to="/pricing">{t('publicHeader.pricing')}</Link>
      </nav>

      <div className={cn('actions')}>
        <LanguageSwitcher />
        {signedIn ? (
          <Button to="/app" variant="secondary">
            {t('publicHeader.dashboard')}
          </Button>
        ) : (
          <>
            <Link to="/sign-in" className={cn('sign-in')}>
              {t('publicHeader.signIn')}
            </Link>
            <Button to="/sign-up">{t('publicHeader.getStarted')}</Button>
          </>
        )}
      </div>
    </header>
  );
};

export { PublicHeader };
