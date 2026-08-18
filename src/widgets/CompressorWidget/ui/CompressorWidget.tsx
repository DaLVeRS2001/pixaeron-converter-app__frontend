import block from 'bem-cn';
import { useCallback, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { formatBytes, totalSavings } from 'entities/conversion';

import { compressedName, saveResult } from 'features/trackConversion';
import { ACCEPTED_MIME_TYPES } from 'features/uploadImages';

import { Button } from 'shared/ui/Button';

import { useCompressorModel } from '../model/useCompressorModel';
import { ConversionRow } from './ConversionRow';

import './CompressorWidget.scss';

const cn = block('compressor-widget');

const CompressorWidget = () => {
  const { t } = useTranslation('conversion');
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [downloadFailed, setDownloadFailed] = useState(false);

  const model = useCompressorModel();
  const { entitlement, batch, names, rejected, errorCode, uploading, submit, reset } = model;

  const accept = ACCEPTED_MIME_TYPES.join(',');
  const files = batch?.files ?? [];
  const totals = totalSavings(files);

  const onFiles = useCallback(
    (list: FileList | null) => {
      if (list && list.length > 0) void submit([...list]);
    },
    [submit]
  );

  const onDownload = useCallback(
    async (fileId: string, name: string) => {
      setDownloadFailed(false);
      const { data } = await model.refetchBatch();
      const fresh = data?.conversionBatch.files.find((file) => file.id === fileId);
      if (!fresh?.downloadUrl) {
        setDownloadFailed(true);
        return;
      }

      try {
        await saveResult(fresh.downloadUrl, compressedName(name, fresh.outputFormat));
      } catch {
        setDownloadFailed(true);
      }
    },
    [model]
  );

  const limitsHint = entitlement
    ? t('dropzone.limits', {
        files: entitlement.maxBatchFiles,
        size: formatBytes(entitlement.maxFileBytes),
      })
    : '';

  return (
    <section className={cn()}>
      <div
        className={cn('dropzone', { dragging })}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          onFiles(event.dataTransfer.files);
        }}
      >
        <p className={cn('title')}>{t('dropzone.title')}</p>
        <p className={cn('hint')}>{t('dropzone.hint')}</p>

        <label className={cn('picker')} htmlFor={inputId}>
          <input
            ref={inputRef}
            id={inputId}
            className={cn('input')}
            type="file"
            multiple
            accept={accept}
            disabled={uploading || !entitlement}
            onChange={(event) => {
              onFiles(event.target.files);
              event.target.value = '';
            }}
          />
          <span className={cn('picker-label')}>{t('dropzone.action')}</span>
        </label>

        {entitlement && (
          <p className={cn('limits')}>
            {limitsHint}
            {entitlement.remainingToday !== null && (
              <span className={cn('remaining')}>
                {t('dropzone.remaining', { count: entitlement.remainingToday })}
              </span>
            )}
          </p>
        )}
      </div>

      {rejected.length > 0 && (
        <div className={cn('rejected')}>
          <p className={cn('rejected-title')}>{t('rejected.title')}</p>
          <ul>
            {rejected.map((entry) => (
              <li key={`${entry.file.name}-${entry.reason}`}>
                {t(`rejected.${entry.reason}`, {
                  name: entry.file.name,
                  limit:
                    entry.reason === 'TOO_LARGE' && entitlement
                      ? formatBytes(entitlement.maxFileBytes)
                      : entitlement?.maxBatchFiles,
                })}
              </li>
            ))}
          </ul>
        </div>
      )}

      {errorCode && (
        <p className={cn('error')}>{t(`errors.${errorCode}`, t('errors.generic'))}</p>
      )}

      {downloadFailed && <p className={cn('error')}>{t('errors.NOT_FOUND')}</p>}

      {files.length > 0 && (
        <div className={cn('queue')}>
          <header className={cn('queue-header')}>
            <h3>{t('queue.title')}</h3>
            <span>{t('queue.count', { count: files.length })}</span>
          </header>

          <ul className={cn('rows')}>
            {files.map((file) => (
              <ConversionRow
                key={file.id}
                file={file}
                name={names.get(file.id) ?? file.id}
                onDownload={onDownload}
              />
            ))}
          </ul>

          {totals.files > 0 && (
            <footer className={cn('totals')}>
              <p className={cn('totals-title')}>{t('totals.title')}</p>
              <p className={cn('totals-value')}>{formatBytes(totals.savedBytes)}</p>
              <p className={cn('totals-average')}>
                {t('totals.average', { percent: totals.savedPercent })}
              </p>
              <p className={cn('totals-compare')}>
                {t('totals.before', { value: formatBytes(totals.inputBytes) })}
                {' · '}
                {t('totals.after', { value: formatBytes(totals.outputBytes) })}
              </p>
            </footer>
          )}

          <p className={cn('notice')}>{t('notice.leaving')}</p>

          <Button variant="secondary" onClick={reset}>
            {t('queue.clear')}
          </Button>
        </div>
      )}
    </section>
  );
};

export { CompressorWidget };
