import block from 'bem-cn';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button } from 'shared/ui/Button';

import './NotFoundPage.scss';

const cn = block('not-found-page');

const NotFoundPage = () => {
  const { t } = useTranslation();
  return (
    <main className={cn()}>
      <p>404</p>
      <h1>{t('notFound.title')}</h1>
      <div className={cn('button')}>
        <Button to="/">{t('notFound.home')}</Button>
      </div>
      <Link to="/sign-in">{t('notFound.signIn')}</Link>
    </main>
  );
};

export { NotFoundPage };
