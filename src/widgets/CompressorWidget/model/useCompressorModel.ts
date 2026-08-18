import { useQuery } from '@apollo/client/react';
import { useCallback, useState } from 'react';

import { useConversionProgress } from 'features/trackConversion';
import { UploadFailedError, useImageUpload, validateSelection } from 'features/uploadImages';
import type { RejectedSelection } from 'features/uploadImages';

import { ConversionEntitlementDocument, getGraphQLErrorDetails } from 'shared/api';

const useCompressorModel = () => {
  const entitlementQuery = useQuery(ConversionEntitlementDocument);
  const { start, cancel, uploading } = useImageUpload();

  const [batchId, setBatchId] = useState<string | null>(null);
  const [batchToken, setBatchToken] = useState<string | null>(null);
  const [names, setNames] = useState<Map<string, string>>(new Map());
  const [rejected, setRejected] = useState<RejectedSelection[]>([]);
  const [failure, setFailure] = useState<string | null>(null);

  const progress = useConversionProgress({ batchId, batchToken });
  const entitlement = entitlementQuery.data?.conversionEntitlement ?? null;

  const reset = useCallback(() => {
    cancel();
    setBatchId(null);
    setBatchToken(null);
    setNames(new Map());
    setRejected([]);
    setFailure(null);
  }, [cancel]);

  const submit = useCallback(
    async (files: readonly File[]) => {
      if (!entitlement || uploading) return;

      setFailure(null);
      const selection = validateSelection(files, {
        maxBatchFiles: entitlement.maxBatchFiles,
        maxFileBytes: entitlement.maxFileBytes,
        remainingToday: entitlement.remainingToday ?? null,
      });
      setRejected(selection.rejected);
      if (selection.accepted.length === 0) return;

      try {
        const started = await start(selection.accepted);
        setBatchId(started.batchId);
        setBatchToken(started.batchToken);
        setNames(started.fileNames);
        await entitlementQuery.refetch();
      } catch (error) {
        setFailure(
          error instanceof UploadFailedError
            ? error.reason
            : getGraphQLErrorDetails(error).code ?? null
        );
      }
    },
    [entitlement, entitlementQuery, start, uploading]
  );

  const errorCode =
    failure ??
    (entitlementQuery.error && getGraphQLErrorDetails(entitlementQuery.error).code) ??
    (progress.error && getGraphQLErrorDetails(progress.error).code) ??
    null;

  return {
    entitlement,
    batch: progress.batch,
    names,
    rejected,
    errorCode,
    uploading,
    submit,
    reset,
    reportFailure: setFailure,
    refetchBatch: progress.refetch,
  };
};

export { useCompressorModel };
