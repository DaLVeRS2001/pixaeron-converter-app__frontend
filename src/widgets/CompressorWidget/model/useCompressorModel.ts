import { useQuery } from '@apollo/client/react';
import { useCallback, useEffect, useState } from 'react';

import { ConversionEntitlementDocument } from 'entities/conversion';

import { DOWNLOAD_FAILURE, saveResult, useConversionProgress } from 'features/trackConversion';
import { useCurrentUpload, validateSelection } from 'features/uploadImages';
import type { RejectedSelection } from 'features/uploadImages';

import { getGraphQLErrorDetails } from 'shared/api';
import type { ConversionMode, ConversionStrength } from 'shared/api';

type DownloadFailure = { fileId: string; reason: string };

const NO_FILES: ReadonlyMap<string, File> = new Map();

const useCompressorModel = () => {
  const entitlementQuery = useQuery(ConversionEntitlementDocument);
  const { refetch: refetchEntitlement } = entitlementQuery;
  const upload = useCurrentUpload();

  const [mode, setMode] = useState<ConversionMode>('LOSSY');
  const [strength, setStrength] = useState<ConversionStrength>('LOW');
  const [rejected, setRejected] = useState<RejectedSelection[]>([]);
  const [downloadFailure, setDownloadFailure] = useState<DownloadFailure | null>(null);

  const {
    batch,
    pollingStopped,
    refetch: refetchBatch,
    error: progressError,
  } = useConversionProgress({
    batchId: upload.active?.batchId ?? null,
    batchToken: upload.active?.batchToken ?? null,
  });
  const entitlement = entitlementQuery.data?.conversionEntitlement ?? null;

  useEffect(() => {
    if (!pollingStopped) return;

    refetchEntitlement().catch(() => undefined);
  }, [pollingStopped, refetchEntitlement]);

  const reset = useCallback(() => {
    upload.reset();
    setRejected([]);
    setDownloadFailure(null);
  }, [upload]);

  const submit = useCallback(
    async (files: readonly File[]) => {
      if (!entitlement || upload.uploading) return;

      const selection = validateSelection(files, {
        maxBatchFiles: entitlement.maxBatchFiles,
        maxFileBytes: entitlement.maxFileBytes,
        remainingToday: entitlement.remainingToday ?? null,
      });
      setRejected(selection.rejected);
      if (selection.accepted.length === 0) return;

      await upload.submit(selection.accepted, mode, strength);
      await refetchEntitlement().catch(() => undefined);
    },
    [entitlement, mode, refetchEntitlement, strength, upload]
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
    upload.failure ??
    (entitlementQuery.error && getGraphQLErrorDetails(entitlementQuery.error).code) ??
    (progressError && getGraphQLErrorDetails(progressError).code) ??
    null;

  return {
    entitlement,
    mode,
    setMode,
    strength,
    setStrength,
    batch,
    pollingStopped,
    startedAt: upload.active?.startedAt ?? null,
    missingUploads: upload.active?.missingFiles ?? 0,
    sourceFiles: upload.active?.sourceFiles ?? NO_FILES,
    downloadFailure,
    rejected,
    errorCode,
    uploading: upload.uploading,
    submit,
    reset,
    download,
  };
};

export { useCompressorModel };
