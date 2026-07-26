import { act, renderHook } from '@testing-library/react';

import { useCaptchaChallenge } from './useCaptchaChallenge';

describe('useCaptchaChallenge', () => {
  it('returns a pending intent exactly once when a token arrives', () => {
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
  });

  it('stores a proactive token until the matching action consumes it', () => {
    const { result } = renderHook(() => useCaptchaChallenge<never>());

    act(() => result.current.activate('register'));
    act(() => {
      expect(result.current.receiveToken('captcha-token')).toBeUndefined();
    });

    expect(result.current.consumeToken('google_login')).toBeUndefined();
    expect(result.current.consumeToken('register')).toBe('captcha-token');
    expect(result.current.consumeToken('register')).toBeUndefined();
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
