import block from 'bem-cn';
import { useTranslation } from 'react-i18next';
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';

import { Button } from 'shared/ui/Button';

import './RouteErrorBoundary.scss';

const cn = block('route-error-boundary');

const RouteErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : t('routeError.unknown');

  return (
    <main className={cn()}>
      <div className={cn('content')}>
        <h1 className={cn('title')}>{t('routeError.title')}</h1>
        {__IS_DEV__ && <pre className={cn('details')}>{message}</pre>}
        <div className={cn('actions')}>
          <Button variant="secondary" onClick={() => navigate('/')}>
            {t('routeError.home')}
          </Button>
          <Button onClick={() => window.location.reload()}>{t('routeError.reload')}</Button>
        </div>
      </div>
    </main>
  );
};

export { RouteErrorBoundary };
