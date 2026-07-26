import block from 'bem-cn';
import { useEffect, useRef } from 'react';

import { invalidateExternalScript, loadExternalScript } from 'shared/lib';

import './GoogleButton.scss';

type GoogleButtonProps = {
  mode: 'signin_with' | 'signup_with';
  onCredential: (credential: string) => void;
  onUnavailable?: () => void;
};

const cn = block('google-button');
const scriptId = 'google-identity-script';

const GoogleButton = ({ mode, onCredential, onUnavailable }: GoogleButtonProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const onUnavailableRef = useRef(onUnavailable);

  useEffect(() => {
    onCredentialRef.current = onCredential;
    onUnavailableRef.current = onUnavailable;
  }, [onCredential, onUnavailable]);

  useEffect(() => {
    if (!__GOOGLE_CLIENT_ID__) return;

    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    const notifyUnavailable = () => onUnavailableRef.current?.();
    const initialize = async () => {
      try {
        if (!window.google) {
          await loadExternalScript({
            id: scriptId,
            src: 'https://accounts.google.com/gsi/client',
            timeoutMs: 8_000,
            retries: 1,
          });
        }
        if (cancelled) return;
        if (!window.google) {
          throw new Error('Google Identity Services did not initialize.');
        }

        container.replaceChildren();
        window.google.accounts.id.initialize({
          client_id: __GOOGLE_CLIENT_ID__,
          callback: ({ credential }) => {
            if (!cancelled && credential) onCredentialRef.current(credential);
          },
        });
        window.google.accounts.id.renderButton(container, {
          theme: 'outline',
          size: 'large',
          width: Math.min(container.clientWidth, 400),
          text: mode,
        });
      } catch {
        if (cancelled) return;
        invalidateExternalScript(scriptId);
        container.replaceChildren();
        notifyUnavailable();
      }
    };

    void initialize();

    return () => {
      cancelled = true;
      container.replaceChildren();
    };
  }, [mode]);

  if (!__GOOGLE_CLIENT_ID__) return null;

  return <div ref={containerRef} className={cn()} />;
};

export { GoogleButton };
