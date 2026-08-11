import { renderHook, waitFor } from '@testing-library/react';

import type { CurrentUserState } from 'entities/user';

import { useVerifyEmailModel } from './useVerifyEmailModel';

const mockVerifyEmail = jest.fn();
let mockTranslation = (key: string) => `en:${key}`;
let mockSession: CurrentUserState = { status: 'guest', user: undefined };

jest.mock('@apollo/client/react', () => ({
  useMutation: () => [mockVerifyEmail],
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockTranslation }),
}));

jest.mock('react-router-dom', () => ({
  useLocation: () => ({ state: null }),
}));

jest.mock('entities/user', () => ({
  useCurrentUser: () => mockSession,
}));

const authenticated = (emailVerified: boolean): CurrentUserState => ({
  status: 'authenticated',
  user: { id: '1', email: 'user@example.com', username: 'user', emailVerified },
});

describe('useVerifyEmailModel', () => {
  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem('pendingVerificationEmail', 'user@example.com');
    window.history.replaceState(null, '', '/verify-email#token=verification-token');
    mockTranslation = (key: string) => `en:${key}`;
    mockSession = { status: 'guest', user: undefined };
    mockVerifyEmail.mockResolvedValue({
      data: { verifyEmail: { status: 'VERIFIED' } },
    });
  });

  it('executes verification once when translations change', async () => {
    const { rerender, result } = renderHook(() => useVerifyEmailModel());

    await waitFor(() => expect(result.current.status).toBe('VERIFIED'));
    expect(mockVerifyEmail).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem('pendingVerificationEmail')).toBeNull();

    mockTranslation = (key: string) => `ru:${key}`;
    rerender();

    await waitFor(() => expect(result.current.status).toBe('VERIFIED'));
    expect(mockVerifyEmail).toHaveBeenCalledTimes(1);
  });

  it('clears the pending email when it was already verified', async () => {
    mockVerifyEmail.mockResolvedValueOnce({
      data: { verifyEmail: { status: 'ALREADY_VERIFIED' } },
    });

    const { result } = renderHook(() => useVerifyEmailModel());

    await waitFor(() => expect(result.current.status).toBe('ALREADY_VERIFIED'));
    expect(sessionStorage.getItem('pendingVerificationEmail')).toBeNull();
  });

  it('reports a confirmed signed-in user without a token as already verified', () => {
    window.history.replaceState(null, '', '/verify-email');
    mockSession = authenticated(true);

    const { result } = renderHook(() => useVerifyEmailModel());

    expect(result.current.status).toBe('ALREADY_VERIFIED');
    expect(result.current.verified).toBe(true);
    expect(mockVerifyEmail).not.toHaveBeenCalled();
  });

  it('leaves an unconfirmed signed-in user on the resend form', () => {
    window.history.replaceState(null, '', '/verify-email');
    mockSession = authenticated(false);

    const { result } = renderHook(() => useVerifyEmailModel());

    expect(result.current.status).toBe('CHECK_EMAIL');
    expect(result.current.verified).toBe(false);
  });

  it('keeps a guest on the resend form', () => {
    window.history.replaceState(null, '', '/verify-email');

    const { result } = renderHook(() => useVerifyEmailModel());

    expect(result.current.status).toBe('CHECK_EMAIL');
    expect(result.current.verified).toBe(false);
  });

  it('lets a failed token outcome win over the session state', async () => {
    mockSession = authenticated(true);
    mockVerifyEmail.mockResolvedValueOnce({
      data: { verifyEmail: { status: 'INVALID' } },
    });

    const { result } = renderHook(() => useVerifyEmailModel());

    await waitFor(() => expect(result.current.status).toBe('INVALID'));
    expect(result.current.verified).toBe(false);
  });
});
