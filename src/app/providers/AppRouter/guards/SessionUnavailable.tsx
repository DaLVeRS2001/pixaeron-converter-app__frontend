import { useTranslation } from 'react-i18next';

import { Button } from 'shared/ui/Button';
import { PageMessage } from 'shared/ui/PageMessage';

const SessionUnavailable = ({ retry }: { retry: () => void }) => {
  const { t } = useTranslation();

  return (
    <PageMessage
      title={t('session.unavailableTitle')}
      description={t('session.unavailable')}
      alert
      actions={<Button onClick={retry}>{t('session.retry')}</Button>}
    />
  );
};

export { SessionUnavailable };
