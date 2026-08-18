import type { ConversionBatchStatus, ConversionFileStatus } from 'shared/api';

const SETTLED_FILE_STATUSES = new Set<ConversionFileStatus>([
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'EXPIRED',
]);

const SETTLED_BATCH_STATUSES = new Set<ConversionBatchStatus>([
  'COMPLETED',
  'PARTIAL',
  'FAILED',
  'CANCELLED',
  'EXPIRED',
]);

const isFileSettled = (status: ConversionFileStatus): boolean =>
  SETTLED_FILE_STATUSES.has(status);

const isBatchSettled = (status: ConversionBatchStatus): boolean =>
  SETTLED_BATCH_STATUSES.has(status);

const isFileWorking = (status: ConversionFileStatus): boolean =>
  status === 'QUEUED' || status === 'PROCESSING';

const hasDownload = (file: {
  status: ConversionFileStatus;
  downloadUrl?: string | null;
}): boolean => file.status === 'COMPLETED' && Boolean(file.downloadUrl);

export { hasDownload, isBatchSettled, isFileSettled, isFileWorking };
