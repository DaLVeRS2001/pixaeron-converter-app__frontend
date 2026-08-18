import { act, renderHook } from '@testing-library/react';

import { CompleteConversionUploadsDocument, CreateConversionBatchDocument } from 'shared/api';

import { useImageUpload } from './useImageUpload';

const mockMutations = new Map<unknown, jest.Mock>();

jest.mock('@apollo/client/react', () => ({
  useMutation: (document: unknown) => [mockMutations.get(document)],
}));

const image = (name: string) => new File(['bytes'], name, { type: 'image/png' });

const answerWith = (batch: unknown, admission: unknown) => {
  mockMutations.set(CreateConversionBatchDocument, jest.fn().mockResolvedValue(batch));
  mockMutations.set(CompleteConversionUploadsDocument, jest.fn().mockResolvedValue(admission));
};

const createdBatch = (fileCount: number) => ({
  data: {
    createConversionBatch: {
      id: 'batch-1',
      batchToken: 'token',
      files: Array.from({ length: fileCount }, (_unused, index) => ({
        id: `file-${index}`,
        upload: {
          url: 'https://bucket.example/upload',
          fields: [{ name: 'key', value: `inbox/file-${index}` }],
        },
      })),
    },
  },
});

const completion = (admittedFiles: number, missingFiles: number) => ({
  data: { completeConversionUploads: { admittedFiles, missingFiles } },
});

describe('useImageUpload', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'crypto', {
      value: { randomUUID: () => 'idempotency-key' },
      configurable: true,
    });
    globalThis.fetch = jest.fn().mockResolvedValue({ ok: true } as Response);
    mockMutations.clear();
  });

  it('keeps the batch when one upload never arrived but the rest were admitted', async () => {
    answerWith(createdBatch(3), completion(2, 1));
    const { result } = renderHook(() => useImageUpload());

    let started;
    await act(async () => {
      started = await result.current.start([image('a.png'), image('b.png'), image('c.png')]);
    });

    expect(started).toMatchObject({
      batchId: 'batch-1',
      batchToken: 'token',
      missingFiles: 1,
    });
  });

  it('fails when the server admitted nothing at all', async () => {
    answerWith(createdBatch(1), completion(0, 1));
    const { result } = renderHook(() => useImageUpload());

    await act(async () => {
      await expect(result.current.start([image('a.png')])).rejects.toMatchObject({
        reason: 'NO_FILES_ADMITTED',
      });
    });
  });
});
