import { useTranslation } from 'react-i18next';
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';

import { Button } from 'shared/ui/Button';
import { PageMessage } from 'shared/ui/PageMessage';

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
    <PageMessage
      title={t('routeError.title')}
      details={__IS_DEV__ ? message : undefined}
      alert
      actions={
        <>
          <Button variant="secondary" onClick={() => navigate('/')}>
            {t('routeError.home')}
          </Button>
          <Button onClick={() => window.location.reload()}>{t('routeError.reload')}</Button>
        </>
      }
    />
  );
};

export { RouteErrorBoundary };
