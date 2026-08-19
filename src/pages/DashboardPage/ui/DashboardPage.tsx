import { useQuery } from '@apollo/client/react';
import block from 'bem-cn';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import {
  ConversionEntitlementDocument,
  MyConversionBatchesDocument,
  flattenBatchFiles,
  formatBytes,
  savedPercent,
} from 'entities/conversion';
import { useCurrentUser } from 'entities/user';

import CompressIcon from 'shared/assets/icons/compress.svg';
import SwapIcon from 'shared/assets/icons/swap.svg';
import { Button } from 'shared/ui/Button';
import { SVG } from 'shared/ui/SVG';

import './DashboardPage.scss';

const cn = block('dashboard-page');

const RECENT_BATCHES = 5;

const RECENT_FILES = 5;

const DashboardPage = () => {
  const { t, i18n } = useTranslation();
  const session = useCurrentUser();
  const entitlement = useQuery(ConversionEntitlementDocument).data?.conversionEntitlement;
  const recents = useQuery(MyConversionBatchesDocument, {
    variables: { limit: RECENT_BATCHES, offset: 0 },
    fetchPolicy: 'cache-and-network',
  }).data?.myConversionBatches;

  if (session.status !== 'authenticated') return null;

  const recentFiles = flattenBatchFiles(recents?.items ?? []);

  return (
    <section className={cn()}>
      <h1>{t('app.dashboard.welcome', { username: session.user.username })}</h1>
      <p className={cn('lead')}>{t('app.dashboard.lead')}</p>

      <div className={cn('tiles')}>
        {entitlement?.storageBytes != null && entitlement.storageBytesUsed != null && (
          <article className={cn('tile')}>
            <h2>{t('app.dashboard.storageTile')}</h2>
            <p className={cn('tile-value')}>{formatBytes(entitlement.storageBytesUsed)}</p>
            <p className={cn('tile-note')}>
              {t('app.dashboard.storageOf', {
                limit: formatBytes(entitlement.storageBytes),
              })}
            </p>
          </article>
        )}
        {entitlement?.remainingToday != null && (
          <article className={cn('tile')}>
            <h2>{t('app.dashboard.remainingTile')}</h2>
            <p className={cn('tile-value')}>{entitlement.remainingToday}</p>
            <p className={cn('tile-note')}>{t('app.dashboard.remainingNote')}</p>
          </article>
        )}
        {entitlement && (
          <article className={cn('tile')}>
            <h2>{t('app.dashboard.planTile')}</h2>
            <p className={cn('tile-value')}>{entitlement.planCode}</p>
            <p className={cn('tile-note')}>
              <Link to="/pricing">{t('app.dashboard.planNote')}</Link>
            </p>
          </article>
        )}
      </div>

      <div className={cn('actions')}>
        <article className={cn('action')}>
          <SVG Svg={CompressIcon} className={cn('action-icon').toString()} />
          <h2>{t('app.dashboard.compressTitle')}</h2>
          <p>{t('app.dashboard.compressDescription')}</p>
          <Button to="/app/compress">{t('app.dashboard.compressAction')}</Button>
        </article>
        <article className={cn('action', { disabled: true })}>
          <SVG Svg={SwapIcon} className={cn('action-icon').toString()} />
          <h2>{t('app.dashboard.convertTitle')}</h2>
          <p>{t('app.dashboard.convertDescription')}</p>
          <Button variant="secondary" disabled>
            {t('app.sidebar.soon')}
          </Button>
        </article>
      </div>

      <section className={cn('recents')} aria-labelledby="recents-heading">
        <header>
          <h2 id="recents-heading">{t('app.dashboard.recentsTitle')}</h2>
          {(recents?.total ?? 0) > 0 && (
            <Link to="/app/files">{t('app.dashboard.viewAll')}</Link>
          )}
        </header>

        {recentFiles.length === 0 ? (
          <p className={cn('empty')}>{t('app.dashboard.empty')}</p>
        ) : (
          <ul>
            {recentFiles.slice(0, RECENT_FILES).map((file) => (
              <li key={file.id}>
                <span className={cn('recent-format')}>
                  {file.outputFormat?.toUpperCase() ?? '—'}
                </span>
                <span className={cn('recent-sizes')}>
                  {typeof file.inputBytes === 'number' && formatBytes(file.inputBytes)}
                  {typeof file.outputBytes === 'number' &&
                    ` → ${formatBytes(file.outputBytes)}`}
                </span>
                {typeof file.inputBytes === 'number' &&
                  typeof file.outputBytes === 'number' && (
                    <span className={cn('recent-saved')}>
                      {t('app.results.saved', {
                        percent: savedPercent(file.inputBytes, file.outputBytes),
                      })}
                    </span>
                  )}
                <span className={cn('recent-until')}>
                  {file.status === 'COMPLETED'
                    ? t('app.results.until', {
                        date: new Date(file.expiresAt).toLocaleString(i18n.resolvedLanguage),
                      })
                    : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
};

export { DashboardPage };
