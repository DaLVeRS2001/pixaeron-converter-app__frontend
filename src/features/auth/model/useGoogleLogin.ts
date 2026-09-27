import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

import { GoogleLoginDocument } from 'shared/api';

import { CURRENT_LEGAL_CONSENT } from './legalConsent';
import { useCompleteLogin } from './useCompleteLogin';

const useGoogleLogin = () => {
  const [googleLogin] = useMutation(GoogleLoginDocument);
  const completeLogin = useCompleteLogin();

  return useCallback(
    async (idToken: string, captchaToken?: string) => {
      const { data } = await googleLogin({
        variables: { input: { idToken, captchaToken, ...CURRENT_LEGAL_CONSENT } },
      });
      if (data?.googleLogin) completeLogin(data.googleLogin);
    },
    [completeLogin, googleLogin]
  );
};

export { useGoogleLogin };
