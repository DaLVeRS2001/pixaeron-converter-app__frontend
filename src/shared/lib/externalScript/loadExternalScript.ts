type LoadExternalScriptOptions = {
  id: string;
  src: string;
  timeoutMs?: number;
  retries?: number;
};

const scriptRequests = new Map<string, Promise<void>>();
const statusAttribute = 'externalScriptStatus';

const loadAttempt = ({ id, src, timeoutMs = 10_000 }: LoadExternalScriptOptions) =>
  new Promise<void>((resolve, reject) => {
    const absoluteSrc = new URL(src, document.baseURI).href;
    let script = document.getElementById(id) as HTMLScriptElement | null;

    if (script && script.src !== absoluteSrc) {
      reject(new Error(`External script id "${id}" is already used by another source.`));
      return;
    }

    if (script?.dataset[statusAttribute] === 'ready') {
      resolve();
      return;
    }

    script?.remove();
    script = document.createElement('script');
    script.id = id;
    script.src = absoluteSrc;
    script.async = true;
    script.defer = true;
    script.dataset[statusAttribute] = 'loading';

    const cleanup = () => {
      window.clearTimeout(timeout);
      script?.removeEventListener('load', handleLoad);
      script?.removeEventListener('error', handleError);
    };
    const fail = (error: Error) => {
      cleanup();
      if (script) {
        script.dataset[statusAttribute] = 'failed';
        script.remove();
      }
      reject(error);
    };
    const handleLoad = () => {
      cleanup();
      if (script) script.dataset[statusAttribute] = 'ready';
      resolve();
    };
    const handleError = () => fail(new Error(`Failed to load external script "${id}".`));
    const timeout = window.setTimeout(
      () => fail(new Error(`External script "${id}" timed out.`)),
      timeoutMs
    );

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });
    document.head.appendChild(script);
  });

const loadExternalScript = ({
  retries = 1,
  ...options
}: LoadExternalScriptOptions): Promise<void> => {
  const existingRequest = scriptRequests.get(options.id);
  if (existingRequest) return existingRequest;

  const request = (async () => {
    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        await loadAttempt(options);
        return;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error(`Failed to load external script "${options.id}".`);
  })();

  scriptRequests.set(options.id, request);
  void request
    .finally(() => {
      if (scriptRequests.get(options.id) === request) {
        scriptRequests.delete(options.id);
      }
    })
    .catch(() => undefined);

  return request;
};

const invalidateExternalScript = (id: string) => {
  scriptRequests.delete(id);
  document.getElementById(id)?.remove();
};

export { invalidateExternalScript, loadExternalScript };
export type { LoadExternalScriptOptions };
