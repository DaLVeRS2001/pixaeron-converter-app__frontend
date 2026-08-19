import { useQuery } from '@apollo/client/react';
import { useCallback, useRef, useState } from 'react';

import { ConversionEntitlementDocument } from 'entities/conversion';

import { DOWNLOAD_FAILURE, saveResult, useConversionProgress } from 'features/trackConversion';
import { UploadFailedError, useImageUpload, validateSelection } from 'features/uploadImages';
import type { RejectedSelection, StartedBatch } from 'features/uploadImages';

import { getGraphQLErrorDetails } from 'shared/api';

type ActiveBatch = StartedBatch & { startedAt: number };

type DownloadFailure = { fileId: string; reason: string };

const NO_FILES: ReadonlyMap<string, File> = new Map();

const useCompressorModel = () => {
  const entitlementQuery = useQuery(ConversionEntitlementDocument);
  const { refetch: refetchEntitlement } = entitlementQuery;
  const { start, cancel, uploading } = useImageUpload();

  const [active, setActive] = useState<ActiveBatch | null>(null);
  const [rejected, setRejected] = useState<RejectedSelection[]>([]);
  const [failure, setFailure] = useState<string | null>(null);
  const [downloadFailure, setDownloadFailure] = useState<DownloadFailure | null>(null);
  const attempt = useRef(0);

  const {
    batch,
    pollingStopped,
    refetch: refetchBatch,
    error: progressError,
  } = useConversionProgress({
    batchId: active?.batchId ?? null,
    batchToken: active?.batchToken ?? null,
  });
  const entitlement = entitlementQuery.data?.conversionEntitlement ?? null;

  const reset = useCallback(() => {
    attempt.current += 1;
    cancel();
    setActive(null);
    setRejected([]);
    setFailure(null);
    setDownloadFailure(null);
  }, [cancel]);

  const submit = useCallback(
    async (files: readonly File[]) => {
      if (!entitlement || uploading) return;

      setFailure(null);
      const run = (attempt.current += 1);
      const selection = validateSelection(files, {
        maxBatchFiles: entitlement.maxBatchFiles,
        maxFileBytes: entitlement.maxFileBytes,
        remainingToday: entitlement.remainingToday ?? null,
      });
      setRejected(selection.rejected);
      if (selection.accepted.length === 0) return;

      try {
        const started = await start(selection.accepted);
        if (run !== attempt.current) return;

        setActive({ ...started, startedAt: Date.now() });
      } catch (error) {
        if (run !== attempt.current) return;
        if (error instanceof DOMException && error.name === 'AbortError') return;

        setFailure(
          error instanceof UploadFailedError
            ? error.reason
            : (getGraphQLErrorDetails(error).code ?? null)
        );
      }

      await refetchEntitlement().catch(() => undefined);
    },
    [entitlement, refetchEntitlement, start, uploading]
  );

  const download = useCallback(
    async (fileId: string, name: string) => {
      setDownloadFailure(null);
      try {
        const { data } = await refetchBatch();
        const fresh = data?.conversionBatch?.files.find((file) => file.id === fileId);
        if (!fresh?.downloadUrl) {
          setDownloadFailure({ fileId, reason: DOWNLOAD_FAILURE.expired });

          return;
        }

        await saveResult(fresh.downloadUrl, name, fresh.outputFormat);
      } catch {
        setDownloadFailure({ fileId, reason: DOWNLOAD_FAILURE.unreachable });
      }
    },
    [refetchBatch]
  );

  const errorCode =
    failure ??
    (entitlementQuery.error && getGraphQLErrorDetails(entitlementQuery.error).code) ??
    (progressError && getGraphQLErrorDetails(progressError).code) ??
    null;

  return {
    entitlement,
    batch,
    pollingStopped,
    startedAt: active?.startedAt ?? null,
    missingUploads: active?.missingFiles ?? 0,
    sourceFiles: active?.sourceFiles ?? NO_FILES,
    downloadFailure,
    rejected,
    errorCode,
    uploading,
    submit,
    reset,
    download,
  };
};

export { useCompressorModel };
