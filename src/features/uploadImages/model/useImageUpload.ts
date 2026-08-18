import { useMutation } from '@apollo/client/react';
import { useCallback, useRef, useState } from 'react';

import { CompleteConversionUploadsDocument, CreateConversionBatchDocument } from 'shared/api';

import { uploadToStorage } from './uploadToStorage';

type StartedBatch = {
  batchId: string;
  batchToken: string | null;
  fileNames: Map<string, string>;
};

const newIdempotencyKey = () => crypto.randomUUID();

const useImageUpload = () => {
  const [createBatch] = useMutation(CreateConversionBatchDocument);
  const [completeUploads] = useMutation(CompleteConversionUploadsDocument);
  const [uploading, setUploading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const start = useCallback(
    async (files: readonly File[]): Promise<StartedBatch> => {
      const controller = new AbortController();
      abortRef.current = controller;
      setUploading(true);

      try {
        const { data } = await createBatch({
          variables: {
            input: { fileCount: files.length, idempotencyKey: newIdempotencyKey() },
          },
        });

        const batch = data?.createConversionBatch;
        if (!batch) throw new Error('createConversionBatch returned no batch');

        const fileNames = new Map<string, string>();
        const uploads = batch.files.map((slot, index) => {
          const file = files[index];
          fileNames.set(slot.id, file.name);
          if (!slot.upload) throw new Error(`file ${slot.id} carries no upload target`);

          return uploadToStorage(slot.upload, file, controller.signal);
        });

        await Promise.all(uploads);

        await completeUploads({
          variables: { input: { batchId: batch.id, batchToken: batch.batchToken } },
        });

        return { batchId: batch.id, batchToken: batch.batchToken ?? null, fileNames };
      } finally {
        setUploading(false);
        abortRef.current = null;
      }
    },
    [completeUploads, createBatch]
  );

  return { start, cancel, uploading };
};

export { useImageUpload };
export type { StartedBatch };
