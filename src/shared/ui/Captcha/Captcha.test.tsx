import { render, waitFor } from '@testing-library/react';

import { Captcha } from './Captcha';

const mockInvalidateExternalScript = jest.fn();
const mockLoadExternalScript = jest.fn();

jest.mock('shared/lib', () => ({
  invalidateExternalScript: (...args: unknown[]) => mockInvalidateExternalScript(...args),
  loadExternalScript: (...args: unknown[]) => mockLoadExternalScript(...args),
}));

type TurnstileOptions = Parameters<NonNullable<Window['turnstile']>['render']>[1];

describe('Captcha', () => {
  beforeEach(() => {
    Object.assign(globalThis, { __TURNSTILE_SITE_KEY__: 'turnstile-site-key' });
    delete window.turnstile;
  });

  afterEach(() => {
    Object.assign(globalThis, { __TURNSTILE_SITE_KEY__: '' });
    delete window.turnstile;
  });

  it('reports an unavailable SDK after loader failure', async () => {
    const onUnavailable = jest.fn();
    mockLoadExternalScript.mockRejectedValue(new Error('sdk failed'));

    render(<Captcha action="login" onToken={jest.fn()} onUnavailable={onUnavailable} />);

    await waitFor(() => expect(onUnavailable).toHaveBeenCalledTimes(1));
    expect(mockInvalidateExternalScript).toHaveBeenCalledWith('cloudflare-turnstile-script');
  });

  it('ignores callbacks from replaced and unmounted widgets', async () => {
    const callbacks: TurnstileOptions[] = [];
    const remove = jest.fn();
    window.turnstile = {
      remove,
      reset: jest.fn(),
      render: jest.fn((_element, options) => {
        callbacks.push(options);
        return `widget-${callbacks.length}`;
      }),
    };
    const onToken = jest.fn();
    const onUnavailable = jest.fn();
    const { rerender, unmount } = render(
      <Captcha action="login" onToken={onToken} onUnavailable={onUnavailable} />
    );
    await waitFor(() => expect(callbacks).toHaveLength(1));

    rerender(
      <Captcha action="forgot_password" onToken={onToken} onUnavailable={onUnavailable} />
    );
    await waitFor(() => expect(callbacks).toHaveLength(2));
    callbacks[0].callback('stale-token');
    callbacks[1].callback('fresh-token');

    expect(onToken).toHaveBeenCalledTimes(1);
    expect(onToken).toHaveBeenCalledWith('fresh-token');
    expect(remove).toHaveBeenCalledWith('widget-1');

    unmount();
    callbacks[1]['error-callback']();
    expect(onUnavailable).not.toHaveBeenCalled();
  });
});
