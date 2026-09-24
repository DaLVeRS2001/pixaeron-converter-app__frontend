import { act, renderHook } from '@testing-library/react';

import { useCompressorModel } from './useCompressorModel';

const mockEntitlement = {
  maxBatchFiles: 5,
  maxFileBytes: 15 * 1024 * 1024,
  remainingToday: 17,
};

const mockSubmit = jest.fn();
const mockReset = jest.fn();
const mockRefetchEntitlement = jest.fn();
const mockRefetchBatch = jest.fn();
let mockPollingStopped = false;
let mockActive: { batchId: string; batchToken: string; startedAt: number } | null = null;
let mockFailure: string | null = null;

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
    pollingStopped: mockPollingStopped,
    refetch: mockRefetchBatch,
    error: undefined,
  }),
}));

jest.mock('features/uploadImages', () => ({
  ...jest.requireActual('features/uploadImages'),
  useCurrentUpload: () => ({
    active: mockActive,
    failure: mockFailure,
    uploading: false,
    submit: mockSubmit,
    reset: mockReset,
  }),
}));

const image = (name: string, size = 1000, type = 'image/png') =>
  Object.defineProperty(new File([], name, { type }), 'size', { value: size }) as File;

describe('useCompressorModel', () => {
  beforeEach(() => {
    mockSubmit.mockReset().mockResolvedValue(undefined);
    mockReset.mockReset();
    mockRefetchEntitlement.mockReset().mockResolvedValue({});
    mockRefetchBatch.mockReset();
    mockRefetchBatch.mockResolvedValue({ data: { conversionBatch: { files: [] } } });
    mockPollingStopped = false;
    mockActive = null;
    mockFailure = null;
  });

  it('names every rejected file and uploads nothing when none survive validation', async () => {
    const { result } = renderHook(() => useCompressorModel());

    await act(async () =>
      result.current.submit([image('notes.pdf', 2048, 'application/pdf')])
    );

    expect(result.current.rejected).toHaveLength(1);
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('hands the accepted files, mode and strength to the upload', async () => {
    const { result } = renderHook(() => useCompressorModel());

    act(() => result.current.setMode('LOSSLESS'));
    act(() => result.current.setStrength('HIGH'));
    await act(async () => result.current.submit([image('a.png')]));

    expect(mockSubmit).toHaveBeenCalledWith([expect.any(File)], 'LOSSLESS', 'HIGH');
  });

  it('refreshes the quota counter after an upload was handed over', async () => {
    const { result } = renderHook(() => useCompressorModel());

    await act(async () => result.current.submit([image('a.png')]));

    expect(mockRefetchEntitlement).toHaveBeenCalledTimes(1);
  });

  it('keeps a healthy batch when only the quota counter failed to refresh', async () => {
    mockRefetchEntitlement.mockRejectedValue(new Error('offline'));
    const { result } = renderHook(() => useCompressorModel());

    await act(async () => result.current.submit([image('a.png')]));

    expect(result.current.errorCode).toBeNull();
  });

  it('reads the clock and the missing uploads from the current upload', () => {
    mockActive = { batchId: 'batch-1', batchToken: 'token', startedAt: 42 };
    const { result } = renderHook(() => useCompressorModel());

    expect(result.current.startedAt).toBe(42);
  });

  it('surfaces the reason the current upload failed', () => {
    mockFailure = 'NO_FILES_ADMITTED';
    const { result } = renderHook(() => useCompressorModel());

    expect(result.current.errorCode).toBe('NO_FILES_ADMITTED');
  });

  it('clears its own state and the current upload when the visitor starts over', async () => {
    const { result } = renderHook(() => useCompressorModel());

    await act(async () =>
      result.current.submit([image('notes.pdf', 2048, 'application/pdf')])
    );
    act(() => result.current.reset());

    expect(result.current.rejected).toHaveLength(0);
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('refreshes the storage figure once the batch has settled', () => {
    const { rerender } = renderHook(() => useCompressorModel());
    expect(mockRefetchEntitlement).not.toHaveBeenCalled();

    mockPollingStopped = true;
    rerender();
    rerender();

    expect(mockRefetchEntitlement).toHaveBeenCalledTimes(1);
  });

  it('reports an expired result on its own row, leaving the page banner alone', async () => {
    mockRefetchBatch.mockResolvedValue({
      data: { conversionBatch: { files: [{ id: 'file-0', downloadUrl: null }] } },
    });
    const { result } = renderHook(() => useCompressorModel());

    await act(async () => result.current.download('file-0', 'a.png'));

    expect(result.current.downloadFailure).toEqual({
      fileId: 'file-0',
      reason: 'RESULT_EXPIRED',
    });
    expect(result.current.errorCode).toBeNull();
  });
});
