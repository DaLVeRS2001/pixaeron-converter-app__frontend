import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getGraphQLErrorDetails } from 'shared/api';
import type { GraphQLErrorDetails } from 'shared/api';

import { AUTH_ERROR_CODE, authErrorMessage, isCaptchaChallenge } from './errors';
import { useCaptchaChallenge } from './useCaptchaChallenge';

type AuthActionOptions<TIntent> = {
  execute: (intent: TIntent, captchaToken?: string) => Promise<void>;
  fallbackCaptchaAction: (intent: TIntent) => string;
  onError?: (details: GraphQLErrorDetails, intent: TIntent) => boolean | void;
  initialBusy?: boolean;
};

const useAuthAction = <TIntent>(options: AuthActionOptions<TIntent>) => {
  const { execute, fallbackCaptchaAction, initialBusy = false, onError } = options;
  const { t } = useTranslation('auth');
  const [authError, setAuthError] = useState<GraphQLErrorDetails>();
  const [busy, setBusy] = useState(initialBusy);
  const { activate, challenge, clear, receiveToken } = useCaptchaChallenge<TIntent>();

  const run = useCallback(
    async (intent: TIntent, captchaToken?: string) => {
      if (busy) return;
      setBusy(true);
      setAuthError(undefined);

      try {
        await execute(intent, captchaToken);
        clear();
      } catch (error) {
        const details = getGraphQLErrorDetails(error);
        if (onError?.(details, intent)) return;

        if (isCaptchaChallenge(details.code)) {
          activate(details.action ?? fallbackCaptchaAction(intent), intent);
        } else {
          clear();
        }
        setAuthError(details);
      } finally {
        setBusy(false);
      }
    },
    [activate, busy, clear, execute, fallbackCaptchaAction, onError]
  );

  const onCaptchaToken = useCallback(
    (token: string) => {
      const intent = receiveToken(token);
      if (intent) void run(intent, token);
    },
    [receiveToken, run]
  );

  const onCaptchaUnavailable = useCallback(() => {
    clear();
    setAuthError({ code: AUTH_ERROR_CODE.captchaUnavailable });
  }, [clear]);

  return {
    activate,
    busy,
    captcha: challenge,
    clear,
    error: authError,
    errorMessage: authError ? authErrorMessage(authError, t) : '',
    onCaptchaToken,
    onCaptchaUnavailable,
    run,
    setAuthError,
    setBusy,
  };
};

export { useAuthAction };
