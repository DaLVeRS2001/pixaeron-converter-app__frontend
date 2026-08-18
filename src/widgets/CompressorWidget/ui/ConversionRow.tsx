import block from 'bem-cn';
import { useTranslation } from 'react-i18next';

import { formatBytes, isFileWorking, savedPercent } from 'entities/conversion';

import type { ConversionFileStatus, ConversionResultKind } from 'shared/api';

import './ConversionRow.scss';

type ConversionRowFile = {
  id: string;
  status: ConversionFileStatus;
  inputBytes?: number | null;
  outputBytes?: number | null;
  resultKind?: ConversionResultKind | null;
  failureCode?: string | null;
  downloadUrl?: string | null;
};

type ConversionRowProps = {
  file: ConversionRowFile;
  name: string;
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

const ConversionRow = ({ file, name, onDownload }: ConversionRowProps) => {
  const { t } = useTranslation('conversion');

  const percent =
    typeof file.inputBytes === 'number' && typeof file.outputBytes === 'number'
      ? savedPercent(file.inputBytes, file.outputBytes)
      : null;

  const keptOriginal =
    file.resultKind === 'NO_SAVINGS' || file.resultKind === 'SANITIZED_LARGER';

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

      {keptOriginal ? (
        <span className={cn('note')}>
          {file.resultKind === 'NO_SAVINGS'
            ? t('result.noSavings')
            : t('result.sanitizedLarger')}
        </span>
      ) : (
        percent !== null &&
        percent > 0 && <span className={cn('saved')}>{t('queue.saved', { percent })}</span>
      )}

      <span className={cn('status')}>
        {isFileWorking(file.status) && <span className={cn('spinner')} aria-hidden="true" />}
        {t(STATUS_KEY[file.status])}
      </span>

      {file.status === 'COMPLETED' && file.downloadUrl && (
        <button
          type="button"
          className={cn('download')}
          onClick={() => onDownload(file.id, name)}
        >
          {t('queue.download')}
        </button>
      )}
    </li>
  );
};

export { ConversionRow };
export type { ConversionRowFile };
