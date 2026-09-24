import { useEffect, useState } from 'react';

const ACTIVE_POLL_MS = 2000;

const HIDDEN_POLL_MS = 15000;

type Pollable = {
  startPolling: (intervalMs: number) => void;
  stopPolling: () => void;
};

const usePollingWhile = ({ startPolling, stopPolling }: Pollable, active: boolean) => {
  const [hidden, setHidden] = useState(() => document.visibilityState === 'hidden');

  useEffect(() => {
    const onVisibility = () => setHidden(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', onVisibility);

    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    if (!active) return;

    startPolling(hidden ? HIDDEN_POLL_MS : ACTIVE_POLL_MS);

    return () => stopPolling();
  }, [active, hidden, startPolling, stopPolling]);
};

export { ACTIVE_POLL_MS, HIDDEN_POLL_MS, usePollingWhile };
