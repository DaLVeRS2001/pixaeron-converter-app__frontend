import { useMutation } from '@apollo/client/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { CompleteConversionUploadsDocument, CreateConversionBatchDocument } from 'shared/api';

import { uploadToStorage } from './uploadToStorage';

type StartedBatch = {
  batchId: string;
  batchToken: string | null;
  fileNames: Map<string, string>;
};

const useImageUpload = () => {
  const [createBatch] = useMutation(CreateConversionBatchDocument);
  const [completeUploads] = useMutation(CompleteConversionUploadsDocument);
  const [uploading, setUploading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  useEffect(() => cancel, [cancel]);

  const start = useCallback(
    async (files: readonly File[]): Promise<StartedBatch> => {
      const controller = new AbortController();
      abortRef.current = controller;
      setUploading(true);

      try {
        const { data } = await createBatch({
          variables: {
            input: { fileCount: files.length, idempotencyKey: crypto.randomUUID() },
          },
        });

        const batch = data?.createConversionBatch;
        if (!batch || batch.files.length !== files.length) {
          throw new Error('createConversionBatch returned an unusable batch');
        }

        const fileNames = new Map(
          batch.files.map((slot, index) => [slot.id, files[index].name])
        );

        try {
          await Promise.all(
            batch.files.map((slot, index) => {
              if (!slot.upload) throw new Error(`file ${slot.id} carries no upload target`);

              return uploadToStorage(slot.upload, files[index], controller.signal);
            })
          );
        } catch (error) {
          controller.abort();
          throw error;
        }

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
