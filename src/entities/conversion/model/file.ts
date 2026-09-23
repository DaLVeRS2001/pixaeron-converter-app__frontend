import type {
  ConversionBatchQuery,
  ConversionFileStatus,
  ConversionResultKind,
} from 'shared/api';

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

const RESULT_NOTE_KEY = {
  NO_SAVINGS: 'result.noSavings',
  SANITIZED_LARGER: 'result.sanitizedLarger',
} as const satisfies Partial<Record<ConversionResultKind, string>>;

type ResultNoteKey = (typeof RESULT_NOTE_KEY)[keyof typeof RESULT_NOTE_KEY];

const resultNoteKey = (
  resultKind: ConversionResultKind | null | undefined
): ResultNoteKey | null =>
  resultKind && resultKind in RESULT_NOTE_KEY
    ? RESULT_NOTE_KEY[resultKind as keyof typeof RESULT_NOTE_KEY]
    : null;

export { FILE_STATUS_GROUP, resultNoteKey };
