import block from 'bem-cn';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { BrandLogo } from 'shared/ui/BrandLogo';

import './PublicFooter.scss';

const cn = block('public-footer');

const PublicFooter = () => {
  const { t } = useTranslation();

  return (
    <footer className={cn()}>
      <div className={cn('inner')}>
        <div className={cn('brand')}>
          <BrandLogo />
          <p>{t('footer.tagline')}</p>
        </div>

        <nav className={cn('column')} aria-label={t('footer.product')}>
          <h3>{t('footer.product')}</h3>
          <Link to="/#compress">{t('footer.compressor')}</Link>
          <Link to="/pricing">{t('footer.pricing')}</Link>
        </nav>

        <nav className={cn('column')} aria-label={t('footer.account')}>
          <h3>{t('footer.account')}</h3>
          <Link to="/sign-in">{t('footer.signIn')}</Link>
          <Link to="/sign-up">{t('footer.signUp')}</Link>
        </nav>

        <nav className={cn('column')} aria-label={t('footer.legal')}>
          <h3>{t('footer.legal')}</h3>
          <Link to="/terms">{t('footer.terms')}</Link>
          <Link to="/privacy">{t('footer.privacy')}</Link>
        </nav>
      </div>

      <p className={cn('copyright')}>
        {t('footer.copyright', { year: new Date().getFullYear() })}
      </p>
    </footer>
  );
};

export { PublicFooter };
