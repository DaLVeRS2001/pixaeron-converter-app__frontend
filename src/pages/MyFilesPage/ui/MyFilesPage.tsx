import { useQuery } from '@apollo/client/react';
import block from 'bem-cn';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  FILE_STATUS_GROUP,
  MyConversionFilesDocument,
  formatBytes,
  resultNoteKey,
  savedPercent,
} from 'entities/conversion';

import { DOWNLOAD_FAILURE, saveResult } from 'features/trackConversion';

import ImageIcon from 'shared/assets/icons/image.svg';
import { Button } from 'shared/ui/Button';
import { Pagination } from 'shared/ui/Pagination';
import { SVG } from 'shared/ui/SVG';

import './MyFilesPage.scss';

const cn = block('my-files-page');

const FILE_PAGE_SIZE = 20;

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
  const query = useQuery(MyConversionFilesDocument, {
    variables: { limit: FILE_PAGE_SIZE, offset: page * FILE_PAGE_SIZE },
    fetchPolicy: 'cache-and-network',
  });
  const result = query.data?.myConversionFiles;
  const pages = Math.max(1, Math.ceil((result?.total ?? 0) / FILE_PAGE_SIZE));
  const currentPage = Math.min(page, pages - 1);
  const rows = result?.items ?? [];

  const onDownload = async (fileId: string) => {
    setDownloadFailure(null);
    try {
      const { data } = await query.refetch();
      const freshTotal = data?.myConversionFiles.total ?? 0;
      const freshPages = Math.max(1, Math.ceil(freshTotal / FILE_PAGE_SIZE));
      if (page >= freshPages) setPage(freshPages - 1);
      const fresh = data?.myConversionFiles.items.find((file) => file.id === fileId);
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
              typeof file.inputBytes === 'number' && typeof file.outputBytes === 'number'
                ? savedPercent(file.inputBytes, file.outputBytes)
                : null;

            return (
              <li key={file.id} className={cn('row')}>
                <span className={cn('thumb')} aria-hidden="true">
                  <SVG Svg={ImageIcon} className={cn('thumb-icon').toString()} />
                  {file.status === 'COMPLETED' && file.previewUrl && (
                    <img
                      className={cn('thumb-image').toString()}
                      src={file.previewUrl}
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
                    <span className={cn('saved')}>{t('app.results.saved', { percent })}</span>
                  )
                )}
                <span className={cn('status', { failed: file.status === 'FAILED' })}>
                  {t(`app.files.status.${FILE_STATUS_GROUP[file.status]}`)}
                </span>
                <span className={cn('until')}>
                  {file.status === 'COMPLETED'
                    ? t('app.results.until', {
                        date: new Date(file.expiresAt).toLocaleString(i18n.resolvedLanguage),
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

      {result && result.total > 0 && (
        <Pagination
          className={cn('pager').toString()}
          page={currentPage}
          pages={pages}
          onChange={setPage}
          label={t('app.files.pagerLabel')}
          previousLabel={t('app.files.previous')}
          nextLabel={t('app.files.next')}
          summary={t('app.files.showing', { shown: rows.length, total: result.total })}
        />
      )}
    </section>
  );
};

export { MyFilesPage };
