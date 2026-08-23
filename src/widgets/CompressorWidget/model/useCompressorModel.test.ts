import { act, renderHook } from '@testing-library/react';

import { useCompressorModel } from './useCompressorModel';

const mockEntitlement = {
  maxBatchFiles: 5,
  maxFileBytes: 15 * 1024 * 1024,
  remainingToday: 17,
};

const mockStart = jest.fn();
const mockCancel = jest.fn();
const mockRefetchEntitlement = jest.fn();
const mockRefetchBatch = jest.fn();

jest.mock('@apollo/client/react', () => ({
  useQuery: () => ({
    data: { conversionEntitlement: mockEntitlement },
    error: undefined,
    refetch: mockRefetchEntitlement,
  }),
}));

jest.mock('features/trackConversion', () => ({
  DOWNLOAD_FAILURE: { expired: 'RESULT_EXPIRED', unreachable: 'STORAGE_UNREACHABLE' },
  saveResult: jest.fn(),
  useConversionProgress: () => ({
    batch: null,
    pollingStopped: false,
    refetch: mockRefetchBatch,
    error: undefined,
  }),
}));

jest.mock('features/uploadImages', () => ({
  ...jest.requireActual('features/uploadImages'),
  useImageUpload: () => ({ start: mockStart, cancel: mockCancel, uploading: false }),
}));

const image = (name: string, size = 1000, type = 'image/png') =>
  Object.defineProperty(new File([], name, { type }), 'size', { value: size }) as File;

describe('useCompressorModel', () => {
  const startedBatch = {
    batchId: 'batch-1',
    batchToken: 'token',
    fileNames: new Map([['file-0', 'a.png']]),
    missingFiles: 0,
  };

  beforeEach(() => {
    mockStart.mockReset();
    mockCancel.mockReset();
    mockRefetchEntitlement.mockReset().mockResolvedValue({});
    mockRefetchBatch.mockReset();
    mockRefetchBatch.mockResolvedValue({ data: { conversionBatch: { files: [] } } });
  });

  it('names every rejected file and uploads nothing when none survive validation', async () => {
    const { result } = renderHook(() => useCompressorModel());

    await act(async () =>
      result.current.submit([image('notes.pdf', 2048, 'application/pdf')])
    );

    expect(result.current.rejected).toHaveLength(1);
    expect(result.current.startedAt).toBeNull();
    expect(mockStart).not.toHaveBeenCalled();
  });

  it('starts the clock and reports uploads that never arrived', async () => {
    mockStart.mockResolvedValue({
      batchId: 'batch-1',
      batchToken: 'token',
      fileNames: new Map([['file-0', 'a.png']]),
      missingFiles: 1,
    });
    const { result } = renderHook(() => useCompressorModel());

    await act(async () => result.current.submit([image('a.png'), image('b.png')]));

    expect(typeof result.current.startedAt).toBe('number');
    expect(result.current.missingUploads).toBe(1);
    expect(result.current.errorCode).toBeNull();
  });

  it('hands the chosen mode to the upload', async () => {
    mockStart.mockResolvedValue({
      batchId: 'batch-1',
      batchToken: 'token',
      fileNames: new Map(),
      missingFiles: 0,
    });
    const { result } = renderHook(() => useCompressorModel());

    act(() => result.current.setMode('LOSSLESS'));
    await act(async () => result.current.submit([image('a.png')]));

    expect(mockStart).toHaveBeenCalledWith(expect.any(Array), 'LOSSLESS');
  });

  it('clears the batch and cancels the transfer when the visitor starts over', async () => {
    mockStart.mockResolvedValue({
      batchId: 'batch-1',
      batchToken: 'token',
      fileNames: new Map(),
      missingFiles: 1,
    });
    const { result } = renderHook(() => useCompressorModel());

    await act(async () => result.current.submit([image('a.png')]));
    act(() => result.current.reset());

    expect(result.current.startedAt).toBeNull();
    expect(result.current.missingUploads).toBe(0);
    expect(result.current.rejected).toHaveLength(0);
    expect(mockCancel).toHaveBeenCalled();
  });

  it('says nothing about the network when the visitor cancelled the transfer', async () => {
    mockStart.mockRejectedValue(new DOMException('aborted', 'AbortError'));
    const { result } = renderHook(() => useCompressorModel());

    await act(async () => result.current.submit([image('a.png')]));

    expect(result.current.errorCode).toBeNull();
    expect(result.current.startedAt).toBeNull();
  });

  it('does not resurrect a batch the visitor cleared while it was still uploading', async () => {
    let release: (value: typeof startedBatch) => void = () => undefined;
    mockStart.mockReturnValue(
      new Promise<typeof startedBatch>((resolve) => {
        release = resolve;
      })
    );
    const { result } = renderHook(() => useCompressorModel());

    let submitted: Promise<void> = Promise.resolve();
    act(() => {
      submitted = result.current.submit([image('a.png')]);
    });
    act(() => result.current.reset());
    await act(async () => {
      release(startedBatch);
      await submitted;
    });

    expect(result.current.startedAt).toBeNull();
    expect(result.current.sourceFiles.size).toBe(0);
  });

  it('keeps a healthy batch when only the quota counter failed to refresh', async () => {
    mockStart.mockResolvedValue(startedBatch);
    mockRefetchEntitlement.mockRejectedValue(new Error('offline'));
    const { result } = renderHook(() => useCompressorModel());

    await act(async () => result.current.submit([image('a.png')]));

    expect(typeof result.current.startedAt).toBe('number');
    expect(result.current.errorCode).toBeNull();
  });

  it('reports an expired result on its own row, leaving the page banner alone', async () => {
    mockStart.mockResolvedValue(startedBatch);
    mockRefetchBatch.mockResolvedValue({
      data: { conversionBatch: { files: [{ id: 'file-0', downloadUrl: null }] } },
    });
    const { result } = renderHook(() => useCompressorModel());

    await act(async () => result.current.submit([image('a.png')]));
    await act(async () => result.current.download('file-0', 'a.png'));

    expect(result.current.downloadFailure).toEqual({
      fileId: 'file-0',
      reason: 'RESULT_EXPIRED',
    });
    expect(result.current.errorCode).toBeNull();
  });

  it('surfaces the reason an upload failed', async () => {
    const { UploadFailedError } = jest.requireActual('features/uploadImages');
    mockStart.mockRejectedValue(new UploadFailedError('NO_FILES_ADMITTED'));
    const { result } = renderHook(() => useCompressorModel());

    await act(async () => result.current.submit([image('a.png')]));

    expect(result.current.errorCode).toBe('NO_FILES_ADMITTED');
  });
});
