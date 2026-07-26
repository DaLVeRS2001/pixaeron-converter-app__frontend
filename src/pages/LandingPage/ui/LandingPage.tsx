import block from 'bem-cn';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { LanguageSwitcher } from 'features/changeLanguage';

import { BrandLogo } from 'shared/ui/BrandLogo';
import { Button } from 'shared/ui/Button';
import { PublicFooter } from 'shared/ui/PublicFooter';

import './LandingPage.scss';

const cn = block('landing-page');

const LandingPage = () => {
  const { t } = useTranslation();
  return (
    <div className={cn()}>
      <header className={cn('header')}>
        <Link to="/" aria-label="Pixaeron home">
          <BrandLogo />
        </Link>
        <nav className={cn('nav')}>
          <LanguageSwitcher />
          <Link to="/privacy">{t('footer.privacy')}</Link>
          <Link to="/terms">{t('footer.terms')}</Link>
          <Button to="/sign-in" variant="secondary">
            {t('landing.signIn')}
          </Button>
        </nav>
      </header>
      <main>
        <section className={cn('hero')}>
          <p className={cn('eyebrow')}>{t('landing.eyebrow')}</p>
          <h1>{t('landing.title')}</h1>
          <p className={cn('lead')}>{t('landing.description')}</p>
          <p className={cn('google-data')}>{t('landing.googleData')}</p>
          <div className={cn('actions')}>
            <Button to="/sign-up">{t('landing.start')}</Button>
            <Button to="/sign-in" variant="secondary">
              {t('landing.signIn')}
            </Button>
          </div>
        </section>
        <section className={cn('features')} aria-label="Pixaeron benefits">
          <article>
            <h2>{t('landing.formats')}</h2>
            <p>{t('landing.formatsDescription')}</p>
          </article>
          <article>
            <h2>{t('landing.speed')}</h2>
            <p>{t('landing.speedDescription')}</p>
          </article>
          <article>
            <h2>{t('landing.security')}</h2>
            <p>{t('landing.securityDescription')}</p>
          </article>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
};

export { LandingPage };
