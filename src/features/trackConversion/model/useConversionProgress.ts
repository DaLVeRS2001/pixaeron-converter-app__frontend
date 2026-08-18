import { useQuery } from '@apollo/client/react';

import { isBatchSettled } from 'entities/conversion';

import { ConversionBatchDocument } from 'shared/api';

const ACTIVE_POLL_MS = 2000;

const HIDDEN_POLL_MS = 15000;

type ProgressInput = {
  batchId: string | null;
  batchToken: string | null;
  documentHidden?: boolean;
};

const useConversionProgress = (input: ProgressInput) => {
  const { batchId, batchToken, documentHidden = false } = input;

  const query = useQuery(ConversionBatchDocument, {
    variables: { id: batchId ?? '', batchToken },
    skip: !batchId,
    fetchPolicy: 'network-only',
  });

  const batch = query.data?.conversionBatch ?? null;
  const settled = batch ? isBatchSettled(batch.status) : false;

  const idlePoll = documentHidden ? HIDDEN_POLL_MS : ACTIVE_POLL_MS;
  const pollInterval = !batchId || settled ? 0 : idlePoll;

  return { batch, settled, pollInterval, refetch: query.refetch, error: query.error };
};

export { ACTIVE_POLL_MS, HIDDEN_POLL_MS, useConversionProgress };
