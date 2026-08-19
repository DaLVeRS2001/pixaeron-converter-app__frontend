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
    highlights: [
      'pricing.free.storage',
      'pricing.free.retention',
      'pricing.free.daily',
      'pricing.free.fileSize',
    ],
    featured: false,
  },
  {
    code: 'light',
    price: '$2.25',
    highlights: [
      'pricing.light.storage',
      'pricing.light.retention',
      'pricing.light.fileSize',
      'pricing.light.queue',
    ],
    featured: true,
  },
  {
    code: 'pro',
    price: '$10',
    highlights: [
      'pricing.pro.storage',
      'pricing.pro.retention',
      'pricing.pro.fileSize',
      'pricing.pro.queue',
    ],
    featured: false,
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
                {plan.highlights.map((highlight) => (
                  <li key={highlight}>{t(highlight)}</li>
                ))}
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
