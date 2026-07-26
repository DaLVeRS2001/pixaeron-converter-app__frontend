import { loadExternalScript } from './loadExternalScript';

describe('loadExternalScript', () => {
  afterEach(() => {
    document.head.querySelectorAll('[data-external-script-status]').forEach((node) => {
      node.remove();
    });
    jest.useRealTimers();
  });

  it('shares a request and reuses a successfully loaded script', async () => {
    const options = {
      id: 'shared-script',
      retries: 0,
      src: 'https://example.com/sdk.js',
    };
    const first = loadExternalScript(options);
    const second = loadExternalScript(options);
    const script = document.getElementById(options.id);

    expect(first).toBe(second);
    script?.dispatchEvent(new Event('load'));
    await expect(first).resolves.toBeUndefined();
    await expect(second).resolves.toBeUndefined();
    await expect(loadExternalScript(options)).resolves.toBeUndefined();
    expect(document.querySelectorAll(`#${options.id}`)).toHaveLength(1);
  });

  it('removes a failed script so a later call can retry', async () => {
    const options = {
      id: 'retryable-script',
      retries: 0,
      src: 'https://example.com/retry.js',
    };
    const first = loadExternalScript(options);
    document.getElementById(options.id)?.dispatchEvent(new Event('error'));

    await expect(first).rejects.toThrow('Failed to load');
    expect(document.getElementById(options.id)).toBeNull();

    const retry = loadExternalScript(options);
    document.getElementById(options.id)?.dispatchEvent(new Event('load'));
    await expect(retry).resolves.toBeUndefined();
  });

  it('fails and removes the script after the configured timeout', async () => {
    jest.useFakeTimers();
    const request = loadExternalScript({
      id: 'timed-out-script',
      retries: 0,
      src: 'https://example.com/timeout.js',
      timeoutMs: 50,
    });

    jest.advanceTimersByTime(50);

    await expect(request).rejects.toThrow('timed out');
    expect(document.getElementById('timed-out-script')).toBeNull();
  });
});
