import block from 'bem-cn';
import { useTranslation } from 'react-i18next';

import { formatBytes, savedPercent } from 'entities/conversion';

import { CompressorWidget } from 'widgets/CompressorWidget';
import { PublicFooter } from 'widgets/PublicFooter';
import { PublicHeader } from 'widgets/PublicHeader';

import BroomIcon from 'shared/assets/icons/broom.svg';
import GaugeIcon from 'shared/assets/icons/gauge.svg';
import LayersIcon from 'shared/assets/icons/layers.svg';
import LightningIcon from 'shared/assets/icons/lightning.svg';
import ShieldIcon from 'shared/assets/icons/shield-check.svg';
import SwapIcon from 'shared/assets/icons/swap.svg';
import seaCompressed from 'shared/assets/images/sea-compressed.webp';
import seaOriginal from 'shared/assets/images/sea-original.webp';
import { Button } from 'shared/ui/Button';
import { SVG } from 'shared/ui/SVG';

import './LandingPage.scss';

const cn = block('landing-page');

const ADVANTAGES = [
  { key: 'engine', Icon: GaugeIcon },
  { key: 'metadata', Icon: BroomIcon },
  { key: 'noSignup', Icon: LightningIcon },
  { key: 'formats', Icon: LayersIcon },
  { key: 'honest', Icon: SwapIcon },
  { key: 'access', Icon: ShieldIcon },
] as const;

const SAMPLE = {
  width: 3872,
  height: 2592,
  format: 'JPEG',
  preview: { width: 1600, height: 1071 },
  original: { bytes: 3370083, preview: seaOriginal, file: '/samples/sea-original.jpg' },
  compressed: { bytes: 297852, preview: seaCompressed, file: '/samples/sea-compressed.jpg' },
};

const SAMPLE_RENDITIONS = [
  { kind: 'original', ...SAMPLE.original, badge: null },
  {
    kind: 'compressed',
    ...SAMPLE.compressed,
    badge: savedPercent(SAMPLE.original.bytes, SAMPLE.compressed.bytes),
  },
] as const;

const LandingPage = () => {
  const { t } = useTranslation();

  return (
    <div className={cn()}>
      <PublicHeader />
      <main>
        <section className={cn('hero')}>
          <p className={cn('eyebrow')}>{t('landing.eyebrow')}</p>
          <h1>{t('landing.title')}</h1>
          <p className={cn('lead')}>{t('landing.description')}</p>
          <div className={cn('actions')}>
            <Button to="/#compress">{t('landing.compressNow')}</Button>
            <Button to="/sign-up" variant="secondary">
              {t('landing.start')}
            </Button>
          </div>
        </section>

        <section
          id="compress"
          className={cn('compressor')}
          aria-labelledby="compressor-heading"
        >
          <h2 id="compressor-heading">{t('landing.compressorTitle')}</h2>
          <p className={cn('compressor-formats')}>{t('landing.compressorFormats')}</p>
          <CompressorWidget />
          <p className={cn('compressor-note')}>{t('landing.compressorDescription')}</p>
        </section>

        <section className={cn('comparison')} aria-labelledby="comparison-heading">
          <h2 id="comparison-heading">{t('landing.comparison.title')}</h2>
          <p className={cn('comparison-lead')}>{t('landing.comparison.lead')}</p>
          <div className={cn('comparison-grid')}>
            {SAMPLE_RENDITIONS.map((rendition) => (
              <figure key={rendition.kind} className={cn('sample')}>
                <figcaption className={cn('sample-header')}>
                  <span className={cn('sample-title')}>
                    {t(`landing.comparison.${rendition.kind}Title`)}
                  </span>
                  <span className={cn('sample-badge', { [rendition.kind]: true })}>
                    {rendition.badge === null
                      ? t('landing.comparison.unoptimized')
                      : t('landing.comparison.smaller', { percent: rendition.badge })}
                  </span>
                </figcaption>
                <img
                  className={cn('sample-image')}
                  src={rendition.preview}
                  alt={t(`landing.comparison.${rendition.kind}Alt`)}
                  loading="lazy"
                  width={SAMPLE.preview.width}
                  height={SAMPLE.preview.height}
                />
                <p className={cn('sample-meta')}>
                  <span>{formatBytes(rendition.bytes)}</span>
                  <span>
                    {SAMPLE.width}×{SAMPLE.height}
                  </span>
                  <span>{SAMPLE.format}</span>
                  <a href={rendition.file} target="_blank" rel="noreferrer">
                    {t('landing.comparison.open')}
                  </a>
                </p>
              </figure>
            ))}
          </div>
          <p className={cn('comparison-credit')}>{t('landing.comparison.credit')}</p>
        </section>

        <section className={cn('advantages')} aria-labelledby="advantages-heading">
          <h2 id="advantages-heading">{t('landing.advantagesTitle')}</h2>
          <div className={cn('advantages-grid')}>
            {ADVANTAGES.map(({ key, Icon }) => (
              <article key={key} className={cn('advantage')}>
                <SVG Svg={Icon} className={cn('advantage-icon').toString()} />
                <h3>{t(`landing.advantages.${key}.title`)}</h3>
                <p>{t(`landing.advantages.${key}.description`)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={cn('cta')}>
          <h2>{t('landing.ctaTitle')}</h2>
          <p>{t('landing.googleData')}</p>
          <Button to="/sign-up">{t('landing.start')}</Button>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
};

export { LandingPage };
