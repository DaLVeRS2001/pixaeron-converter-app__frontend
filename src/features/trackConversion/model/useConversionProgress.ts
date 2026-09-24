import { useQuery } from '@apollo/client/react';

import { ConversionBatchDocument, isBatchSettled, isFileMoving } from 'entities/conversion';

import { usePollingWhile } from './usePollingWhile';

type ProgressInput = {
  batchId: string | null;
  batchToken: string | null;
};

const useConversionProgress = ({ batchId, batchToken }: ProgressInput) => {
  const query = useQuery(ConversionBatchDocument, {
    variables: { id: batchId ?? '', batchToken },
    skip: !batchId,
    fetchPolicy: 'network-only',
  });

  const fetched = query.data?.conversionBatch ?? null;
  const batch = fetched && fetched.id === batchId ? fetched : null;
  const moving = batch?.files.some((file) => isFileMoving(file.status)) ?? false;
  const pollingStopped = batch !== null && (isBatchSettled(batch.status) || !moving);

  usePollingWhile(query, Boolean(batchId) && !pollingStopped);

  return { batch, pollingStopped, refetch: query.refetch, error: query.error };
};

export { useConversionProgress };
