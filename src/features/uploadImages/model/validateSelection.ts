const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const;

const SELECTION_REJECTION = {
  unsupportedType: 'UNSUPPORTED_TYPE',
  tooLarge: 'TOO_LARGE',
  overBatchLimit: 'OVER_BATCH_LIMIT',
  overDailyLimit: 'OVER_DAILY_LIMIT',
  emptyFile: 'EMPTY_FILE',
} as const;

type SelectionRejectionReason = (typeof SELECTION_REJECTION)[keyof typeof SELECTION_REJECTION];

type SelectionLimits = {
  maxBatchFiles: number;
  maxFileBytes: number;
  remainingToday: number | null;
};

type RejectedSelection = {
  file: File;
  reason: SelectionRejectionReason;
};

type SelectionResult = {
  accepted: File[];
  rejected: RejectedSelection[];
};

const validateSelection = (
  files: readonly File[],
  limits: SelectionLimits
): SelectionResult => {
  const accepted: File[] = [];
  const rejected: RejectedSelection[] = [];

  const batchCapacity = Math.max(0, limits.maxBatchFiles);
  const dailyCapacity =
    limits.remainingToday === null ? Infinity : Math.max(0, limits.remainingToday);

  for (const file of files) {
    if (!(ACCEPTED_MIME_TYPES as readonly string[]).includes(file.type)) {
      rejected.push({ file, reason: SELECTION_REJECTION.unsupportedType });
      continue;
    }

    if (file.size < 1) {
      rejected.push({ file, reason: SELECTION_REJECTION.emptyFile });
      continue;
    }

    if (file.size > limits.maxFileBytes) {
      rejected.push({ file, reason: SELECTION_REJECTION.tooLarge });
      continue;
    }

    if (accepted.length >= batchCapacity) {
      rejected.push({ file, reason: SELECTION_REJECTION.overBatchLimit });
      continue;
    }

    if (accepted.length >= dailyCapacity) {
      rejected.push({ file, reason: SELECTION_REJECTION.overDailyLimit });
      continue;
    }

    accepted.push(file);
  }

  return { accepted, rejected };
};

export { ACCEPTED_MIME_TYPES, SELECTION_REJECTION, validateSelection };
export type { RejectedSelection };
