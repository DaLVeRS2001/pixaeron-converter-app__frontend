import { useQuery } from '@apollo/client/react';
import { useEffect, useState } from 'react';

import { ConversionBatchDocument, isBatchSettled, isFileMoving } from 'entities/conversion';

const ACTIVE_POLL_MS = 2000;

const HIDDEN_POLL_MS = 15000;

type ProgressInput = {
  batchId: string | null;
  batchToken: string | null;
};

const useConversionProgress = ({ batchId, batchToken }: ProgressInput) => {
  const [hidden, setHidden] = useState(() => document.visibilityState === 'hidden');

  useEffect(() => {
    const onVisibility = () => setHidden(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', onVisibility);

    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const { data, error, refetch, startPolling, stopPolling } = useQuery(
    ConversionBatchDocument,
    {
      variables: { id: batchId ?? '', batchToken },
      skip: !batchId,
      fetchPolicy: 'network-only',
    }
  );

  const fetched = data?.conversionBatch ?? null;
  const batch = fetched && fetched.id === batchId ? fetched : null;
  const moving = batch?.files.some((file) => isFileMoving(file.status)) ?? false;
  const pollingStopped = batch !== null && (isBatchSettled(batch.status) || !moving);

  useEffect(() => {
    if (!batchId || pollingStopped) return;

    startPolling(hidden ? HIDDEN_POLL_MS : ACTIVE_POLL_MS);

    return () => stopPolling();
  }, [batchId, hidden, pollingStopped, startPolling, stopPolling]);

  return { batch, pollingStopped, refetch, error };
};

export { ACTIVE_POLL_MS, HIDDEN_POLL_MS, useConversionProgress };
