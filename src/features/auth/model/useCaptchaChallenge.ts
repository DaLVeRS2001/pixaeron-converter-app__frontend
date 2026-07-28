import { useCallback, useRef, useState } from 'react';

type CaptchaChallenge = {
  action: string;
  version: number;
};

const useCaptchaChallenge = <TIntent>() => {
  const pendingIntentRef = useRef<TIntent | undefined>(undefined);
  const [challenge, setChallenge] = useState<CaptchaChallenge>();

  const activate = useCallback((action: string, intent: TIntent) => {
    pendingIntentRef.current = intent;
    setChallenge((current) => ({
      action,
      version: (current?.version ?? 0) + 1,
    }));
  }, []);

  const clear = useCallback(() => {
    pendingIntentRef.current = undefined;
    setChallenge(undefined);
  }, []);

  const receiveToken = useCallback((token: string) => {
    if (!token || pendingIntentRef.current === undefined) return undefined;

    const intent = pendingIntentRef.current;
    pendingIntentRef.current = undefined;
    setChallenge(undefined);
    return intent;
  }, []);

  return { activate, challenge, clear, receiveToken };
};

export { useCaptchaChallenge };
export type { CaptchaChallenge };
