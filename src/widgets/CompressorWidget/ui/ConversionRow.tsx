import block from 'bem-cn';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { formatBytes, isFileMoving, resultNoteKey, savedPercent } from 'entities/conversion';
import type { ConversionFileStatus, ConversionFileView } from 'entities/conversion';

import ImageIcon from 'shared/assets/icons/image.svg';
import { SVG } from 'shared/ui/SVG';

import './ConversionRow.scss';

type ConversionRowProps = {
  file: ConversionFileView;
  name: string;
  sourceFile: File | null;
  failedDownload: string | null;
  onDownload: (fileId: string, name: string) => void;
};

const cn = block('conversion-row');

const STATUS_KEY = {
  UPLOADING: 'status.uploading',
  READY: 'status.ready',
  QUEUED: 'status.queued',
  PROCESSING: 'status.processing',
  COMPLETED: 'status.completed',
  FAILED: 'status.failed',
  CANCELLED: 'status.cancelled',
  EXPIRED: 'status.expired',
} as const satisfies Record<ConversionFileStatus, string>;

const FAILURE_KEY = {
  ANIMATED_UNSUPPORTED: 'failure.ANIMATED_UNSUPPORTED',
  DECODE_FAILED: 'failure.DECODE_FAILED',
  INPUT_CHANGED: 'failure.INPUT_CHANGED',
  INPUT_MISSING: 'failure.INPUT_MISSING',
  INPUT_TOO_LARGE: 'failure.INPUT_TOO_LARGE',
  PIXELS_EXCEEDED: 'failure.PIXELS_EXCEEDED',
  UNSUPPORTED_FORMAT: 'failure.UNSUPPORTED_FORMAT',
} as const;

const DOWNLOAD_KEY = {
  RESULT_EXPIRED: 'download.RESULT_EXPIRED',
  STORAGE_UNREACHABLE: 'download.STORAGE_UNREACHABLE',
} as const;

const SourceThumb = ({ sourceFile }: { sourceFile: File }) => {
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(sourceFile);
    if (imageRef.current) imageRef.current.src = url;

    return () => URL.revokeObjectURL(url);
  }, [sourceFile]);

  return <img ref={imageRef} className={cn('thumb').toString()} alt="" />;
};

const ConversionRow = ({
  file,
  name,
  sourceFile,
  failedDownload,
  onDownload,
}: ConversionRowProps) => {
  const { t } = useTranslation('conversion');

  const percent =
    typeof file.inputBytes === 'number' && typeof file.outputBytes === 'number'
      ? savedPercent(file.inputBytes, file.outputBytes)
      : null;

  const noteKey = resultNoteKey(file.resultKind);

  const failureCode = file.failureCode ?? '';
  const failureKey = Object.hasOwn(FAILURE_KEY, failureCode)
    ? FAILURE_KEY[failureCode as keyof typeof FAILURE_KEY]
    : 'failure.generic';

  return (
    <li className={cn({ status: file.status.toLowerCase() })}>
      <span className={cn('name')} title={name}>
        {sourceFile ? (
          <SourceThumb sourceFile={sourceFile} />
        ) : (
          <span className={cn('thumb', { placeholder: true })} aria-hidden="true">
            <SVG Svg={ImageIcon} className={cn('thumb-icon').toString()} />
          </span>
        )}
        <span className={cn('name-text')}>{name}</span>
      </span>

      <span className={cn('sizes')}>
        {typeof file.inputBytes === 'number' && (
          <span className={cn('size')}>{formatBytes(file.inputBytes)}</span>
        )}
        {typeof file.outputBytes === 'number' && (
          <>
            <span className={cn('arrow')} aria-hidden="true">
              →
            </span>
            <span className={cn('size', { output: true })}>
              {formatBytes(file.outputBytes)}
            </span>
          </>
        )}
      </span>

      {noteKey ? (
        <span className={cn('note')}>{t(noteKey)}</span>
      ) : file.status === 'FAILED' ? (
        <span className={cn('note', { failed: true })}>{t(failureKey)}</span>
      ) : (
        percent !== null &&
        percent > 0 && <span className={cn('saved')}>{t('queue.saved', { percent })}</span>
      )}

      <span className={cn('status')}>{t(STATUS_KEY[file.status])}</span>

      {isFileMoving(file.status) && <span className={cn('progress')} aria-hidden="true" />}

      {file.status === 'COMPLETED' && file.downloadUrl && (
        <button
          type="button"
          className={cn('download')}
          onClick={() => onDownload(file.id, name)}
        >
          {t('queue.download')}
        </button>
      )}

      {failedDownload && Object.hasOwn(DOWNLOAD_KEY, failedDownload) && (
        <span className={cn('download-failure')} role="status">
          {t(DOWNLOAD_KEY[failedDownload as keyof typeof DOWNLOAD_KEY])}
        </span>
      )}
    </li>
  );
};

export { ConversionRow };
