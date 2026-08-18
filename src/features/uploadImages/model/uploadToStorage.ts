type UploadTarget = {
  url: string;
  fields: readonly { name: string; value: string }[];
};

const UPLOAD_FAILURE = {
  rejected: 'STORAGE_REJECTED',
  unreachable: 'STORAGE_UNREACHABLE',
} as const;

type UploadFailureReason = (typeof UPLOAD_FAILURE)[keyof typeof UPLOAD_FAILURE];

class UploadFailedError extends Error {
  constructor(
    readonly reason: UploadFailureReason,
    readonly status?: number
  ) {
    super(reason);
    this.name = 'UploadFailedError';
  }
}

const buildUploadForm = (target: UploadTarget, file: File): FormData => {
  const form = new FormData();
  for (const field of target.fields) {
    form.append(field.name, field.value);
  }
  form.append('file', file);

  return form;
};

const uploadToStorage = async (
  target: UploadTarget,
  file: File,
  signal?: AbortSignal
): Promise<void> => {
  let response: Response;
  try {
    response = await fetch(target.url, {
      method: 'POST',
      body: buildUploadForm(target, file),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new UploadFailedError(UPLOAD_FAILURE.unreachable);
  }

  if (!response.ok) {
    throw new UploadFailedError(UPLOAD_FAILURE.rejected, response.status);
  }
};

export { UPLOAD_FAILURE, UploadFailedError, buildUploadForm, uploadToStorage };
export type { UploadFailureReason, UploadTarget };
