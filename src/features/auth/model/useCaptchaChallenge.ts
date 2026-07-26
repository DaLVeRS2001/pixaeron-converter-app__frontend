import { useCallback, useRef, useState } from 'react';

type CaptchaChallenge = {
  action: string;
  version: number;
  hasToken: boolean;
};

const useCaptchaChallenge = <TIntent>() => {
  const pendingIntentRef = useRef<TIntent | undefined>(undefined);
  const tokenRef = useRef('');
  const [challenge, setChallenge] = useState<CaptchaChallenge>();

  const activate = useCallback((action: string, intent?: TIntent) => {
    pendingIntentRef.current = intent;
    tokenRef.current = '';
    setChallenge((current) => ({
      action,
      version: (current?.version ?? 0) + 1,
      hasToken: false,
    }));
  }, []);

  const clear = useCallback(() => {
    pendingIntentRef.current = undefined;
    tokenRef.current = '';
    setChallenge(undefined);
  }, []);

  const consumeToken = useCallback(
    (action: string) => {
      if (challenge?.action !== action || !tokenRef.current) return undefined;
      const token = tokenRef.current;
      tokenRef.current = '';
      setChallenge(undefined);
      return token;
    },
    [challenge?.action]
  );

  const receiveToken = useCallback((token: string) => {
    tokenRef.current = token;
    setChallenge((current) => (current ? { ...current, hasToken: Boolean(token) } : current));
    if (!token || pendingIntentRef.current === undefined) return undefined;

    const intent = pendingIntentRef.current;
    pendingIntentRef.current = undefined;
    return intent;
  }, []);

  return { activate, challenge, clear, consumeToken, receiveToken };
};

export { useCaptchaChallenge };
export type { CaptchaChallenge };
