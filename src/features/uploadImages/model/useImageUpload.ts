import { useMutation } from '@apollo/client/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  CompleteConversionUploadsDocument,
  CreateConversionBatchDocument,
} from 'entities/conversion';

import { UPLOAD_FAILURE, UploadFailedError, uploadToStorage } from './uploadToStorage';

type StartedBatch = {
  batchId: string;
  batchToken: string | null;
  fileNames: Map<string, string>;
  missingFiles: number;
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
          throw new UploadFailedError(UPLOAD_FAILURE.malformedBatch);
        }

        const fileNames = new Map(
          batch.files.map((slot, index) => [slot.id, files[index].name])
        );

        try {
          await Promise.all(
            batch.files.map((slot, index) => {
              if (!slot.upload) throw new UploadFailedError(UPLOAD_FAILURE.malformedBatch);

              return uploadToStorage(slot.upload, files[index], controller.signal);
            })
          );
        } catch (error) {
          controller.abort();
          throw error;
        }

        const completion = await completeUploads({
          variables: { input: { batchId: batch.id, batchToken: batch.batchToken } },
        });
        const admitted = completion.data?.completeConversionUploads;
        if (!admitted || admitted.admittedFiles === 0) {
          throw new UploadFailedError(UPLOAD_FAILURE.notAdmitted);
        }

        return {
          batchId: batch.id,
          batchToken: batch.batchToken ?? null,
          fileNames,
          missingFiles: admitted.missingFiles,
        };
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
