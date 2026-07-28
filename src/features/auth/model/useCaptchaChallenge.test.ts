import { act, renderHook } from '@testing-library/react';

import { useCaptchaChallenge } from './useCaptchaChallenge';

describe('useCaptchaChallenge', () => {
  it('returns a pending intent exactly once and closes the challenge', () => {
    const { result } = renderHook(() => useCaptchaChallenge<{ email: string }>());

    act(() => result.current.activate('login', { email: 'user@example.com' }));

    let firstIntent: { email: string } | undefined;
    let secondIntent: { email: string } | undefined;
    act(() => {
      firstIntent = result.current.receiveToken('captcha-token');
      secondIntent = result.current.receiveToken('captcha-token');
    });

    expect(firstIntent).toEqual({ email: 'user@example.com' });
    expect(secondIntent).toBeUndefined();
    expect(result.current.challenge).toBeUndefined();
  });

  it('increments the version when the same challenge is restarted', () => {
    const { result } = renderHook(() => useCaptchaChallenge<string>());

    act(() => result.current.activate('login', 'first attempt'));
    expect(result.current.challenge).toEqual({ action: 'login', version: 1 });

    act(() => result.current.activate('login', 'second attempt'));
    expect(result.current.challenge).toEqual({ action: 'login', version: 2 });
  });

  it('drops the pending intent when the challenge is cleared', () => {
    const { result } = renderHook(() => useCaptchaChallenge<string>());

    act(() => result.current.activate('forgot_password', 'user@example.com'));
    act(() => result.current.clear());

    let intent: string | undefined;
    act(() => {
      intent = result.current.receiveToken('late-token');
    });
    expect(intent).toBeUndefined();
  });
});
