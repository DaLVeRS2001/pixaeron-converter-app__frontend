import block from 'bem-cn';
import { Link } from 'react-router-dom';

import { useCurrentUser } from 'entities/user';

import { LanguageSwitcher } from 'features/changeLanguage';

import { BrandLogo } from 'shared/ui/BrandLogo';

import './Header.scss';

const cn = block('header');

const Header = () => {
  const session = useCurrentUser();

  return (
    <header className={cn()}>
      <div className={cn('inner')}>
        <Link to="/app" className={cn('logo')}>
          <BrandLogo />
        </Link>
        <div className={cn('actions')}>
          <LanguageSwitcher />
          {session.status === 'authenticated' && (
            <span className={cn('user')}>{session.user.username}</span>
          )}
        </div>
      </div>
    </header>
  );
};

export { Header };
