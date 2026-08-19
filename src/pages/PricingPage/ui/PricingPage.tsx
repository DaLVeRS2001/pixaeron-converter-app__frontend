import block from 'bem-cn';
import { useTranslation } from 'react-i18next';

import { PublicFooter } from 'widgets/PublicFooter';
import { PublicHeader } from 'widgets/PublicHeader';

import { Button } from 'shared/ui/Button';

import './PricingPage.scss';

const cn = block('pricing-page');

const PLANS = [
  {
    code: 'free',
    price: '$0',
    featured: false,
    storage: '1 GB',
    retentionHours: 48,
    retentionDays: null,
    dailyFiles: 50,
    batchFiles: 5,
    fileSize: '10 MB',
    queue: 'standard',
    concurrent: 1,
  },
  {
    code: 'light',
    price: '$2.25',
    featured: true,
    storage: '2 GB',
    retentionHours: null,
    retentionDays: 7,
    dailyFiles: null,
    batchFiles: 10,
    fileSize: '75 MB',
    queue: 'priority',
    concurrent: 3,
  },
  {
    code: 'pro',
    price: '$10',
    featured: false,
    storage: '10 GB',
    retentionHours: null,
    retentionDays: 7,
    dailyFiles: null,
    batchFiles: 20,
    fileSize: '150 MB',
    queue: 'fastest',
    concurrent: 8,
  },
] as const;

const PricingPage = () => {
  const { t } = useTranslation();

  return (
    <div className={cn()}>
      <PublicHeader />
      <main className={cn('main')}>
        <h1>{t('pricing.title')}</h1>
        <p className={cn('lead')}>{t('pricing.lead')}</p>

        <div className={cn('grid')}>
          {PLANS.map((plan) => (
            <article key={plan.code} className={cn('card', { featured: plan.featured })}>
              {plan.featured && <span className={cn('badge')}>{t('pricing.popular')}</span>}
              <h2>{t(`pricing.${plan.code}.name`)}</h2>
              <p className={cn('price')}>
                {plan.price}
                <span>{t('pricing.perMonth')}</span>
              </p>
              <p className={cn('summary')}>{t(`pricing.${plan.code}.summary`)}</p>

              <ul>
                <li>{t('pricing.feature.storage', { size: plan.storage })}</li>
                <li>
                  {plan.retentionDays
                    ? t('pricing.feature.retentionDays', { days: plan.retentionDays })
                    : t('pricing.feature.retentionHours', { hours: plan.retentionHours })}
                </li>
                <li>
                  {plan.dailyFiles
                    ? t('pricing.feature.daily', { files: plan.dailyFiles })
                    : t('pricing.feature.dailyUnlimited')}
                </li>
                <li>{t('pricing.feature.batch', { files: plan.batchFiles })}</li>
                <li>{t('pricing.feature.fileSize', { size: plan.fileSize })}</li>
                <li>{t(`pricing.feature.queue.${plan.queue}`)}</li>
                <li>{t('pricing.feature.concurrent', { count: plan.concurrent })}</li>
              </ul>

              <Button variant={plan.featured ? 'primary' : 'secondary'} disabled>
                {t(`pricing.${plan.code}.action`)}
              </Button>
            </article>
          ))}
        </div>

        <p className={cn('note')}>{t('pricing.note')}</p>
      </main>
      <PublicFooter />
    </div>
  );
};

export { PricingPage };
