import { useApolloClient, useMutation } from '@apollo/client/react';
import block from 'bem-cn';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { LanguageSwitcher } from 'features/changeLanguage';

import { LogoutDocument } from 'shared/api';
import { BrandLogo } from 'shared/ui/BrandLogo';
import { Button } from 'shared/ui/Button';

import './Header.scss';

const cn = block('header');

const Header = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const apolloClient = useApolloClient();
  const [logout, { loading }] = useMutation(LogoutDocument);

  const onLogout = async () => {
    try {
      await logout();
    } finally {
      try {
        await apolloClient.resetStore();
      } finally {
        navigate('/sign-in', { replace: true });
      }
    }
  };

  return (
    <header className={cn()}>
      <div className={cn('inner')}>
        <BrandLogo />
        <div className={cn('actions')}>
          <LanguageSwitcher />
          <div className={cn('logout')}>
            <Button variant="secondary" onClick={onLogout} disabled={loading}>
              {loading ? t('header.signingOut') : t('header.signOut')}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export { Header };
