import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { PropsWithChildren } from 'react';

import { useCurrentUser } from 'entities/user';

import { getGraphQLErrorDetails } from 'shared/api';
import type { ConversionMode, ConversionStrength } from 'shared/api';

import { UploadFailedError } from './uploadToStorage';
import { useImageUpload } from './useImageUpload';
import type { StartedBatch } from './useImageUpload';

type ActiveBatch = StartedBatch & { startedAt: number };

type CurrentUpload = {
  active: ActiveBatch | null;
  failure: string | null;
  uploading: boolean;
  submit: (
    files: readonly File[],
    mode: ConversionMode,
    strength: ConversionStrength
  ) => Promise<void>;
  reset: () => void;
};

const CurrentUploadContext = createContext<CurrentUpload | null>(null);

const CurrentUploadProvider = ({ children }: PropsWithChildren) => {
  const session = useCurrentUser();
  const owner = session.status === 'authenticated' ? session.user.id : 'guest';
  const { start, cancel, uploading } = useImageUpload();
  const [active, setActive] = useState<ActiveBatch | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const attempt = useRef(0);

  const reset = useCallback(() => {
    attempt.current += 1;
    cancel();
    setActive(null);
    setFailure(null);
  }, [cancel]);

  useEffect(() => () => reset(), [owner, reset]);

  const submit = useCallback(
    async (files: readonly File[], mode: ConversionMode, strength: ConversionStrength) => {
      if (uploading) return;

      setFailure(null);
      const run = (attempt.current += 1);
      try {
        const started = await start(files, mode, strength);
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
    },
    [start, uploading]
  );

  const value = useMemo(
    () => ({ active, failure, uploading, submit, reset }),
    [active, failure, uploading, submit, reset]
  );

  return (
    <CurrentUploadContext.Provider value={value}>{children}</CurrentUploadContext.Provider>
  );
};

const useCurrentUpload = (): CurrentUpload => {
  const value = useContext(CurrentUploadContext);
  if (!value) throw new Error('useCurrentUpload must be used inside CurrentUploadProvider');

  return value;
};

export { CurrentUploadProvider, useCurrentUpload };
