import { act, render, screen, waitFor } from '@testing-library/react';

import { GoogleButton } from './GoogleButton';

const mockInvalidateExternalScript = jest.fn();
const mockLoadExternalScript = jest.fn();

jest.mock('shared/lib', () => ({
  invalidateExternalScript: (...args: unknown[]) => mockInvalidateExternalScript(...args),
  loadExternalScript: (...args: unknown[]) => mockLoadExternalScript(...args),
}));

jest.mock('shared/config/theme', () => ({
  useTheme: () => ({ theme: 'light', setTheme: jest.fn() }),
}));

describe('GoogleButton', () => {
  beforeEach(() => {
    Object.assign(globalThis, { __GOOGLE_CLIENT_ID__: 'google-client-id' });
    delete window.google;
  });

  afterEach(() => {
    Object.assign(globalThis, { __GOOGLE_CLIENT_ID__: '' });
    delete window.google;
  });

  it('reports a failed SDK load and drops the button with its caption', async () => {
    const onUnavailable = jest.fn();
    mockLoadExternalScript.mockRejectedValue(new Error('sdk failed'));

    const { container } = render(
      <GoogleButton
        caption="consent line"
        onCredential={jest.fn()}
        onUnavailable={onUnavailable}
      />
    );

    await waitFor(() => expect(onUnavailable).toHaveBeenCalledTimes(1));
    expect(mockInvalidateExternalScript).toHaveBeenCalledWith('google-identity-script');
    expect(screen.queryByText('consent line')).not.toBeInTheDocument();
    expect(container.querySelector('.google-button')).not.toBeInTheDocument();
  });

  it('does not initialize or invoke callbacks after unmount', async () => {
    let resolveScript: (() => void) | undefined;
    mockLoadExternalScript.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveScript = resolve;
      })
    );
    const initialize = jest.fn();
    const onCredential = jest.fn();
    const onUnavailable = jest.fn();
    const { unmount } = render(
      <GoogleButton
        caption="consent line"
        onCredential={onCredential}
        onUnavailable={onUnavailable}
      />
    );

    unmount();
    window.google = {
      accounts: { id: { initialize, renderButton: jest.fn() } },
    };
    await act(async () => resolveScript?.());

    expect(initialize).not.toHaveBeenCalled();
    expect(onCredential).not.toHaveBeenCalled();
    expect(onUnavailable).not.toHaveBeenCalled();
  });

  it('initializes Google Identity once across auth route changes', async () => {
    let receiveCredential: ((response: { credential: string }) => void) | undefined;
    const initialize = jest.fn(
      (options: { callback: (response: { credential: string }) => void }) => {
        receiveCredential = options.callback;
      }
    );
    const renderButton = jest.fn();
    window.google = { accounts: { id: { initialize, renderButton } } };
    const firstOnCredential = jest.fn();
    const first = render(
      <GoogleButton caption="consent line" onCredential={firstOnCredential} />
    );

    await waitFor(() => expect(initialize).toHaveBeenCalledTimes(1));
    first.unmount();

    const secondOnCredential = jest.fn();
    render(<GoogleButton caption="consent line" onCredential={secondOnCredential} />);

    await waitFor(() => expect(renderButton).toHaveBeenCalledTimes(2));
    expect(renderButton).toHaveBeenLastCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ text: 'continue_with', locale: 'en' })
    );
    expect(screen.getByText('consent line')).toBeInTheDocument();
    act(() => receiveCredential?.({ credential: 'id-token' }));

    expect(initialize).toHaveBeenCalledTimes(1);
    expect(firstOnCredential).not.toHaveBeenCalled();
    expect(secondOnCredential).toHaveBeenCalledWith('id-token');
  });
});
