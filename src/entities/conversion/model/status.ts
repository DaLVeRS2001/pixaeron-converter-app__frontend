import type { ConversionBatchStatus, ConversionFileStatus } from 'shared/api';

const SETTLED_BATCH_STATUSES = new Set<ConversionBatchStatus>([
  'COMPLETED',
  'PARTIAL',
  'FAILED',
  'CANCELLED',
  'EXPIRED',
]);

const isBatchSettled = (status: ConversionBatchStatus): boolean =>
  SETTLED_BATCH_STATUSES.has(status);

const isFileWorking = (status: ConversionFileStatus): boolean =>
  status === 'QUEUED' || status === 'PROCESSING';

export { isBatchSettled, isFileWorking };
