import { useMutation } from '@apollo/client/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { ResendEmailVerificationDocument, VerifyEmailDocument } from 'shared/api';
import type { EmailVerificationStatus } from 'shared/api';

import { CAPTCHA_ACTION, isCaptchaChallenge, translateAuthError } from '../../model/errors';
import { useCaptchaChallenge } from '../../model/useCaptchaChallenge';

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
  const { t } = useTranslation('auth');
  const location = useLocation();
  const stateEmail = (location.state as { email?: string } | null)?.email;
  const initialEmail = stateEmail ?? sessionStorage.getItem('pendingVerificationEmail') ?? '';
  const [email, setEmail] = useState(initialEmail);
  const [editingEmail, setEditingEmail] = useState(!initialEmail);
  const [verificationToken] = useState(
    () => new URLSearchParams(window.location.hash.slice(1)).get('token') ?? ''
  );
  const [status, setStatus] = useState<VerificationViewStatus>('CHECK_EMAIL');
  const [errorMessage, setErrorMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState(Boolean(verificationToken));
  const [verifyEmail] = useMutation(VerifyEmailDocument);
  const [resend] = useMutation(ResendEmailVerificationDocument);
  const verificationRequestRef = useRef<ReturnType<typeof verifyEmail> | null>(null);
  const { activate, challenge, clear, receiveToken } = useCaptchaChallenge<ResendIntent>();

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
        if (active) setErrorMessage(translateAuthError(error, t).message);
      })
      .finally(() => {
        if (active) setBusy(false);
      });

    return () => {
      active = false;
    };
  }, [t, verificationToken, verifyEmail]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(
      () => setCooldown((value) => Math.max(0, value - 1)),
      1000
    );
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const executeResend = useCallback(
    async (intent: ResendIntent, captchaToken?: string) => {
      if (busy) return;
      setBusy(true);
      setErrorMessage('');

      try {
        await resend({ variables: { input: { email: intent.email, captchaToken } } });
        setEmail(intent.email);
        sessionStorage.setItem('pendingVerificationEmail', intent.email);
        setEditingEmail(false);
        setStatus('RESENT');
        setCooldown(60);
        clear();
      } catch (error) {
        const translated = translateAuthError(error, t);
        if (translated.retryAfter !== undefined) {
          setCooldown(Math.max(1, Math.ceil(translated.retryAfter)));
        }
        if (isCaptchaChallenge(translated.code)) {
          activate(translated.action ?? CAPTCHA_ACTION.resendConfirmation, intent);
        } else {
          clear();
        }
        setErrorMessage(translated.message);
      } finally {
        setBusy(false);
      }
    },
    [activate, busy, clear, resend, t]
  );

  const resendEmail = useCallback(() => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || cooldown > 0) return;
    void executeResend({ email: normalizedEmail });
  }, [cooldown, email, executeResend]);
  const onCaptchaToken = useCallback(
    (token: string) => {
      const intent = receiveToken(token);
      if (intent) void executeResend(intent, token);
    },
    [executeResend, receiveToken]
  );
  const handleCaptchaUnavailable = useCallback(() => {
    clear();
    setErrorMessage(t('errors.captchaUnavailable'));
  }, [clear, t]);

  const verified = isVerifiedStatus(status);

  return {
    busy,
    captcha: challenge,
    cooldown,
    editingEmail,
    email,
    errorMessage,
    maskedEmail: email ? maskEmail(email) : '',
    onCaptchaToken,
    onCaptchaUnavailable: handleCaptchaUnavailable,
    resendEmail,
    setEmail,
    status,
    verified,
  };
};

export { useVerifyEmailModel };
export type { VerificationViewStatus };
