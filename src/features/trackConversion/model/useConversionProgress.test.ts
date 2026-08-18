import { act, renderHook } from '@testing-library/react';

import type { ConversionBatchStatus, ConversionFileStatus } from 'entities/conversion';

import {
  ACTIVE_POLL_MS,
  HIDDEN_POLL_MS,
  useConversionProgress,
} from './useConversionProgress';

const mockStartPolling = jest.fn();
const mockStopPolling = jest.fn();
type MockBatch = {
  id: string;
  status: ConversionBatchStatus;
  files: { id: string; status: ConversionFileStatus }[];
};

let mockBatchPayload: MockBatch | null = null;

jest.mock('@apollo/client/react', () => ({
  useQuery: () => ({
    data: mockBatchPayload && { conversionBatch: mockBatchPayload },
    error: undefined,
    refetch: jest.fn(),
    startPolling: mockStartPolling,
    stopPolling: mockStopPolling,
  }),
}));

const batch = (status: ConversionBatchStatus, files: ConversionFileStatus[]): MockBatch => ({
  id: 'batch-1',
  status,
  files: files.map((fileStatus, index) => ({ id: `file-${index}`, status: fileStatus })),
});

const setVisibility = (state: DocumentVisibilityState) => {
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true });
  act(() => document.dispatchEvent(new Event('visibilitychange')));
};

describe('useConversionProgress', () => {
  beforeEach(() => {
    mockBatchPayload = null;
    setVisibility('visible');
  });

  it('asks the server for progress while the batch is still running', () => {
    mockBatchPayload = batch('PROCESSING', ['PROCESSING', 'QUEUED']);

    renderHook(() => useConversionProgress({ batchId: 'batch-1', batchToken: 'token' }));

    expect(mockStartPolling).toHaveBeenCalledWith(ACTIVE_POLL_MS);
  });

  it('stops asking once the batch settles', () => {
    mockBatchPayload = batch('PROCESSING', ['PROCESSING', 'QUEUED']);
    const { rerender, result } = renderHook(() =>
      useConversionProgress({ batchId: 'batch-1', batchToken: 'token' })
    );

    mockStartPolling.mockClear();
    mockBatchPayload = batch('COMPLETED', ['COMPLETED', 'COMPLETED']);
    rerender();

    expect(result.current.pollingStopped).toBe(true);
    expect(mockStopPolling).toHaveBeenCalled();
    expect(mockStartPolling).not.toHaveBeenCalled();
  });

  it('slows down while the tab is in the background', () => {
    mockBatchPayload = batch('QUEUED', ['QUEUED', 'QUEUED']);
    renderHook(() => useConversionProgress({ batchId: 'batch-1', batchToken: 'token' }));

    mockStartPolling.mockClear();
    setVisibility('hidden');

    expect(mockStartPolling).toHaveBeenCalledWith(HIDDEN_POLL_MS);
  });

  it('ignores a payload left over from the previous batch', () => {
    mockBatchPayload = batch('COMPLETED', ['COMPLETED', 'COMPLETED']);

    const { result } = renderHook(() =>
      useConversionProgress({ batchId: 'batch-2', batchToken: 'token' })
    );

    expect(result.current.batch).toBeNull();
    expect(result.current.pollingStopped).toBe(false);
    expect(mockStartPolling).toHaveBeenCalledWith(ACTIVE_POLL_MS);
  });

  it('stops when the last unfinished file can no longer move', () => {
    mockBatchPayload = batch('PROCESSING', ['COMPLETED', 'PROCESSING']);
    const { rerender, result } = renderHook(() =>
      useConversionProgress({ batchId: 'batch-1', batchToken: 'token' })
    );

    mockStartPolling.mockClear();
    mockBatchPayload = batch('PROCESSING', ['COMPLETED', 'UPLOADING']);
    rerender();

    expect(result.current.pollingStopped).toBe(true);
    expect(mockStopPolling).toHaveBeenCalled();
    expect(mockStartPolling).not.toHaveBeenCalled();
  });

  it('does not poll before a batch exists', () => {
    renderHook(() => useConversionProgress({ batchId: null, batchToken: null }));

    expect(mockStartPolling).not.toHaveBeenCalled();
  });
});
