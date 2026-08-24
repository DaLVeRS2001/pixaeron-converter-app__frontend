import block from 'bem-cn';
import { useCallback, useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { formatBytes, isBatchSettled, totalSavings } from 'entities/conversion';

import { ACCEPTED_MIME_TYPES } from 'features/uploadImages';

import type { ConversionMode, ConversionStrength } from 'shared/api';
import { Alert } from 'shared/ui/Alert';
import { Button } from 'shared/ui/Button';
import { Slider } from 'shared/ui/Slider';
import { Switcher } from 'shared/ui/Switcher';

import { ERROR_KEY, GENERIC_ERROR_KEY } from '../model/errorCopy';
import { useCompressorModel } from '../model/useCompressorModel';
import { ConversionRow } from './ConversionRow';

import './CompressorWidget.scss';

const cn = block('compressor-widget');

const MODES: readonly ConversionMode[] = ['LOSSLESS', 'LOSSY'];
const STRENGTHS: readonly ConversionStrength[] = ['LOW', 'MEDIUM', 'HIGH'];

const CompressorWidget = () => {
  const { t } = useTranslation('conversion');
  const inputId = useId();
  const [dragging, setDragging] = useState(false);

  const {
    entitlement,
    mode,
    setMode,
    strength,
    setStrength,
    batch,
    pollingStopped,
    startedAt,
    missingUploads,
    sourceFiles,
    downloadFailure,
    rejected,
    errorCode,
    uploading,
    submit,
    reset,
    download,
  } = useCompressorModel();
  const [now, setNow] = useState(() => Date.now());

  const files = batch?.files ?? [];
  const totals = totalSavings(files);
  const savedNothing = totals.savedBytes === 0;
  const running = batch !== null && startedAt !== null && !pollingStopped;
  const errorKey =
    errorCode && Object.hasOwn(ERROR_KEY, errorCode)
      ? ERROR_KEY[errorCode as keyof typeof ERROR_KEY]
      : GENERIC_ERROR_KEY;
  const seconds = running ? Math.max(0, Math.round((now - startedAt) / 1000)) : 0;
  const elapsed = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  useEffect(() => {
    if (!running) return;

    const timer = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (!running && !uploading) return;

    const warnBeforeLeaving = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warnBeforeLeaving);

    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [running, uploading]);

  const onFiles = useCallback(
    (list: FileList | null) => {
      if (list && list.length > 0) void submit([...list]);
    },
    [submit]
  );

  return (
    <section className={cn()}>
      <Switcher
        label={t('mode.label')}
        options={MODES.map((value) => ({ value, label: t(`mode.${value}.name`) }))}
        value={mode}
        onChange={setMode}
        hint={t(`mode.${mode}.hint`)}
        disabled={uploading}
      />

      {mode === 'LOSSY' && (
        <Slider
          label={t('strength.label')}
          stops={STRENGTHS.map((value) => ({
            value,
            label: t(`strength.${value}.name`),
          }))}
          value={strength}
          onChange={setStrength}
          hint={t(`strength.${strength}.hint`)}
          disabled={uploading}
        />
      )}

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
            id={inputId}
            className={cn('input')}
            type="file"
            multiple
            accept={ACCEPTED_MIME_TYPES.join(',')}
            disabled={uploading || !entitlement}
            onChange={(event) => {
              onFiles(event.target.files);
              event.target.value = '';
            }}
          />
          <span className={cn('picker-label')}>{t('dropzone.action')}</span>
        </label>

        <p className={cn('busy')} role="status">
          {uploading && t('announce.busy')}
          {!uploading && batch && isBatchSettled(batch.status) && t('announce.finished')}
        </p>

        {entitlement && (
          <p className={cn('limits')}>
            {t('dropzone.limits', {
              files: entitlement.maxBatchFiles,
              size: formatBytes(entitlement.maxFileBytes),
            })}
            {entitlement.remainingToday !== null && (
              <span className={cn('remaining')}>
                {t('dropzone.remaining', { count: entitlement.remainingToday })}
              </span>
            )}
          </p>
        )}
      </div>

      {rejected.length > 0 && (
        <Alert variant="warning" title={t('rejected.title')}>
          <ul className={cn('rejected')}>
            {rejected.map((entry) => (
              <li key={`${entry.file.name}-${entry.reason}`}>
                {t(`rejected.${entry.reason}`, {
                  name: entry.file.name,
                  size: formatBytes(entitlement?.maxFileBytes ?? 0),
                  files: entitlement?.maxBatchFiles,
                })}
              </li>
            ))}
          </ul>
        </Alert>
      )}

      {errorCode && <Alert variant="error">{t(errorKey)}</Alert>}

      {missingUploads > 0 && (
        <Alert variant="warning">
          {t('notice.missingUploads', { count: missingUploads })}
        </Alert>
      )}

      {files.length > 0 && (
        <div className={cn('queue')}>
          <header className={cn('queue-header')}>
            <h3>{t('queue.title')}</h3>
            <span>
              {t('queue.count', { count: files.length })}
              {running && ` · ${t('queue.elapsed', { time: elapsed })}`}
            </span>
          </header>

          <ul className={cn('rows')}>
            {files.map((file) => (
              <ConversionRow
                key={file.id}
                file={file}
                name={sourceFiles.get(file.id)?.name ?? file.id}
                sourceFile={sourceFiles.get(file.id) ?? null}
                failedDownload={
                  downloadFailure?.fileId === file.id ? downloadFailure.reason : null
                }
                onDownload={download}
              />
            ))}
          </ul>

          {batch && isBatchSettled(batch.status) && totals.files > 0 && (
            <footer className={cn('totals', { none: savedNothing })}>
              <p className={cn('totals-title')}>
                {savedNothing ? t('totals.none') : t('totals.title')}
              </p>
              {!savedNothing && (
                <>
                  <p className={cn('totals-value')}>{formatBytes(totals.savedBytes)}</p>
                  <p className={cn('totals-average')}>
                    {t('totals.average', { percent: totals.savedPercent })}
                  </p>
                </>
              )}
              <p className={cn('totals-compare')}>
                {t('totals.before', { value: formatBytes(totals.inputBytes) })}
                {' · '}
                {t('totals.after', { value: formatBytes(totals.outputBytes) })}
              </p>
            </footer>
          )}

          <p className={cn('notice')}>
            {entitlement?.planCode === 'ANONYMOUS' ? t('notice.leaving') : t('notice.stored')}
          </p>
        </div>
      )}

      {(files.length > 0 || rejected.length > 0 || errorCode) && (
        <Button variant="secondary" onClick={reset}>
          {t('queue.clear')}
        </Button>
      )}
    </section>
  );
};

export { CompressorWidget };
