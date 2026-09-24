import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import block from 'bem-cn';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

import { useCurrentUser } from 'entities/user';

import { LanguageSwitcher } from 'features/changeLanguage';
import { ThemeToggle } from 'features/toggleTheme';

import MenuIcon from 'shared/assets/icons/menu.svg';
import CloseIcon from 'shared/assets/icons/x.svg';
import { BrandLogo } from 'shared/ui/BrandLogo';
import { Button } from 'shared/ui/Button';
import { SVG } from 'shared/ui/SVG';

import './PublicHeader.scss';

const cn = block('public-header');

const NAV_LINKS = [
  { to: '/#compress', key: 'compressor' },
  { to: '/pricing', key: 'pricing' },
] as const;

const PublicHeader = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const session = useCurrentUser();
  const signedIn = session.status === 'authenticated';

  const links = NAV_LINKS.map((link) => (
    <Link key={link.key} to={link.to}>
      {t(`publicHeader.${link.key}`)}
    </Link>
  ));
  const sessionActions = signedIn ? (
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
  );

  return (
    <Disclosure key={location.key} as="header" className={cn().toString()}>
      {({ open }) => (
        <>
          <Link
            to={signedIn ? '/app' : '/'}
            className={cn('logo')}
            aria-label={t('publicHeader.home')}
          >
            <BrandLogo />
          </Link>

          <nav className={cn('nav')} aria-label={t('publicHeader.navLabel')}>
            {links}
          </nav>

          <div className={cn('controls')}>
            <ThemeToggle />
            <DisclosureButton
              className={cn('burger').toString()}
              aria-label={open ? t('publicHeader.closeMenu') : t('publicHeader.menu')}
            >
              <SVG
                Svg={open ? CloseIcon : MenuIcon}
                className={cn('burger-icon').toString()}
              />
            </DisclosureButton>
          </div>

          <div className={cn('actions')}>
            <LanguageSwitcher />
            {sessionActions}
          </div>

          <DisclosurePanel className={cn('panel').toString()}>
            <nav className={cn('panel-nav')} aria-label={t('publicHeader.navLabel')}>
              {links}
            </nav>
            <div className={cn('panel-actions')}>
              <LanguageSwitcher />
              {sessionActions}
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
};

export { PublicHeader };
