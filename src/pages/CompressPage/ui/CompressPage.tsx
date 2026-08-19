import block from 'bem-cn';
import { useTranslation } from 'react-i18next';

import { CompressorWidget } from 'widgets/CompressorWidget';

import './CompressPage.scss';

const cn = block('compress-page');

const CompressPage = () => {
  const { t } = useTranslation();

  return (
    <section className={cn()}>
      <h1>{t('app.compress.title')}</h1>
      <p className={cn('lead')}>{t('app.compress.lead')}</p>
      <CompressorWidget />
    </section>
  );
};

export { CompressPage };
