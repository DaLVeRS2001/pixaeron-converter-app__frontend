import type { ConversionBatchQuery, ConversionFileStatus } from 'shared/api';

type ConversionFileView = NonNullable<
  ConversionBatchQuery['conversionBatch']
>['files'][number];

export type { ConversionFileView };

const FILE_STATUS_GROUP = {
  UPLOADING: 'waiting',
  READY: 'working',
  QUEUED: 'working',
  PROCESSING: 'working',
  COMPLETED: 'done',
  FAILED: 'failed',
  CANCELLED: 'failed',
  EXPIRED: 'expired',
} as const satisfies Record<ConversionFileStatus, string>;

type StoredFile = ConversionFileView & { expiresAt: string };

const flattenBatchFiles = <TFile>(
  batches: ReadonlyArray<{ expiresAt: unknown; files: ReadonlyArray<TFile> }>
): Array<TFile & { expiresAt: string }> =>
  batches.flatMap((batch) =>
    batch.files.map((file) => ({ ...file, expiresAt: String(batch.expiresAt) }))
  );

export { FILE_STATUS_GROUP, flattenBatchFiles };
export type { StoredFile };
