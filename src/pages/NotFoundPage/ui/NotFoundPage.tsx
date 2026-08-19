import { useTranslation } from 'react-i18next';

import { Button } from 'shared/ui/Button';
import { PageMessage } from 'shared/ui/PageMessage';

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <PageMessage
      code="404"
      title={t('notFound.title')}
      description={t('notFound.description')}
      actions={
        <>
          <Button to="/">{t('notFound.home')}</Button>
          <Button to="/sign-in" variant="text">
            {t('notFound.signIn')}
          </Button>
        </>
      }
    />
  );
};

export { NotFoundPage };
