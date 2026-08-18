import { useQuery } from '@apollo/client/react';
import { useEffect, useState } from 'react';

import { isBatchSettled } from 'entities/conversion';

import { ConversionBatchDocument } from 'shared/api';

const ACTIVE_POLL_MS = 2000;

const HIDDEN_POLL_MS = 15000;

type ProgressInput = {
  batchId: string | null;
  batchToken: string | null;
};

const useDocumentHidden = () => {
  const [hidden, setHidden] = useState(() => document.visibilityState === 'hidden');

  useEffect(() => {
    const onChange = () => setHidden(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', onChange);

    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);

  return hidden;
};

const useConversionProgress = ({ batchId, batchToken }: ProgressInput) => {
  const hidden = useDocumentHidden();

  const query = useQuery(ConversionBatchDocument, {
    variables: { id: batchId ?? '', batchToken },
    skip: !batchId,
    fetchPolicy: 'network-only',
    pollInterval: hidden ? HIDDEN_POLL_MS : ACTIVE_POLL_MS,
  });

  const batch = query.data?.conversionBatch ?? null;
  const settled = batch ? isBatchSettled(batch.status) : false;

  useEffect(() => {
    if (settled) query.stopPolling();
  }, [query, settled]);

  return { batch, settled, refetch: query.refetch, error: query.error };
};

export { ACTIVE_POLL_MS, HIDDEN_POLL_MS, useConversionProgress };
