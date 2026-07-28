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

type GoogleIdentityClient = NonNullable<Window['google']>['accounts']['id'];

let initializedGoogleIdentity: GoogleIdentityClient | undefined;
let activeCredentialHandler: ((credential: string) => void) | undefined;

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
    const handleCredential = (credential: string) => onCredentialRef.current(credential);
    activeCredentialHandler = handleCredential;
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

        const googleIdentity = window.google.accounts.id;
        container.replaceChildren();
        if (initializedGoogleIdentity !== googleIdentity) {
          googleIdentity.initialize({
            client_id: __GOOGLE_CLIENT_ID__,
            callback: ({ credential }) => {
              if (credential) activeCredentialHandler?.(credential);
            },
          });
          initializedGoogleIdentity = googleIdentity;
        }
        googleIdentity.renderButton(container, {
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
      if (activeCredentialHandler === handleCredential) activeCredentialHandler = undefined;
      container.replaceChildren();
    };
  }, [mode]);

  if (!__GOOGLE_CLIENT_ID__) return null;

  return <div ref={containerRef} className={cn()} />;
};

export { GoogleButton };
