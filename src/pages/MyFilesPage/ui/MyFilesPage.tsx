import { useQuery } from '@apollo/client/react';
import block from 'bem-cn';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  FILE_STATUS_GROUP,
  MyConversionBatchesDocument,
  flattenBatchFiles,
  formatBytes,
  resultNoteKey,
  savedPercent,
} from 'entities/conversion';

import { DOWNLOAD_FAILURE, saveResult } from 'features/trackConversion';

import ImageIcon from 'shared/assets/icons/image.svg';
import { Button } from 'shared/ui/Button';
import { SVG } from 'shared/ui/SVG';

import './MyFilesPage.scss';

const cn = block('my-files-page');

const BATCH_PAGE_SIZE = 10;

const DOWNLOAD_KEY = {
  RESULT_EXPIRED: 'download.RESULT_EXPIRED',
  STORAGE_UNREACHABLE: 'download.STORAGE_UNREACHABLE',
} as const;

type DownloadFailure = {
  fileId: string;
  reason: keyof typeof DOWNLOAD_KEY;
};

const MyFilesPage = () => {
  const { t, i18n } = useTranslation();
  const { t: tConversion } = useTranslation('conversion');
  const [page, setPage] = useState(0);
  const [downloadFailure, setDownloadFailure] = useState<DownloadFailure | null>(null);
  const query = useQuery(MyConversionBatchesDocument, {
    variables: { limit: BATCH_PAGE_SIZE, offset: page * BATCH_PAGE_SIZE },
    fetchPolicy: 'cache-and-network',
  });
  const result = query.data?.myConversionBatches;
  const pages = Math.max(1, Math.ceil((result?.total ?? 0) / BATCH_PAGE_SIZE));
  const currentPage = Math.min(page, pages - 1);

  const rows = flattenBatchFiles(result?.items ?? []);

  const onDownload = async (fileId: string) => {
    setDownloadFailure(null);
    try {
      const { data } = await query.refetch();
      const freshTotal = data?.myConversionBatches.total ?? 0;
      const freshPages = Math.max(1, Math.ceil(freshTotal / BATCH_PAGE_SIZE));
      if (page >= freshPages) setPage(freshPages - 1);
      const fresh = data?.myConversionBatches.items
        .flatMap((batch) => batch.files)
        .find((file) => file.id === fileId);
      if (!fresh?.downloadUrl) {
        setDownloadFailure({ fileId, reason: DOWNLOAD_FAILURE.expired });

        return;
      }

      await saveResult(
        fresh.downloadUrl,
        `pixaeron-${fileId.slice(0, 8)}`,
        fresh.outputFormat
      );
    } catch {
      setDownloadFailure({ fileId, reason: DOWNLOAD_FAILURE.unreachable });
    }
  };

  return (
    <section className={cn()}>
      <h1>{t('app.files.title')}</h1>
      <p className={cn('lead')}>{t('app.files.lead')}</p>

      {!result ? (
        <p className={cn('empty')}>{t('app.files.loading')}</p>
      ) : rows.length === 0 ? (
        <p className={cn('empty')}>{t('app.files.empty')}</p>
      ) : (
        <ul className={cn('rows')}>
          {rows.map((file) => {
            const note = resultNoteKey(file.resultKind);
            const percent =
              typeof file.inputBytes === 'number' &&
              typeof file.outputBytes === 'number'
                ? savedPercent(file.inputBytes, file.outputBytes)
                : null;

            return (
              <li key={file.id} className={cn('row')}>
                <span className={cn('thumb')} aria-hidden="true">
                  <SVG Svg={ImageIcon} className={cn('thumb-icon').toString()} />
                  {file.status === 'COMPLETED' && file.downloadUrl && (
                    <img
                      key={file.downloadUrl}
                      className={cn('thumb-image').toString()}
                      src={file.downloadUrl}
                      alt=""
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                </span>
                <span className={cn('format')}>{file.outputFormat?.toUpperCase() ?? '—'}</span>
                <span className={cn('sizes')}>
                  {typeof file.inputBytes === 'number' && formatBytes(file.inputBytes)}
                  {typeof file.outputBytes === 'number' &&
                    ` → ${formatBytes(file.outputBytes)}`}
                </span>
                {note ? (
                  <span className={cn('note')}>{tConversion(note)}</span>
                ) : (
                  percent !== null &&
                  percent > 0 && (
                    <span className={cn('saved')}>
                      {t('app.results.saved', { percent })}
                    </span>
                  )
                )}
                <span className={cn('status', { failed: file.status === 'FAILED' })}>
                  {t(`app.files.status.${FILE_STATUS_GROUP[file.status]}`)}
                </span>
                <span className={cn('until')}>
                  {file.status === 'COMPLETED'
                    ? t('app.results.until', {
                        date: new Date(String(file.expiresAt)).toLocaleString(
                          i18n.resolvedLanguage
                        ),
                      })
                    : ''}
                </span>
                {file.status === 'COMPLETED' && file.downloadUrl && (
                  <Button variant="secondary" onClick={() => onDownload(file.id)}>
                    {t('app.files.download')}
                  </Button>
                )}
                {downloadFailure?.fileId === file.id && (
                  <span className={cn('download-failure')} role="status">
                    {tConversion(DOWNLOAD_KEY[downloadFailure.reason])}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {pages > 1 && (
        <nav className={cn('pager')} aria-label={t('app.files.pagerLabel')}>
          <Button
            variant="secondary"
            disabled={currentPage === 0}
            onClick={() => setPage(currentPage - 1)}
          >
            {t('app.files.previous')}
          </Button>
          <span>{t('app.files.page', { page: currentPage + 1, pages })}</span>
          <Button
            variant="secondary"
            disabled={currentPage + 1 >= pages}
            onClick={() => setPage(currentPage + 1)}
          >
            {t('app.files.next')}
          </Button>
        </nav>
      )}
    </section>
  );
};

export { MyFilesPage };
