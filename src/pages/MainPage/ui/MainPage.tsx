import block from 'bem-cn';
import { useTranslation } from 'react-i18next';

import { useCurrentUser } from 'entities/user';

import './MainPage.scss';

const cn = block('main-page');

const MainPage = () => {
  const { t } = useTranslation();
  const session = useCurrentUser();
  if (session.status !== 'authenticated') return null;

  return (
    <section className={cn()}>
      <p className={cn('eyebrow')}>{t('main.accountReady')}</p>
      <h1>{t('main.welcome', { username: session.user.username })}</h1>
      <p className={cn('lead')}>{t('main.description')}</p>
      <dl className={cn('details')}>
        <div>
          <dt>{t('main.email')}</dt>
          <dd>{session.user.email}</dd>
        </div>
        <div>
          <dt>{t('main.verification')}</dt>
          <dd>{session.user.emailVerified ? t('main.verified') : t('main.pending')}</dd>
        </div>
      </dl>
    </section>
  );
};

export { MainPage };
