import { useMutation } from '@apollo/client/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useCurrentUser } from 'entities/user';

import {
  ResendEmailVerificationDocument,
  VerifyEmailDocument,
  getGraphQLErrorDetails,
} from 'shared/api';
import type { EmailVerificationStatus, GraphQLErrorDetails } from 'shared/api';

import { CAPTCHA_ACTION } from '../../model/errors';
import { useAuthAction } from '../../model/useAuthAction';

type VerificationViewStatus = EmailVerificationStatus | 'CHECK_EMAIL' | 'RESENT';
type ResendIntent = { email: string };

const isVerifiedStatus = (status: VerificationViewStatus) =>
  status === 'VERIFIED' || status === 'ALREADY_VERIFIED';

const maskEmail = (email: string) => {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  return `${local.slice(0, 1)}${'*'.repeat(Math.max(4, local.length - 1))}@${domain}`;
};

const useVerifyEmailModel = () => {
  const session = useCurrentUser();
  const location = useLocation();
  const stateEmail = (location.state as { email?: string } | null)?.email;
  const initialEmail = stateEmail ?? sessionStorage.getItem('pendingVerificationEmail') ?? '';
  const [email, setEmail] = useState(initialEmail);
  const [editingEmail, setEditingEmail] = useState(!initialEmail);
  const [verificationToken] = useState(
    () => new URLSearchParams(window.location.hash.slice(1)).get('token') ?? ''
  );
  const [status, setStatus] = useState<VerificationViewStatus>('CHECK_EMAIL');
  const [cooldown, setCooldown] = useState(0);
  const [verifyEmail] = useMutation(VerifyEmailDocument);
  const [resend] = useMutation(ResendEmailVerificationDocument);
  const verificationRequestRef = useRef<ReturnType<typeof verifyEmail> | null>(null);

  const executeResend = useCallback(
    async (intent: ResendIntent, captchaToken?: string) => {
      await resend({ variables: { input: { email: intent.email, captchaToken } } });
      setEmail(intent.email);
      sessionStorage.setItem('pendingVerificationEmail', intent.email);
      setEditingEmail(false);
      setStatus('RESENT');
      setCooldown(60);
    },
    [resend]
  );

  const applyCooldown = useCallback((details: GraphQLErrorDetails) => {
    if (details.retryAfter !== undefined) {
      setCooldown(Math.max(1, Math.ceil(details.retryAfter)));
    }
  }, []);

  const auth = useAuthAction<ResendIntent>({
    execute: executeResend,
    fallbackCaptchaAction: () => CAPTCHA_ACTION.resendConfirmation,
    initialBusy: Boolean(verificationToken),
    onError: applyCooldown,
  });
  const { run, setAuthError, setBusy } = auth;

  useEffect(() => {
    if (!verificationToken) return;

    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${window.location.search}`
    );
    let active = true;
    if (!verificationRequestRef.current) {
      verificationRequestRef.current = verifyEmail({
        variables: { input: { token: verificationToken } },
      });
    }
    verificationRequestRef.current
      .then(({ data }) => {
        const nextStatus = data?.verifyEmail.status;
        if (!active || !nextStatus) return;

        setStatus(nextStatus);
        if (isVerifiedStatus(nextStatus)) {
          sessionStorage.removeItem('pendingVerificationEmail');
        }
      })
      .catch((error) => {
        if (active) setAuthError(getGraphQLErrorDetails(error));
      })
      .finally(() => {
        if (active) setBusy(false);
      });

    return () => {
      active = false;
    };
  }, [setAuthError, setBusy, verificationToken, verifyEmail]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(
      () => setCooldown((value) => Math.max(0, value - 1)),
      1000
    );
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const resendEmail = useCallback(() => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || cooldown > 0) return;
    void run({ email: normalizedEmail });
  }, [cooldown, email, run]);

  const sessionVerified = session.status === 'authenticated' && session.user.emailVerified;
  const viewStatus: VerificationViewStatus =
    status === 'CHECK_EMAIL' && sessionVerified ? 'ALREADY_VERIFIED' : status;
  const verified = isVerifiedStatus(viewStatus);

  return {
    busy: auth.busy,
    captcha: auth.captcha,
    cooldown,
    editingEmail,
    email,
    error: auth.error,
    errorMessage: auth.errorMessage,
    maskedEmail: email ? maskEmail(email) : '',
    onCaptchaToken: auth.onCaptchaToken,
    onCaptchaUnavailable: auth.onCaptchaUnavailable,
    resendEmail,
    setEmail,
    status: viewStatus,
    verified,
  };
};

export { useVerifyEmailModel };
export type { VerificationViewStatus };
