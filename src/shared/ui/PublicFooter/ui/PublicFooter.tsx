import block from 'bem-cn';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import './PublicFooter.scss';

const cn = block('public-footer');

const PublicFooter = () => {
  const { t } = useTranslation();
  return (
    <footer className={cn()}>
      <span>{t('footer.copyright', { year: new Date().getFullYear() })}</span>
      <nav className={cn('links')} aria-label="Legal">
        <Link to="/privacy">{t('footer.privacy')}</Link>
        <Link to="/terms">{t('footer.terms')}</Link>
        <Link to="/sign-in">{t('footer.signIn')}</Link>
      </nav>
    </footer>
  );
};

export { PublicFooter };
