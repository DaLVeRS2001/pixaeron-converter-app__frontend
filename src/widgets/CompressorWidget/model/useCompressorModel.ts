import { useQuery } from '@apollo/client/react';
import { useCallback, useState } from 'react';

import { useConversionProgress } from 'features/trackConversion';
import { UploadFailedError, validateSelection } from 'features/uploadImages';
import type { RejectedSelection } from 'features/uploadImages';
import { useImageUpload } from 'features/uploadImages';

import { ConversionEntitlementDocument, getGraphQLErrorDetails } from 'shared/api';

const useCompressorModel = () => {
  const entitlementQuery = useQuery(ConversionEntitlementDocument);
  const { start, uploading } = useImageUpload();

  const [batchId, setBatchId] = useState<string | null>(null);
  const [batchToken, setBatchToken] = useState<string | null>(null);
  const [names, setNames] = useState<Map<string, string>>(new Map());
  const [rejected, setRejected] = useState<RejectedSelection[]>([]);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const progress = useConversionProgress({ batchId, batchToken });
  const entitlement = entitlementQuery.data?.conversionEntitlement ?? null;

  const reset = useCallback(() => {
    setBatchId(null);
    setBatchToken(null);
    setNames(new Map());
    setRejected([]);
    setErrorCode(null);
  }, []);

  const submit = useCallback(
    async (files: readonly File[]) => {
      if (!entitlement) return;

      setErrorCode(null);
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
        if (error instanceof UploadFailedError) {
          setErrorCode(error.reason);
          return;
        }
        setErrorCode(getGraphQLErrorDetails(error).code ?? 'generic');
      }
    },
    [entitlement, entitlementQuery, start]
  );

  return {
    entitlement,
    entitlementLoading: entitlementQuery.loading,
    batch: progress.batch,
    settled: progress.settled,
    names,
    rejected,
    errorCode,
    uploading,
    submit,
    reset,
    refetchBatch: progress.refetch,
  };
};

export { useCompressorModel };
