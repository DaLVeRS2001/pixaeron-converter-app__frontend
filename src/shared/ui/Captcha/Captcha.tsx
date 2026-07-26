import block from 'bem-cn';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { invalidateExternalScript, loadExternalScript } from 'shared/lib';

import './Captcha.scss';

type CaptchaProps = {
  action: string;
  onToken: (token: string) => void;
  onUnavailable?: () => void;
};

const cn = block('captcha');
const scriptId = 'cloudflare-turnstile-script';

const Captcha = ({ action, onToken, onUnavailable }: CaptchaProps) => {
  const { t } = useTranslation('auth');
  const containerRef = useRef<HTMLDivElement>(null);
  const onTokenRef = useRef(onToken);
  const onUnavailableRef = useRef(onUnavailable);

  useEffect(() => {
    onTokenRef.current = onToken;
    onUnavailableRef.current = onUnavailable;
  }, [onToken, onUnavailable]);

  useEffect(() => {
    if (!__TURNSTILE_SITE_KEY__) {
      onUnavailableRef.current?.();
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    let widgetId: string | undefined;
    let cancelled = false;

    const notifyUnavailable = () => onUnavailableRef.current?.();
    const initialize = async () => {
      try {
        if (!window.turnstile) {
          await loadExternalScript({
            id: scriptId,
            src: 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit',
            timeoutMs: 8_000,
            retries: 1,
          });
        }
        if (cancelled) return;
        if (!window.turnstile) {
          throw new Error('Cloudflare Turnstile did not initialize.');
        }

        container.replaceChildren();
        widgetId = window.turnstile.render(container, {
          sitekey: __TURNSTILE_SITE_KEY__,
          action,
          callback: (token) => {
            if (!cancelled) onTokenRef.current(token);
          },
          'expired-callback': () => {
            if (!cancelled) onTokenRef.current('');
          },
          'error-callback': () => {
            if (cancelled) return;
            onTokenRef.current('');
            notifyUnavailable();
          },
          theme: 'light',
        });
      } catch {
        if (cancelled) return;
        invalidateExternalScript(scriptId);
        onTokenRef.current('');
        container.replaceChildren();
        notifyUnavailable();
      }
    };

    void initialize();

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
      container.replaceChildren();
    };
  }, [action]);

  if (!__TURNSTILE_SITE_KEY__) {
    return (
      <div className={cn({ unavailable: true })} role="status">
        {t('captcha.configurationRequired')}
      </div>
    );
  }

  return <div ref={containerRef} className={cn()} />;
};

export { Captcha };
