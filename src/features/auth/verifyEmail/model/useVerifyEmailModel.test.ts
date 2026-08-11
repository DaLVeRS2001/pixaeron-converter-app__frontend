import { renderHook, waitFor } from '@testing-library/react';

import { useVerifyEmailModel } from './useVerifyEmailModel';

const mockVerifyEmail = jest.fn();
let mockTranslation = (key: string) => `en:${key}`;

jest.mock('@apollo/client/react', () => ({
  useMutation: () => [mockVerifyEmail],
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockTranslation }),
}));

jest.mock('react-router-dom', () => ({
  useLocation: () => ({ state: null }),
}));

describe('useVerifyEmailModel', () => {
  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem('pendingVerificationEmail', 'user@example.com');
    window.history.replaceState(null, '', '/verify-email#token=verification-token');
    mockTranslation = (key: string) => `en:${key}`;
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
});
