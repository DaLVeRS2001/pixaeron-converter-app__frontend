import { useTranslation } from 'react-i18next';

import { Button } from 'shared/ui/Button';

const SessionUnavailable = ({ retry }: { retry: () => void }) => {
  const { t } = useTranslation();
  return (
    <main role="alert">
      <h1>{t('session.unavailableTitle')}</h1>
      <p>{t('session.unavailable')}</p>
      <Button onClick={retry}>{t('session.retry')}</Button>
    </main>
  );
};

export { SessionUnavailable };
