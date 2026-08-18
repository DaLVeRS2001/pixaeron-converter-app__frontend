import {
  UPLOAD_FAILURE,
  UploadFailedError,
  buildUploadForm,
  uploadToStorage,
} from './uploadToStorage';

const target = {
  url: 'https://bucket.s3.eu-central-1.amazonaws.com/',
  fields: [
    { name: 'bucket', value: 'pixaeron-conversion-production' },
    { name: 'key', value: 'inputs/batch/file' },
    { name: 'policy', value: 'base64-policy' },
  ],
};

const file = new File(['bytes'], 'photo.png', { type: 'image/png' });

describe('buildUploadForm', () => {
  it('sends every presigned field before the file, which S3 requires', () => {
    const form = buildUploadForm(target, file);
    const keys = [...form.keys()];

    expect(keys).toEqual(['bucket', 'key', 'policy', 'file']);
    expect(form.get('key')).toBe('inputs/batch/file');
  });

  it('does not rename or reorder the fields the backend signed', () => {
    const form = buildUploadForm(target, file);

    expect(form.get('policy')).toBe('base64-policy');
  });
});

describe('uploadToStorage', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('resolves on the 204 that a presigned POST returns', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 204 });

    await expect(uploadToStorage(target, file)).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(target.url, expect.objectContaining({ method: 'POST' }));
  });

  it('reports a storage rejection with its status, so an expired policy is diagnosable', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 403 });

    await expect(uploadToStorage(target, file)).rejects.toMatchObject({
      reason: UPLOAD_FAILURE.rejected,
      status: 403,
    });
  });

  it('reports an unreachable bucket separately from a rejection', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(uploadToStorage(target, file)).rejects.toBeInstanceOf(UploadFailedError);
    await expect(uploadToStorage(target, file)).rejects.toMatchObject({
      reason: UPLOAD_FAILURE.unreachable,
    });
  });

  it('lets an abort propagate untouched so a cancelled batch is not reported as a failure', async () => {
    fetchMock.mockRejectedValue(new DOMException('aborted', 'AbortError'));

    await expect(uploadToStorage(target, file)).rejects.toBeInstanceOf(DOMException);
  });
});
