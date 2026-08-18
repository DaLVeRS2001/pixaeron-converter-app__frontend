import block from 'bem-cn';
import { useTranslation } from 'react-i18next';

import { formatBytes, isFileMoving, savedPercent } from 'entities/conversion';
import type { ConversionFileStatus, ConversionFileView } from 'entities/conversion';

import './ConversionRow.scss';

type ConversionRowProps = {
  file: ConversionFileView;
  name: string;
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

const ConversionRow = ({ file, name, failedDownload, onDownload }: ConversionRowProps) => {
  const { t } = useTranslation('conversion');

  const percent =
    typeof file.inputBytes === 'number' && typeof file.outputBytes === 'number'
      ? savedPercent(file.inputBytes, file.outputBytes)
      : null;

  const noteKey =
    file.resultKind === 'NO_SAVINGS'
      ? 'result.noSavings'
      : file.resultKind === 'SANITIZED_LARGER'
        ? 'result.sanitizedLarger'
        : null;

  const failureCode = file.failureCode ?? '';
  const failureKey = Object.hasOwn(FAILURE_KEY, failureCode)
    ? FAILURE_KEY[failureCode as keyof typeof FAILURE_KEY]
    : 'failure.generic';

  return (
    <li className={cn({ status: file.status.toLowerCase() })}>
      <span className={cn('name')} title={name}>
        {name}
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
